import { describe, expect, it } from "vitest";
import { buildStoreQuery, normalizeStores } from "../lib/overpass";

describe("buildStoreQuery", () => {
  it("builds one union query from the selected registry entries", () => {
    const query = buildStoreQuery(["seven-eleven", "inthanin"], { lat: 13.75, lng: 100.5 }, 3000);
    expect(query).toContain('["shop"="convenience"]["brand"~"7-Eleven",i](around:3000,13.75,100.5)');
    expect(query).toContain('["amenity"="cafe"]["brand"~"Inthanin|อินทนิล",i](around:3000,13.75,100.5)');
  });

  it("marks a paired store as inside a nearby matching fuel station", () => {
    const center = { lat: 13.75, lng: 100.5 };
    const stores = normalizeStores([
      { id: 1, lat: 13.75, lon: 100.5, tags: { amenity: "fuel", brand: "PTT" } },
      { id: 2, lat: 13.7502, lon: 100.5002, tags: { amenity: "cafe", brand: "Café Amazon" } },
    ], center);
    const cafeAmazon = stores.find((store) => store.brandId === "cafe-amazon");
    expect(cafeAmazon?.inFuelStation).toBe(true);
  });

  it("does not mark a store as inside a fuel station when it is beyond the proximity threshold", () => {
    const center = { lat: 13.75, lng: 100.5 };
    const stores = normalizeStores([
      { id: 1, lat: 13.75, lon: 100.5, tags: { amenity: "fuel", brand: "PTT" } },
      { id: 2, lat: 13.76, lon: 100.51, tags: { amenity: "cafe", brand: "Café Amazon" } },
    ], center);
    const cafeAmazon = stores.find((store) => store.brandId === "cafe-amazon");
    expect(cafeAmazon?.inFuelStation).toBe(false);
  });

  it("does not mark a store as inside a fuel station whose brand does not pair with it", () => {
    const center = { lat: 13.75, lng: 100.5 };
    const stores = normalizeStores([
      { id: 1, lat: 13.75, lon: 100.5, tags: { amenity: "fuel", brand: "Bangchak" } },
      { id: 2, lat: 13.7502, lon: 100.5002, tags: { amenity: "cafe", brand: "Café Amazon" } },
    ], center);
    const cafeAmazon = stores.find((store) => store.brandId === "cafe-amazon");
    expect(cafeAmazon?.inFuelStation).toBe(false);
  });

  it("also surfaces the fuel station itself as a PTT store now that PTT is a searchable brand", () => {
    const center = { lat: 13.75, lng: 100.5 };
    const stores = normalizeStores([
      { id: 1, lat: 13.75, lon: 100.5, tags: { amenity: "fuel", brand: "PTT" } },
      { id: 2, lat: 13.7502, lon: 100.5002, tags: { amenity: "cafe", brand: "Café Amazon" } },
    ], center);
    const pttStore = stores.find((store) => store.brandId === "ptt");
    expect(pttStore).toBeDefined();
    expect(pttStore?.inFuelStation).toBe(false);
  });
});
