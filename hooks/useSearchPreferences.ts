"use client";

import { useEffect, useState } from "react";
import { defaultBrandIds } from "@/lib/brands";
import type { BrandId } from "@/lib/types";

const KEY = "klai:search-preferences";
type Preferences = { brandIds: BrandId[]; radiusKm: number };
const defaults: Preferences = { brandIds: defaultBrandIds, radiusKm: 1 };

export function useSearchPreferences() {
  const [preferences, setPreferences] = useState(defaults);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) queueMicrotask(() => setPreferences(JSON.parse(saved) as Preferences));
    } catch { /* defaults remain available */ }
  }, []);
  const update = (next: Preferences) => {
    setPreferences(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* preferences remain in memory */ }
  };
  return {
    brandIds: preferences.brandIds,
    radiusKm: preferences.radiusKm,
    setBrandIds: (brandIds: BrandId[]) => update({ ...preferences, brandIds }),
    setRadiusKm: (radiusKm: number) => update({ ...preferences, radiusKm }),
  };
}
