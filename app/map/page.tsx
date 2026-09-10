"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { List, LocateFixed, MapPin } from "lucide-react";
import { useMemo, useState } from "react";
import { BrandChips } from "@/components/BrandChips";
import { PageFrame } from "@/components/PageFrame";
import { StatusPanel } from "@/components/StatusPanel";
import { StoreCard } from "@/components/StoreCard";
import { enabledBrands, defaultBrandIds } from "@/lib/brands";
import { useNearbyStores } from "@/hooks/useNearbyStores";
import type { BrandId } from "@/lib/types";

const MapCanvas = dynamic(() => import("@/components/MapCanvas"), { ssr: false, loading: () => <div className="grid h-full place-items-center text-[var(--muted)]">กำลังเปิดแผนที่…</div> });

export default function MapPage() {
  const [selected, setSelected] = useState<BrandId[]>(defaultBrandIds);
  const [radius, setRadius] = useState(3);
  const stableSelected = useMemo(() => selected, [selected]);
  const { center, stores, status, error, retry } = useNearbyStores(stableSelected, radius);
  return <PageFrame footer={false}>
    <div className="container-wide py-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">สำรวจรอบตัว</p><h1 className="display-font mt-1 text-2xl font-extrabold md:text-3xl">แผนที่ร้านใกล้คุณ</h1></div><Link href="/stores" className="btn-secondary !py-2.5 text-sm"><List size={17} /> ดูแบบรายการ</Link></div>
      <div className="surface mb-4 grid gap-4 rounded-2xl p-4 lg:grid-cols-[1fr_auto] lg:items-end"><div><label className="mb-2 block text-xs font-bold text-[var(--muted)]">เลือกแบรนด์</label><BrandChips selected={selected} onChange={setSelected} /></div><label className="text-xs font-bold text-[var(--muted)]">รัศมี<select className="field mt-2 min-w-32" value={radius} onChange={(event) => setRadius(Number(event.target.value))}>{[.5, 1, 3, 5].map((value) => <option key={value} value={value}>{value < 1 ? "500 ม." : `${value} กม.`}</option>)}</select></label></div>
      {status !== "ready" || !center ? <StatusPanel status={status} error={error} retry={retry} /> : <div className="grid min-h-[calc(100vh-250px)] gap-4 lg:grid-cols-[1fr_360px]">
        <section className="surface relative min-h-[430px] overflow-hidden rounded-2xl"><MapCanvas center={center} stores={stores} radiusKm={radius} /><button onClick={retry} className="icon-button absolute bottom-5 right-4 z-[500] shadow-lg" aria-label="ระบุตำแหน่งใหม่"><LocateFixed size={19} /></button></section>
        <aside className="max-h-[calc(100vh-250px)] space-y-3 overflow-y-auto pr-1"><div className="flex items-center justify-between px-1"><strong>{stores.length} ร้านที่พบ</strong><span className="text-xs text-[var(--muted)]">ใกล้สุดก่อน</span></div>{stores.length ? stores.slice(0, 12).map((store) => <StoreCard key={store.id} store={store} compact />) : <div className="surface rounded-2xl p-8 text-center"><MapPin className="mx-auto text-[var(--orange)]" /><p className="mt-3 font-semibold">ยังไม่พบร้านในรัศมีนี้</p><p className="mt-1 text-sm text-[var(--muted)]">ลองเพิ่มรัศมีหรือเลือกแบรนด์อื่น</p></div>}</aside>
      </div>}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-[var(--muted)]">{enabledBrands.filter((brand) => selected.includes(brand.id)).map((brand) => <span className="inline-flex items-center gap-1.5" key={brand.id}><span className="size-2.5 rounded-full" style={{ background: brand.color }} />{brand.name}</span>)}</div>
    </div>
  </PageFrame>;
}
