"use client";

import Link from "next/link";
import { Map, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FavoriteButton } from "@/components/FavoriteButton";
import { PageFrame } from "@/components/PageFrame";
import { StoreCard } from "@/components/StoreCard";
import { useFavorites } from "@/hooks/useFavorites";
import { distanceKm } from "@/lib/distance";
import { requestCoordinates } from "@/lib/geolocation";
import type { Coordinates, Store } from "@/lib/types";

export default function FavoritesPage() {
  const { favorites, toggle } = useFavorites();
  // ขอแค่พิกัดเพื่อคำนวณระยะทางใหม่ — ไม่ยิง Overpass เพราะร้านมาจาก localStorage อยู่แล้ว
  const [center, setCenter] = useState<Coordinates | null>(null);
  useEffect(() => { requestCoordinates().then(setCenter).catch(() => setCenter(null)); }, []);

  // snapshot ที่บันทึกไว้ไม่มีข้อมูลสิ่งอำนวยความสะดวก จึงตั้งเป็น false ทั้งหมด
  // การ์ดในหน้านี้ไม่แสดง facility badge (ไม่ได้ส่ง compact=false มาพร้อม flag ที่เชื่อถือได้)
  // ถ้าจะเพิ่ม filter/badge ที่อ่าน flag เหล่านี้ ต้อง re-verify กับ OSM ก่อน ดู spec/modules/08-favorites.md ข้อ 4
  const stores = useMemo<Store[]>(() => favorites.map((favorite) => ({
    ...favorite,
    distanceKm: center ? distanceKm(center, favorite) : 0,
    is24Hours: false,
    hasParking: false,
    hasAtm: false,
    inFuelStation: false,
  })).sort((a, b) => a.distanceKm - b.distanceKm), [favorites, center]);

  return <PageFrame>
    <section className="container-wide py-8 md:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">บันทึกไว้ในเครื่องนี้</p>
          <h1 className="display-font mt-1 text-3xl font-extrabold">ร้านโปรด</h1>
          <p className="mt-2 text-[var(--muted)]">{favorites.length ? `${favorites.length} ร้าน · เรียงตามระยะทางจากตำแหน่งปัจจุบัน` : "ยังไม่มีร้านที่บันทึกไว้"}</p>
        </div>
        {favorites.length > 0 && <Link href="/map?only=favorites" className="btn-primary"><Map size={18} /> ดูบนแผนที่</Link>}
      </div>

      {favorites.length === 0
        ? <div className="surface mt-8 rounded-3xl p-12 text-center">
            <Star className="mx-auto text-[var(--orange)]" size={32} />
            <h2 className="display-font mt-4 text-xl font-bold">ยังไม่มีร้านโปรด</h2>
            <p className="mx-auto mt-2 max-w-md leading-7 text-[var(--muted)]">กดไอคอนดาวจากหน้าแผนที่หรือรายชื่อร้านเพื่อบันทึกไว้ที่นี่</p>
            <Link href="/map" className="btn-primary mt-6 inline-flex"><Map size={18} /> ไปหน้าแผนที่</Link>
          </div>
        : <div className="mt-7">
            {!center && <p className="mb-4 text-sm text-[var(--muted)]">กำลังหาตำแหน่งเพื่อคำนวณระยะทาง…</p>}
            <div className="grid gap-4 lg:grid-cols-2">
              {stores.map((store) => <StoreCard
                key={store.id}
                store={store}
                actions={<FavoriteButton store={{ id: store.id, name: store.name, brandId: store.brandId, lat: store.lat, lng: store.lng }} saved onToggle={toggle} />}
              />)}
            </div>
          </div>}
    </section>
  </PageFrame>;
}
