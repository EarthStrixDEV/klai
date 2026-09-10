import { describe, expect, it } from "vitest";
import { buildStoreQuery } from "../lib/overpass";

describe("buildStoreQuery", () => {
  it("builds one union query from the selected registry entries", () => {
    const query = buildStoreQuery(["seven-eleven", "inthanin"], { lat: 13.75, lng: 100.5 }, 3000);
    expect(query).toContain('["shop"="convenience"]["brand"~"7-Eleven",i](around:3000,13.75,100.5)');
    expect(query).toContain('["amenity"="cafe"]["brand"~"Inthanin|อินทนิล",i](around:3000,13.75,100.5)');
  });
});
