"use client";

import { useEffect, useState } from "react";
import { defaultBrandIds } from "@/lib/brands";
import type { BrandId } from "@/lib/types";

const KEY = "klai:search-preferences";
type Preferences = { brandIds: BrandId[]; radiusKm: number; nightMode: boolean };
const defaults: Preferences = { brandIds: defaultBrandIds, radiusKm: 1, nightMode: false };

export function useSearchPreferences() {
  const [preferences, setPreferences] = useState(defaults);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      // merge กับ defaults เพื่อให้ค่าที่บันทึกไว้ก่อนมี field ใหม่ไม่กลายเป็น undefined
      if (saved) queueMicrotask(() => setPreferences({ ...defaults, ...(JSON.parse(saved) as Partial<Preferences>) }));
    } catch { /* defaults remain available */ }
  }, []);
  const update = (next: Preferences) => {
    setPreferences(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* preferences remain in memory */ }
  };
  return {
    brandIds: preferences.brandIds,
    radiusKm: preferences.radiusKm,
    nightMode: preferences.nightMode,
    setBrandIds: (brandIds: BrandId[]) => update({ ...preferences, brandIds }),
    setRadiusKm: (radiusKm: number) => update({ ...preferences, radiusKm }),
    setNightMode: (nightMode: boolean) => update({ ...preferences, nightMode }),
  };
}
