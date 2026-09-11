"use client";

import { useCallback, useEffect, useState } from "react";
import { readFavorites, toggleFavorite, type FavoriteStore } from "@/lib/favorites";

// ให้ทุก instance ของ hook รู้ตัวเมื่อมีการกดดาวที่หน้าใดหน้าหนึ่ง โดยไม่ต้องรอ storage event (ซึ่งยิงข้ามแท็บเท่านั้น)
const CHANGED = "klai:favorites-changed";

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteStore[]>([]);

  useEffect(() => {
    const sync = () => setFavorites(readFavorites());
    sync();
    window.addEventListener(CHANGED, sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener(CHANGED, sync); window.removeEventListener("storage", sync); };
  }, []);

  const toggle = useCallback((store: FavoriteStore) => {
    setFavorites(toggleFavorite(store));
    window.dispatchEvent(new Event(CHANGED));
  }, []);

  return { favorites, toggle };
}
