import { afterEach, describe, expect, it, vi } from "vitest";
import { buildStoreQuery, fetchStores, normalizeStores, queryOverpass } from "../lib/overpass";

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

describe("queryOverpass", () => {
  afterEach(() => { vi.unstubAllGlobals(); });

  it("resolves with whichever endpoint responds successfully first, without waiting for the slower one", async () => {
    const fetchMock = vi.fn()
      .mockImplementationOnce(() => new Promise((resolve) => setTimeout(() => resolve(new Response(JSON.stringify({ elements: [] }))), 50)))
      .mockImplementationOnce(() => Promise.resolve(new Response(JSON.stringify({ elements: [{ id: 1 }] }))));
    vi.stubGlobal("fetch", fetchMock);
    const result = await queryOverpass("query", (data) => data.elements.length);
    expect(result).toBe(1);
  });

  it("falls back to the next endpoint when the first one fails", async () => {
    const fetchMock = vi.fn()
      .mockImplementationOnce(() => Promise.reject(new TypeError("Failed to fetch")))
      .mockImplementationOnce(() => Promise.resolve(new Response(JSON.stringify({ elements: [{ id: 1 }] }))));
    vi.stubGlobal("fetch", fetchMock);
    const result = await queryOverpass("query", (data) => data.elements.length);
    expect(result).toBe(1);
  });

  it("throws when every endpoint fails", async () => {
    const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(new Response("", { status: 504 })));
    vi.stubGlobal("fetch", fetchMock);
    await expect(queryOverpass("query", (data) => data.elements.length)).rejects.toThrow("Overpass ตอบกลับ 504");
  });
});

describe("fetchStores caching", () => {
  const store = new Map<string, string>();
  const fakeLocalStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value); },
  };

  afterEach(() => { vi.unstubAllGlobals(); store.clear(); });

  it("reuses a wider-radius cache entry for a narrower request instead of refetching", async () => {
    const center = { lat: 13.75, lng: 100.5 };
    const elements = [{ id: 1, lat: 13.75, lon: 100.5, tags: { shop: "convenience", brand: "7-Eleven" } }];
    const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(new Response(JSON.stringify({ elements }))));
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("localStorage", fakeLocalStorage);

    await fetchStores(["seven-eleven"], center, 5000);
    expect(fetchMock).toHaveBeenCalledTimes(2); // both endpoints raced on the first call

    const stores = await fetchStores(["seven-eleven"], center, 1000);
    expect(fetchMock).toHaveBeenCalledTimes(2); // no new request for the narrower radius
    expect(stores).toHaveLength(1);
  });

  it("refetches when the requested radius is wider than what was cached", async () => {
    const center = { lat: 13.75, lng: 100.5 };
    const elements = [{ id: 1, lat: 13.75, lon: 100.5, tags: { shop: "convenience", brand: "7-Eleven" } }];
    const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(new Response(JSON.stringify({ elements }))));
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("localStorage", fakeLocalStorage);

    await fetchStores(["seven-eleven"], center, 1000);
    await fetchStores(["seven-eleven"], center, 5000);
    expect(fetchMock).toHaveBeenCalledTimes(4); // second call's wider radius forces a refetch (2 endpoints each)
  });
});
