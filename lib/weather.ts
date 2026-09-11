import type { Coordinates } from "./types";

// Open-Meteo ฟรี ไม่ต้องใช้ API key เหมือน Overpass — ดู spec/klai-spec.md หัวข้อ 7
const ENDPOINT = "https://api.open-meteo.com/v1/forecast";

/**
 * WMO weather code ที่นับว่าฝนตก: 51-67 ฝนปรอย/ฝนตก/ฝนแข็งตัว, 80-82 ฝนซู่, 95-99 พายุฝนฟ้าคะนอง
 * ข้าม 71-79 (หิมะ) เพราะไม่เกี่ยวกับไทย และข้าม 45-48 (หมอก) เพราะไม่ต้องหลบฝน
 */
export function isRaining(weatherCode: number): boolean {
  return (weatherCode >= 51 && weatherCode <= 67)
    || (weatherCode >= 80 && weatherCode <= 82)
    || (weatherCode >= 95 && weatherCode <= 99);
}

/** คืน false เมื่อเช็คไม่ได้ — banner เป็นของเสริม ห้ามทำให้หน้า Map พัง */
export async function fetchRainStatus(center: Coordinates, signal?: AbortSignal): Promise<boolean> {
  try {
    const url = `${ENDPOINT}?latitude=${center.lat}&longitude=${center.lng}&current=precipitation,weather_code`;
    const response = await fetch(url, { signal });
    if (!response.ok) return false;
    const body = (await response.json()) as { current?: { precipitation?: number; weather_code?: number } };
    const precipitation = body.current?.precipitation ?? 0;
    const weatherCode = body.current?.weather_code ?? 0;
    return precipitation > 0 || isRaining(weatherCode);
  } catch {
    return false;
  }
}
