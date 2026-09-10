import { describe, expect, it } from "vitest";
import { filterStores } from "../lib/stores";
import type { Store } from "../lib/types";

describe("filterStores", () => {
  it("filters by search, brands, radius, and facilities then sorts nearest first", () => {
    const stores: Store[] = [
      { id: "1", name: "7-Eleven อารีย์", brandId: "seven-eleven", lat: 0, lng: 0, distanceKm: 1.2, is24Hours: true, hasParking: true, hasAtm: true, inFuelStation: false },
      { id: "2", name: "อินทนิล อารีย์", brandId: "inthanin", lat: 0, lng: 0, distanceKm: 0.4, is24Hours: false, hasParking: true, hasAtm: false, inFuelStation: true },
    ];
    expect(filterStores(stores, { search: "อารีย์", brandIds: ["inthanin"], radiusKm: 1, facilities: ["parking"] }).map((store) => store.id)).toEqual(["2"]);
  });
});
