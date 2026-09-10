"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchStores } from "@/lib/overpass";
import type { BrandId, Coordinates, Store } from "@/lib/types";

export function useNearbyStores(brandIds: BrandId[], radiusKm: number) {
  const [center, setCenter] = useState<Coordinates | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [status, setStatus] = useState<"locating" | "loading" | "ready" | "error">("locating");
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const locate = useCallback(() => {
    setStatus("locating"); setError("");
    if (!navigator.geolocation) { setError("เบราว์เซอร์นี้ไม่รองรับการระบุตำแหน่ง"); setStatus("error"); return; }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setCenter({ lat: coords.latitude, lng: coords.longitude }),
      () => { setError("กรุณาอนุญาตการเข้าถึงตำแหน่ง เพื่อค้นหาร้านใกล้คุณ"); setStatus("error"); },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 },
    );
  }, []);

  useEffect(() => {
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
