import { enabledBrands, getBrand } from "./brands";
import { distanceKm } from "./distance";
import { queryOverpass } from "./overpass";
import type { BrandId, Coordinates, Store } from "./types";

export type FuelBrand = "PTT" | "Bangchak" | "PT" | "Caltex";
export type FuelStation = Coordinates & { id: string; name: string; brand: FuelBrand; distanceKm: number; openingHours?: string; hasParking?: boolean; hasToilets?: boolean; hasEv?: boolean };
export type FuelCombo = FuelStation & { pairedStores: Store[] };

// สเปก spec/modules/05-gas-station-combo.md แนะนำเริ่มทดสอบที่ 50-80 เมตร ยังไม่ verify กับข้อมูลจริง
export const FUEL_PROXIMITY_THRESHOLD_METERS = 80;

// Caltex/Star Petroleum: ชื่อแบรนด์ OSM หลัง rebrand ยังไม่ verify (spec/klai-spec.md Open Questions) จึงรองรับทั้งสองชื่อ
export const fuelPatterns: Record<FuelBrand, string> = { PTT: "PTT|ปตท", Bangchak: "Bangchak|บางจาก", PT: "^PT$|PT Station|พีที", Caltex: "Caltex|Star Petroleum|^Star$" };

// ตาม spec/modules/05-gas-station-combo.md: มีแค่ PTT ที่ผ่าน prototype จริง คู่อื่นยังไม่ verify กับข้อมูล OSM จริง ห้ามให้ผู้ใช้เลือกได้
export const provenFuelPairs: FuelBrand[] = ["PTT"];

export function isProvenFuelPair(brand: FuelBrand): boolean {
  return provenFuelPairs.includes(brand);
}

export function identifyFuelBrand(tags: Record<string, string>): FuelBrand | null {
  const text = `${tags.brand ?? ""} ${tags.name ?? ""}`.trim();
  return (Object.keys(fuelPatterns) as FuelBrand[]).find((brand) => new RegExp(fuelPatterns[brand], "i").test(text)) ?? null;
}

export function matchFuelCombos(fuels: FuelStation[], stores: Store[], thresholdMeters: number): FuelCombo[] {
  return fuels.flatMap((fuel) => {
    const pairedStores = stores.filter((store) => getBrand(store.brandId).fuelBrandPair === fuel.brand && distanceKm(fuel, store) * 1000 <= thresholdMeters);
    return pairedStores.length ? [{ ...fuel, pairedStores }] : [];
  }).sort((a, b) => a.distanceKm - b.distanceKm);
}

export async function fetchFuelCombos(pairs: FuelBrand[], center: Coordinates, radiusMeters: number, thresholdMeters = FUEL_PROXIMITY_THRESHOLD_METERS, signal?: AbortSignal) {
  const provenPairs = pairs.filter(isProvenFuelPair);
  // แบรนด์ที่เข้า combo ต้องมี pattern เสมอ (หมวดไร้แบรนด์อย่าง EV charging ไม่มีคู่ปั๊มอยู่แล้ว)
  const storeBrands = enabledBrands.filter((brand) => brand.osmBrandPattern && brand.fuelBrandPair && provenPairs.includes(brand.fuelBrandPair));
  const fuelLines = provenPairs.map((pair) => `  nwr["amenity"="fuel"]["brand"~"${fuelPatterns[pair]}",i](around:${radiusMeters},${center.lat},${center.lng});`);
  const storeLines = storeBrands.map((brand) => `  nwr["${brand.osmKey}"${brand.osmValue.includes("|") ? "~" : "="}"${brand.osmValue}"]["brand"~"${brand.osmBrandPattern}",i](around:${radiusMeters},${center.lat},${center.lng});`);
  const query = `[out:json][timeout:25];\n(\n${[...fuelLines, ...storeLines].join("\n")}\n);\nout center tags;`;
  return queryOverpass(query, (data) => {
    const fuels: FuelStation[] = [];
    const stores: Store[] = [];
    for (const element of data.elements) {
      const lat = element.lat ?? element.center?.lat; const lng = element.lon ?? element.center?.lon; const tags = element.tags ?? {};
      if (lat == null || lng == null) continue;
      if (tags.amenity === "fuel") {
        const brand = identifyFuelBrand(tags);
        if (brand && provenPairs.includes(brand)) fuels.push({ id: String(element.id), name: tags.name || `${brand} Station`, brand, lat, lng, distanceKm: distanceKm(center, { lat, lng }), openingHours: tags.opening_hours, hasParking: tags.parking === "yes", hasToilets: tags.toilets === "yes", hasEv: tags["fuel:electricity"] === "yes" });
        continue;
      }
      const text = `${tags.brand ?? ""} ${tags.name ?? ""}`;
      const storeBrand = storeBrands.find((brand) => brand.osmBrandPattern && new RegExp(brand.osmBrandPattern, "i").test(text));
      if (storeBrand) stores.push({ id: String(element.id), name: tags.name || storeBrand.name, brandId: storeBrand.id as BrandId, lat, lng, distanceKm: distanceKm(center, { lat, lng }), openingHours: tags.opening_hours, is24Hours: tags.opening_hours === "24/7", hasParking: tags.parking === "yes", hasAtm: tags.atm === "yes", inFuelStation: true });
    }
    return matchFuelCombos(fuels, stores, thresholdMeters);
  }, signal);
}
