"use client";

import { Star } from "lucide-react";
import type { FavoriteStore } from "@/lib/favorites";

export function FavoriteButton({ store, saved, onToggle }: { store: FavoriteStore; saved: boolean; onToggle: (store: FavoriteStore) => void }) {
  return <button
    type="button"
    aria-pressed={saved}
    aria-label={saved ? `เอา ${store.name} ออกจากร้านโปรด` : `บันทึก ${store.name} เป็นร้านโปรด`}
    onClick={(event) => { event.preventDefault(); event.stopPropagation(); onToggle(store); }}
    className="grid size-9 place-items-center rounded-full transition hover:bg-amber-50"
    style={saved ? { background: "#fff6e5", color: "#f5a623" } : { color: "var(--muted)" }}
  >
    <Star size={18} fill={saved ? "#f5a623" : "none"} />
  </button>;
}
