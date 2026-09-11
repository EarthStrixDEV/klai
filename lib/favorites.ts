import type { BrandId, Coordinates } from "./types";

const KEY = "klai:favorites";

/** snapshot ของร้านตอนกดดาว — พิกัดอาจเก่ากว่า OSM ปัจจุบันถ้าร้านย้าย ดู spec/modules/08-favorites.md */
export type FavoriteStore = Coordinates & { id: string; name: string; brandId: BrandId };

export function readFavorites(): FavoriteStore[] {
  try {
    const saved = localStorage.getItem(KEY);
    if (!saved) return [];
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? (parsed as FavoriteStore[]) : [];
  } catch {
    return [];
  }
}

function write(favorites: FavoriteStore[]) {
  try { localStorage.setItem(KEY, JSON.stringify(favorites)); } catch { /* storage is optional */ }
}

/** เพิ่มถ้ายังไม่มี ลบถ้ามีแล้ว แล้วคืนรายการล่าสุดกลับไป */
export function toggleFavorite(store: FavoriteStore): FavoriteStore[] {
  const current = readFavorites();
  const next = current.some((item) => item.id === store.id)
    ? current.filter((item) => item.id !== store.id)
    : [...current, store];
  write(next);
  return next;
}

export const isFavorite = (favorites: FavoriteStore[], id: string) => favorites.some((item) => item.id === id);
