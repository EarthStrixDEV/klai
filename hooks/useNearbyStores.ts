"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchStores } from "@/lib/overpass";
import { requestCoordinates } from "@/lib/geolocation";
import type { BrandId, Coordinates, Store } from "@/lib/types";

const INITIAL_LOCATION_KEY = "klai:initial-location";
const CURRENT_LOCATION_KEY = "klai:current-location";

export function useNearbyStores(brandIds: BrandId[], radiusKm: number) {
  const [center, setCenter] = useState<Coordinates | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [status, setStatus] = useState<"idle" | "locating" | "loading" | "ready" | "error">("locating");
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const persistAndSetCenter = useCallback((coordinates: Coordinates) => {
    try { sessionStorage.setItem(CURRENT_LOCATION_KEY, JSON.stringify(coordinates)); } catch { /* keep in memory */ }
    setCenter(coordinates);
  }, []);

  const locate = useCallback(() => {
    setStatus("locating"); setError("");
    // resolve ด้วยพิกัดคร่าวๆ ก่อนทันทีที่ได้ ไม่รอ GPS ความแม่นสูงซึ่งอาจช้ากว่านี้มาก
    // แล้วอัปเดตแบบเงียบๆ อีกครั้งถ้าตำแหน่งจริงต่างจากที่ประมาณไว้พอสมควร
    requestCoordinates(persistAndSetCenter).then(persistAndSetCenter)
      .catch((reason: unknown) => { setError(reason instanceof Error ? reason.message : "ระบุตำแหน่งไม่สำเร็จ"); setStatus("error"); });
  }, [persistAndSetCenter]);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(INITIAL_LOCATION_KEY);
      if (saved) { sessionStorage.removeItem(INITIAL_LOCATION_KEY); queueMicrotask(() => setCenter(JSON.parse(saved) as Coordinates)); return; }
      if (window.location.hash !== "#browse") {
        const current = sessionStorage.getItem(CURRENT_LOCATION_KEY);
        if (current) { queueMicrotask(() => setCenter(JSON.parse(current) as Coordinates)); return; }
      }
    } catch { /* request a fresh location */ }
    if (window.location.hash === "#browse") { queueMicrotask(() => setStatus("idle")); return; }
    const timer = window.setTimeout(locate, 0);
    return () => window.clearTimeout(timer);
  }, [locate]);
  useEffect(() => {
    if (!center) return;
    abortRef.current?.abort();
    const controller = new AbortController(); abortRef.current = controller;
    queueMicrotask(() => { setStatus("loading"); setError(""); });
    fetchStores(brandIds, center, radiusKm * 1000, controller.signal)
      .then((result) => { setStores(result); setStatus("ready"); })
      .catch((reason: unknown) => { if (!controller.signal.aborted) { setError(reason instanceof Error ? reason.message : "ค้นหาร้านไม่สำเร็จ"); setStatus("error"); } });
    return () => controller.abort();
  }, [brandIds, center, radiusKm]);

  return { center, stores, status, error, retry: locate };
}
