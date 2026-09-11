import { afterEach, describe, expect, it, vi } from "vitest";
import { readFavorites, toggleFavorite, isFavorite, type FavoriteStore } from "../lib/favorites";

const fakeStorage = () => {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => { map.set(key, value); },
    map,
  };
};

const store: FavoriteStore = { id: "1", name: "7-Eleven อารีย์", brandId: "seven-eleven", lat: 13.78, lng: 100.54 };

describe("favorites storage", () => {
  afterEach(() => { vi.unstubAllGlobals(); });

  it("returns an empty list when nothing has been saved", () => {
    vi.stubGlobal("localStorage", fakeStorage());
    expect(readFavorites()).toEqual([]);
  });

  it("adds a store on first toggle and removes it on the second", () => {
    vi.stubGlobal("localStorage", fakeStorage());
    expect(toggleFavorite(store)).toEqual([store]);
    expect(readFavorites()).toEqual([store]);
    expect(toggleFavorite(store)).toEqual([]);
    expect(readFavorites()).toEqual([]);
  });

  it("reports whether a given store id is saved", () => {
    vi.stubGlobal("localStorage", fakeStorage());
    expect(isFavorite(readFavorites(), "1")).toBe(false);
    toggleFavorite(store);
    expect(isFavorite(readFavorites(), "1")).toBe(true);
  });

  it("keeps other saved stores intact when one is removed", () => {
    vi.stubGlobal("localStorage", fakeStorage());
    const other: FavoriteStore = { id: "2", name: "Café Amazon", brandId: "cafe-amazon", lat: 13.79, lng: 100.55 };
    toggleFavorite(store);
    toggleFavorite(other);
    expect(toggleFavorite(store).map((item) => item.id)).toEqual(["2"]);
  });

  it("survives corrupted storage contents instead of throwing", () => {
    const storage = fakeStorage();
    storage.map.set("klai:favorites", "not json at all");
    vi.stubGlobal("localStorage", storage);
    expect(readFavorites()).toEqual([]);
  });

  it("treats storage being unavailable as an empty list", () => {
    vi.stubGlobal("localStorage", undefined);
    expect(readFavorites()).toEqual([]);
  });
});
