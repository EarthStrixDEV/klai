import { enabledBrands, getBrand } from "./brands";
import { distanceKm } from "./distance";
import type { BrandId, Coordinates, Store } from "./types";

const ENDPOINTS = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"];

export function buildStoreQuery(brandIds: string[], center: Coordinates, radiusMeters: number) {
  const lines = brandIds.map((id) => {
    const brand = getBrand(id);
    const valueOperator = brand.osmValue.includes("|") ? "~" : "=";
    return `  nwr["${brand.osmKey}"${valueOperator}"${brand.osmValue}"]["brand"~"${brand.osmBrandPattern}",i](around:${radiusMeters},${center.lat},${center.lng});`;
  });
  return `[out:json][timeout:20];\n(\n${lines.join("\n")}\n);\nout center tags;`;
}

type OverpassElement = { id: number; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> };

function identifyBrand(tags: Record<string, string>): BrandId | null {
  const haystack = `${tags.brand ?? ""} ${tags.name ?? ""}`;
  return enabledBrands.find((brand) => new RegExp(brand.osmBrandPattern, "i").test(haystack))?.id ?? null;
}

export function normalizeStores(elements: OverpassElement[], center: Coordinates): Store[] {
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
      inFuelStation: Boolean(tags["fuel:brand"] || tags["addr:place"]?.toLowerCase().includes("station")),
    }];
  }).sort((a, b) => a.distanceKm - b.distanceKm);
}

export async function fetchStores(brandIds: BrandId[], center: Coordinates, radiusMeters: number, signal?: AbortSignal) {
  const cacheKey = `klai:stores:${brandIds.slice().sort().join(",")}:${center.lat.toFixed(3)}:${center.lng.toFixed(3)}:${radiusMeters}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached) as { savedAt: number; stores: Store[] };
      if (Date.now() - parsed.savedAt < 5 * 60_000) return parsed.stores;
    }
  } catch { /* storage is optional */ }

  const query = buildStoreQuery(brandIds, center, radiusMeters);
  let lastError: unknown;
  for (const endpoint of ENDPOINTS) {
    try {
      const response = await fetch(endpoint, { method: "POST", body: new URLSearchParams({ data: query }), signal });
      if (!response.ok) throw new Error(`Overpass ตอบกลับ ${response.status}`);
      const data = (await response.json()) as { elements: OverpassElement[] };
      const stores = normalizeStores(data.elements, center);
      try { localStorage.setItem(cacheKey, JSON.stringify({ savedAt: Date.now(), stores })); } catch { /* storage is optional */ }
      return stores;
    } catch (error) {
      if (signal?.aborted) throw error;
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("ค้นหาร้านไม่สำเร็จ");
}
