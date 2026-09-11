import type { FuelBrand } from "./combo";

// ราคาขายปลีกจาก EPPO ผ่าน community wrapper (ฟรี ไม่ต้อง API key) — ดู spec/klai-spec.md หัวข้อ 5.5
// เป็นราคาอ้างอิงระดับแบรนด์ในกรุงเทพฯ และปริมณฑล ไม่ใช่ราคาที่ดึงจากแต่ละสาขาจริง
const ENDPOINT = "https://api.chnwt.dev/thai-oil-api/latest";
const CACHE_KEY = "klai:fuel-prices";
const CACHE_TTL_MS = 6 * 60 * 60_000;

export type FuelPrice = { name: string; price: string };
export type FuelPrices = { date: string; stations: Record<string, Record<string, FuelPrice> | undefined> };

/** ชื่อ station ใน API ไม่ตรงกับ FuelBrand ของเราทั้งหมด จึง map ไว้ตรงนี้ */
const stationKeys: Record<FuelBrand, string> = { PTT: "ptt", Bangchak: "bcp", PT: "pt", Caltex: "caltex" };

/** เชื้อเพลิงที่เอามาโชว์บนการ์ด — แก๊สโซฮอล์ 95 เป็นชนิดที่คนใช้มากสุด */
const HEADLINE_FUEL = "gasohol_95";

export async function fetchFuelPrices(signal?: AbortSignal): Promise<FuelPrices | null> {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as { savedAt: number; prices: FuelPrices };
      if (Date.now() - parsed.savedAt < CACHE_TTL_MS) return parsed.prices;
    }
  } catch { /* storage is optional */ }

  try {
    const response = await fetch(ENDPOINT, { signal });
    if (!response.ok) return null;
    const body = (await response.json()) as { status?: string; response?: FuelPrices };
    if (body.status !== "success" || !body.response?.stations) return null;
    const prices = { date: body.response.date, stations: body.response.stations };
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), prices })); } catch { /* storage is optional */ }
    return prices;
  } catch {
    // ราคาเป็นข้อมูลเสริม — ถ้าดึงไม่ได้ต้องไม่ทำให้การ์ดปั๊มพังไปด้วย
    return null;
  }
}

export function priceForBrand(prices: FuelPrices | null, brand: FuelBrand): FuelPrice | null {
  return prices?.stations[stationKeys[brand]]?.[HEADLINE_FUEL] ?? null;
}
