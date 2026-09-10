import { enabledBrands, getBrand } from "./brands";
import { distanceKm } from "./distance";
import type { BrandId, Coordinates, Store } from "./types";

export type FuelBrand = "PTT" | "Bangchak" | "PT";
export type FuelStation = Coordinates & { id: string; name: string; brand: FuelBrand; distanceKm: number; openingHours?: string; hasParking?: boolean; hasToilets?: boolean; hasEv?: boolean };
export type FuelCombo = FuelStation & { pairedStores: Store[] };

const fuelPatterns: Record<FuelBrand, string> = { PTT: "PTT|ปตท", Bangchak: "Bangchak|บางจาก", PT: "^PT$|PT Station|พีที" };

export function matchFuelCombos(fuels: FuelStation[], stores: Store[], thresholdMeters: number): FuelCombo[] {
  return fuels.flatMap((fuel) => {
    const pairedStores = stores.filter((store) => getBrand(store.brandId).fuelBrandPair === fuel.brand && distanceKm(fuel, store) * 1000 <= thresholdMeters);
    return pairedStores.length ? [{ ...fuel, pairedStores }] : [];
  }).sort((a, b) => a.distanceKm - b.distanceKm);
}

type Element = { id: number; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> };

export async function fetchFuelCombos(pairs: FuelBrand[], center: Coordinates, radiusMeters: number, thresholdMeters = 80, signal?: AbortSignal) {
  const storeBrands = enabledBrands.filter((brand) => brand.fuelBrandPair && pairs.includes(brand.fuelBrandPair));
  const fuelLines = pairs.map((pair) => `  nwr["amenity"="fuel"]["brand"~"${fuelPatterns[pair]}",i](around:${radiusMeters},${center.lat},${center.lng});`);
  const storeLines = storeBrands.map((brand) => `  nwr["${brand.osmKey}"${brand.osmValue.includes("|") ? "~" : "="}"${brand.osmValue}"]["brand"~"${brand.osmBrandPattern}",i](around:${radiusMeters},${center.lat},${center.lng});`);
  const query = `[out:json][timeout:25];\n(\n${[...fuelLines, ...storeLines].join("\n")}\n);\nout center tags;`;
  const response = await fetch("https://overpass-api.de/api/interpreter", { method: "POST", body: new URLSearchParams({ data: query }), signal });
  if (!response.ok) throw new Error(`Overpass ตอบกลับ ${response.status}`);
  const data = (await response.json()) as { elements: Element[] };
  const fuels: FuelStation[] = [];
  const stores: Store[] = [];
  for (const element of data.elements) {
    const lat = element.lat ?? element.center?.lat; const lng = element.lon ?? element.center?.lon; const tags = element.tags ?? {};
    if (lat == null || lng == null) continue;
    if (tags.amenity === "fuel") {
      const text = `${tags.brand ?? ""} ${tags.name ?? ""}`;
      const brand = pairs.find((pair) => new RegExp(fuelPatterns[pair], "i").test(text));
      if (brand) fuels.push({ id: String(element.id), name: tags.name || `${brand} Station`, brand, lat, lng, distanceKm: distanceKm(center, { lat, lng }), openingHours: tags.opening_hours, hasParking: tags.parking === "yes", hasToilets: tags.toilets === "yes", hasEv: tags["fuel:electricity"] === "yes" });
      continue;
    }
    const text = `${tags.brand ?? ""} ${tags.name ?? ""}`;
    const storeBrand = storeBrands.find((brand) => new RegExp(brand.osmBrandPattern, "i").test(text));
    if (storeBrand) stores.push({ id: String(element.id), name: tags.name || storeBrand.name, brandId: storeBrand.id as BrandId, lat, lng, distanceKm: distanceKm(center, { lat, lng }), openingHours: tags.opening_hours, is24Hours: tags.opening_hours === "24/7", hasParking: tags.parking === "yes", hasAtm: tags.atm === "yes", inFuelStation: true });
  }
  return matchFuelCombos(fuels, stores, thresholdMeters);
}
