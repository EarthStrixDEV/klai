import { describe, expect, it } from "vitest";
import { distanceKm } from "../lib/distance";

describe("distanceKm", () => {
  it("returns a known Bangkok distance using the Haversine seam", () => {
    expect(distanceKm({ lat: 13.7563, lng: 100.5018 }, { lat: 13.7466, lng: 100.5347 })).toBeCloseTo(3.72, 1);
  });
});
