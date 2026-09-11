import { enabledBrands, getBrand } from "./brands";
import { distanceKm } from "./distance";
import type { BrandId, Coordinates, Store } from "./types";
import { FUEL_PROXIMITY_THRESHOLD_METERS, fuelPatterns, identifyFuelBrand, type FuelBrand } from "./combo";

const ENDPOINTS = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"];

export type OverpassElement = { id: number; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> };

// ยิงทุก endpoint พร้อมกันแล้วใช้ผลลัพธ์ที่สำเร็จก่อน แทนการรอ endpoint แรก timeout ก่อนค่อยลองตัวถัดไป
export async function queryOverpass<T>(query: string, parse: (data: { elements: OverpassElement[] }) => T, signal?: AbortSignal): Promise<T> {
  const controller = new AbortController();
  const forwardAbort = () => controller.abort();
  signal?.addEventListener("abort", forwardAbort);
  try {
    return await Promise.any(ENDPOINTS.map(async (endpoint) => {
      const response = await fetch(endpoint, { method: "POST", body: new URLSearchParams({ data: query }), signal: controller.signal });
      if (!response.ok) throw new Error(`Overpass ตอบกลับ ${response.status}`);
      return parse(await response.json());
    }));
  } catch (error) {
    if (signal?.aborted) throw error;
    if (error instanceof AggregateError) throw error.errors.find((item) => item instanceof Error) ?? new Error("ค้นหาร้านไม่สำเร็จ");
    throw error;
  } finally {
    controller.abort();
    signal?.removeEventListener("abort", forwardAbort);
  }
}

export function buildStoreQuery(brandIds: BrandId[], center: Coordinates, radiusMeters: number) {
  const lines = brandIds.map((id) => {
    const brand = getBrand(id);
    const valueOperator = brand.osmValue.includes("|") ? "~" : "=";
    return `  nwr["${brand.osmKey}"${valueOperator}"${brand.osmValue}"]["brand"~"${brand.osmBrandPattern}",i](around:${radiusMeters},${center.lat},${center.lng});`;
  });
  const fuelBrands = [...new Set(brandIds.map((id) => getBrand(id).fuelBrandPair).filter((value): value is FuelBrand => Boolean(value)))];
  const fuelLines = fuelBrands.map((brand) => `  nwr["amenity"="fuel"]["brand"~"${fuelPatterns[brand]}",i](around:${radiusMeters},${center.lat},${center.lng});`);
  return `[out:json][timeout:20];\n(\n${[...lines, ...fuelLines].join("\n")}\n);\nout center tags;`;
}

function identifyBrand(tags: Record<string, string>): BrandId | null {
  const haystack = `${tags.brand ?? ""} ${tags.name ?? ""}`;
  return enabledBrands.find((brand) => new RegExp(brand.osmBrandPattern, "i").test(haystack))?.id ?? null;
}

export function normalizeStores(elements: OverpassElement[], center: Coordinates): Store[] {
  const fuelStations = elements.flatMap((element) => {
    const lat = element.lat ?? element.center?.lat; const lng = element.lon ?? element.center?.lon;
    const brand = identifyFuelBrand(element.tags ?? {});
    return lat != null && lng != null && (element.tags ?? {}).amenity === "fuel" && brand ? [{ lat, lng, brand }] : [];
  });
  return elements.flatMap((element) => {
    const lat = element.lat ?? element.center?.lat;
    const lng = element.lon ?? element.center?.lon;
    const tags = element.tags ?? {};
    const brandId = identifyBrand(tags);
    if (lat == null || lng == null || !brandId) return [];
    return [{
      id: String(element.id), lat, lng, brandId,
      name: tags.name || getBrand(brandId).name,
      address: [tags["addr:housenumber"], tags["addr:street"], tags["addr:subdistrict"]].filter(Boolean).join(" "),
      openingHours: tags.opening_hours,
      distanceKm: distanceKm(center, { lat, lng }),
      is24Hours: tags.opening_hours === "24/7",
      hasParking: tags.parking === "yes" || tags["amenity:parking"] === "yes",
      hasAtm: tags.atm === "yes",
      inFuelStation: false,
    }];
  }).map((store) => ({ ...store, inFuelStation: fuelStations.some((fuel) => fuel.brand === getBrand(store.brandId).fuelBrandPair && distanceKm(store, fuel) * 1000 <= FUEL_PROXIMITY_THRESHOLD_METERS) })).sort((a, b) => a.distanceKm - b.distanceKm);
}

// ไม่รวม radius ใน key: cache ที่รัศมีกว้างกว่าครอบคลุมคำขอที่รัศมีแคบกว่าอยู่แล้ว กรองฝั่ง client ได้โดยไม่ยิงซ้ำ
const cacheKeyFor = (brandIds: BrandId[], center: Coordinates) =>
  `klai:stores:${brandIds.slice().sort().join(",")}:${center.lat.toFixed(3)}:${center.lng.toFixed(3)}`;

export async function fetchStores(brandIds: BrandId[], center: Coordinates, radiusMeters: number, signal?: AbortSignal) {
  const cacheKey = cacheKeyFor(brandIds, center);
  const radiusKm = radiusMeters / 1000;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached) as { savedAt: number; radiusMeters: number; stores: Store[] };
      const fresh = Date.now() - parsed.savedAt < 5 * 60_000;
      if (fresh && parsed.radiusMeters >= radiusMeters) return parsed.stores.filter((store) => store.distanceKm <= radiusKm);
    }
  } catch { /* storage is optional */ }

  const query = buildStoreQuery(brandIds, center, radiusMeters);
  const stores = await queryOverpass(query, (data) => normalizeStores(data.elements, center), signal);
  try { localStorage.setItem(cacheKey, JSON.stringify({ savedAt: Date.now(), radiusMeters, stores })); } catch { /* storage is optional */ }
  return stores;
}
