import { describe, expect, it } from "vitest";
import { identifyFuelBrand, isProvenFuelPair, matchFuelCombos, type FuelStation } from "../lib/combo";
import { distanceKm } from "../lib/distance";

describe("matchFuelCombos", () => {
  it("keeps only a fuel station with its paired store within the threshold", () => {
    const fuels: FuelStation[] = [{ id: "fuel-near", name: "PTT A", brand: "PTT", lat: 13.75, lng: 100.5, distanceKm: 1 }, { id: "fuel-far", name: "PTT B", brand: "PTT", lat: 13.8, lng: 100.6, distanceKm: 5 }];
    const stores = [{ id: "store", name: "Café Amazon", brandId: "cafe-amazon" as const, lat: 13.7502, lng: 100.5002, distanceKm: 1, is24Hours: false, hasParking: false, hasAtm: false, inFuelStation: false }];
    expect(matchFuelCombos(fuels, stores, 80).map((combo) => combo.id)).toEqual(["fuel-near"]);
  });

  it("drops a fuel station when every nearby store is outside the threshold", () => {
    const fuels: FuelStation[] = [{ id: "fuel", name: "PTT A", brand: "PTT", lat: 13.75, lng: 100.5, distanceKm: 1 }];
    const stores = [{ id: "store", name: "Café Amazon", brandId: "cafe-amazon" as const, lat: 13.76, lng: 100.51, distanceKm: 1, is24Hours: false, hasParking: false, hasAtm: false, inFuelStation: false }];
    expect(matchFuelCombos(fuels, stores, 80)).toEqual([]);
  });

  it("does not pair a store whose brand's fuelBrandPair differs from the nearby fuel station's brand", () => {
    const fuels: FuelStation[] = [{ id: "fuel", name: "Bangchak A", brand: "Bangchak", lat: 13.75, lng: 100.5, distanceKm: 1 }];
    const stores = [{ id: "store", name: "Café Amazon", brandId: "cafe-amazon" as const, lat: 13.7502, lng: 100.5002, distanceKm: 1, is24Hours: false, hasParking: false, hasAtm: false, inFuelStation: false }];
    expect(matchFuelCombos(fuels, stores, 80)).toEqual([]);
  });

  it("pairs a store exactly at the threshold boundary", () => {
    const fuel: FuelStation = { id: "fuel", name: "PTT A", brand: "PTT", lat: 13.75, lng: 100.5, distanceKm: 1 };
    const store = { id: "store", name: "Café Amazon", brandId: "cafe-amazon" as const, lat: 13.7507, lng: 100.5, distanceKm: 1, is24Hours: false, hasParking: false, hasAtm: false, inFuelStation: false };
    const thresholdMeters = distanceKm(fuel, store) * 1000;
    expect(matchFuelCombos([fuel], [store], thresholdMeters).map((combo) => combo.id)).toEqual(["fuel"]);
  });
});

describe("identifyFuelBrand", () => {
  it("identifies PTT from either the brand or name tag", () => {
    expect(identifyFuelBrand({ brand: "PTT" })).toBe("PTT");
    expect(identifyFuelBrand({ name: "ปตท สาขา 1" })).toBe("PTT");
  });

  it("identifies Bangchak and PT", () => {
    expect(identifyFuelBrand({ brand: "Bangchak" })).toBe("Bangchak");
    expect(identifyFuelBrand({ brand: "PT" })).toBe("PT");
  });

  it("returns null when no known fuel brand pattern matches", () => {
    expect(identifyFuelBrand({ brand: "Shell" })).toBeNull();
    expect(identifyFuelBrand({})).toBeNull();
  });
});

describe("isProvenFuelPair", () => {
  it("treats only PTT as proven per the spec's prototype scope", () => {
    expect(isProvenFuelPair("PTT")).toBe(true);
    expect(isProvenFuelPair("Bangchak")).toBe(false);
    expect(isProvenFuelPair("PT")).toBe(false);
  });
});
