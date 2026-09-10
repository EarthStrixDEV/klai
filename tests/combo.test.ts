import { describe, expect, it } from "vitest";
import { matchFuelCombos, type FuelStation } from "../lib/combo";

describe("matchFuelCombos", () => {
  it("keeps only a fuel station with its paired store within the threshold", () => {
    const fuels: FuelStation[] = [{ id: "fuel-near", name: "PTT A", brand: "PTT", lat: 13.75, lng: 100.5, distanceKm: 1 }, { id: "fuel-far", name: "PTT B", brand: "PTT", lat: 13.8, lng: 100.6, distanceKm: 5 }];
    const stores = [{ id: "store", name: "Café Amazon", brandId: "cafe-amazon" as const, lat: 13.7502, lng: 100.5002, distanceKm: 1, is24Hours: false, hasParking: false, hasAtm: false, inFuelStation: false }];
    expect(matchFuelCombos(fuels, stores, 80).map((combo) => combo.id)).toEqual(["fuel-near"]);
  });
});
