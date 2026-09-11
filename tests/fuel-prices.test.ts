import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchFuelPrices, priceForBrand } from "../lib/fuel-prices";

const payload = {
  status: "success",
  response: {
    date: "11 กันยายน 2569",
    stations: {
      ptt: { gasohol_95: { name: "แก๊สโซฮอล์ 95", price: "39.09" }, diesel: { name: "ดีเซล B7", price: "39.84" } },
      bcp: { gasohol_95: { name: "แก๊สโซฮอล์ 95", price: "39.09" } },
    },
  },
};

describe("fetchFuelPrices", () => {
  afterEach(() => { vi.unstubAllGlobals(); });

  it("returns the per-brand prices along with the quoted date", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(payload))));
    const prices = await fetchFuelPrices();
    expect(prices?.date).toBe("11 กันยายน 2569");
    expect(prices?.stations.ptt?.gasohol_95?.price).toBe("39.09");
  });

  it("resolves to null instead of throwing when the API is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    await expect(fetchFuelPrices()).resolves.toBeNull();
  });

  it("resolves to null on a non-OK response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 503 })));
    await expect(fetchFuelPrices()).resolves.toBeNull();
  });

  it("resolves to null when the body is not the expected shape", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ status: "error" }))));
    await expect(fetchFuelPrices()).resolves.toBeNull();
  });
});

describe("priceForBrand", () => {
  const prices = { date: payload.response.date, stations: payload.response.stations };

  it("maps a fuel brand onto its station entry", () => {
    expect(priceForBrand(prices, "PTT")?.price).toBe("39.09");
    expect(priceForBrand(prices, "Bangchak")?.price).toBe("39.09");
  });

  it("returns null for a brand the API has no entry for", () => {
    expect(priceForBrand(prices, "Caltex")).toBeNull();
  });

  it("returns null when prices are unavailable altogether", () => {
    expect(priceForBrand(null, "PTT")).toBeNull();
  });
});
