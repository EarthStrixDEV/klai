import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchRainStatus, isRaining } from "../lib/weather";

const reply = (precipitation: number, weatherCode: number) =>
  new Response(JSON.stringify({ current: { precipitation, weather_code: weatherCode } }));

describe("isRaining", () => {
  it("treats drizzle, rain, showers and thunderstorm codes as rain", () => {
    expect(isRaining(53)).toBe(true);  // drizzle
    expect(isRaining(63)).toBe(true);  // rain
    expect(isRaining(81)).toBe(true);  // showers
    expect(isRaining(95)).toBe(true);  // thunderstorm
  });

  it("does not treat clear, cloudy or fog codes as rain", () => {
    expect(isRaining(0)).toBe(false);  // clear
    expect(isRaining(2)).toBe(false);  // partly cloudy
    expect(isRaining(45)).toBe(false); // fog
  });
});

describe("fetchRainStatus", () => {
  afterEach(() => { vi.unstubAllGlobals(); });

  it("reports rain when the weather code says so", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(reply(0, 63)));
    await expect(fetchRainStatus({ lat: 13.75, lng: 100.5 })).resolves.toBe(true);
  });

  it("reports rain when measurable precipitation is falling even if the code is mild", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(reply(0.4, 2)));
    await expect(fetchRainStatus({ lat: 13.75, lng: 100.5 })).resolves.toBe(true);
  });

  it("reports no rain on a clear reading", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(reply(0, 2)));
    await expect(fetchRainStatus({ lat: 13.75, lng: 100.5 })).resolves.toBe(false);
  });

  it("reports no rain rather than throwing when the service is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    await expect(fetchRainStatus({ lat: 13.75, lng: 100.5 })).resolves.toBe(false);
  });

  it("reports no rain on a non-OK response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 500 })));
    await expect(fetchRainStatus({ lat: 13.75, lng: 100.5 })).resolves.toBe(false);
  });
});
