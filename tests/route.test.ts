import { describe, expect, it } from "vitest";
import { distanceFromRouteKm, formatDestination, isAlongRoute, parseDestination } from "../lib/route";

const origin = { lat: 13.75, lng: 100.50 };
const destination = { lat: 13.80, lng: 100.50 };

describe("distanceFromRouteKm", () => {
  it("reports roughly zero for a point sitting on the line", () => {
    expect(distanceFromRouteKm(origin, destination, { lat: 13.775, lng: 100.50 })).toBeCloseTo(0, 1);
  });

  it("measures the perpendicular offset for a point beside the line", () => {
    // ~0.009 องศาลองจิจูดที่ละติจูดนี้ ≈ 1 กม.
    const offset = distanceFromRouteKm(origin, destination, { lat: 13.775, lng: 100.509 });
    expect(offset).toBeGreaterThan(0.8);
    expect(offset).toBeLessThan(1.2);
  });

  it("falls back to the endpoint distance for a point past the destination", () => {
    // อยู่เลยปลายทางไปทางเหนือ — ต้องวัดจากปลายทาง ไม่ใช่จากเส้นที่ต่อออกไปเรื่อยๆ
    const beyond = { lat: 13.85, lng: 100.50 };
    expect(distanceFromRouteKm(origin, destination, beyond)).toBeCloseTo(5.56, 0);
  });

  it("falls back to the origin distance for a point behind the start", () => {
    const behind = { lat: 13.70, lng: 100.50 };
    expect(distanceFromRouteKm(origin, destination, behind)).toBeCloseTo(5.56, 0);
  });

  it("treats a zero-length route as distance from that single point", () => {
    expect(distanceFromRouteKm(origin, origin, origin)).toBeCloseTo(0, 5);
  });
});

describe("isAlongRoute", () => {
  it("accepts a point within the corridor and rejects one outside it", () => {
    expect(isAlongRoute(origin, destination, { lat: 13.775, lng: 100.50 }, 2)).toBe(true);
    expect(isAlongRoute(origin, destination, { lat: 13.775, lng: 100.55 }, 2)).toBe(false);
  });
});

describe("destination round-trip", () => {
  it("recovers the store id alongside the coordinates", () => {
    const parsed = parseDestination(formatDestination({ id: "node/123", lat: 13.75, lng: 100.5 }));
    expect(parsed).toEqual({ id: "node/123", lat: 13.75, lng: 100.5 });
  });

  it("rejects a value missing an id or with unparseable coordinates", () => {
    expect(parseDestination("")).toBeNull();
    expect(parseDestination("13.75,100.5")).toBeNull();
    expect(parseDestination("node/1,notanumber,100.5")).toBeNull();
  });
});
