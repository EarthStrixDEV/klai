"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { List, LocateFixed, MapPin, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { BrandChips } from "@/components/BrandChips";
import { PageFrame } from "@/components/PageFrame";
import { StatusPanel } from "@/components/StatusPanel";
import { StoreCard } from "@/components/StoreCard";
import { enabledBrands } from "@/lib/brands";
import { filterStores } from "@/lib/stores";
import { useNearbyStores } from "@/hooks/useNearbyStores";
import { useSearchPreferences } from "@/hooks/useSearchPreferences";
import type { Store } from "@/lib/types";

const MapCanvas = dynamic(() => import("@/components/MapCanvas"), { ssr: false, loading: () => <div className="grid h-full place-items-center text-[var(--muted)]">กำลังเปิดแผนที่…</div> });

export default function MapPage() {
  return <Suspense>
    <MapPageContent />
  </Suspense>;
}

function MapPageContent() {
  const { brandIds: selected, radiusKm: radius, setBrandIds: setSelected, setRadiusKm: setRadius } = useSearchPreferences();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("selected") ?? "";
  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    router.replace(`/map${params.toString() ? `?${params.toString()}` : ""}${window.location.hash}`, { scroll: false });
  };
  const [search, setSearchInput] = useState(() => searchParams.get("q") ?? "");
  useEffect(() => {
    const timer = window.setTimeout(() => updateParams("q", search), 400);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);
  const setPicked = (store: Store) => updateParams("selected", store.id);
  const { center, stores, status, error, retry } = useNearbyStores(selected, radius);
  const visibleStores = useMemo(() => filterStores(stores, { search, brandIds: selected, radiusKm: radius, facilities: [] }), [stores, search, selected, radius]);
  const picked = selectedId ? visibleStores.find((store) => store.id === selectedId) ?? null : null;
  const highlighted = picked ?? visibleStores[0] ?? null;
  return <PageFrame footer={false}>
    <div className="container-wide py-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">สำรวจรอบตัว</p><h1 className="display-font mt-1 text-2xl font-extrabold md:text-3xl">แผนที่ร้านใกล้คุณ</h1></div><Link href="/stores" className="btn-secondary !py-2.5 text-sm"><List size={17} /> ดูแบบรายการ</Link></div>
      <div className="surface mb-4 grid gap-4 rounded-2xl p-4 lg:grid-cols-[1fr_220px_130px] lg:items-end"><div><label className="mb-2 block text-xs font-bold text-[var(--muted)]">เลือกแบรนด์</label><BrandChips selected={selected} onChange={setSelected} /></div><label className="text-xs font-bold text-[var(--muted)]">ค้นหา<span className="relative mt-2 block"><Search className="absolute left-3 top-3.5" size={17} /><input className="field !pl-10" value={search} onChange={(event) => setSearchInput(event.target.value)} placeholder="ชื่อร้าน / ย่าน" /></span></label><label className="text-xs font-bold text-[var(--muted)]">รัศมี<select className="field mt-2 min-w-32" value={radius} onChange={(event) => setRadius(Number(event.target.value))}>{[.5, 1, 3, 5].map((value) => <option key={value} value={value}>{value < 1 ? "500 ม." : `${value} กม.`}</option>)}</select></label></div>
      {status !== "ready" && status !== "idle" ? <StatusPanel status={status} error={error} retry={retry} /> : <div className="grid min-h-[calc(100vh-250px)] gap-4 lg:grid-cols-[1fr_360px]">
        <section className="surface relative min-h-[500px] overflow-hidden rounded-2xl"><MapCanvas center={center ?? { lat: 13.7563, lng: 100.5018 }} stores={status === "idle" ? [] : visibleStores} radiusKm={radius} selectedId={highlighted?.id} onSelect={setPicked} />{status === "idle" && <div className="absolute inset-x-4 top-4 z-[500]"><StatusPanel status={status} error={error} retry={retry} /></div>}{highlighted && <div className="absolute inset-x-3 bottom-3 z-[500] max-w-xl md:left-5 md:right-auto"><StoreCard store={highlighted} compact /></div>}<button onClick={retry} className="icon-button absolute right-4 top-4 z-[500] shadow-lg" aria-label="ระบุตำแหน่งใหม่"><LocateFixed size={19} /></button></section>
        <aside className="max-h-[calc(100vh-250px)] space-y-3 overflow-y-auto pr-1"><div className="flex items-center justify-between px-1"><strong>{visibleStores.length} ร้านที่พบ</strong><span className="text-xs text-[var(--muted)]">ใกล้สุดก่อน</span></div>{visibleStores.length ? visibleStores.slice(0, 12).map((store) => <button className="block w-full text-left" key={store.id} onClick={() => setPicked(store)}><StoreCard store={store} compact /></button>) : status !== "idle" && <div className="surface rounded-2xl p-8 text-center"><MapPin className="mx-auto text-[var(--orange)]" /><p className="mt-3 font-semibold">ยังไม่พบร้านในรัศมีนี้</p><p className="mt-1 text-sm text-[var(--muted)]">ลองเพิ่มรัศมีหรือเลือกแบรนด์อื่น</p></div>}</aside>
      </div>}
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-[var(--muted)]">{enabledBrands.map((brand) => <button onClick={() => setSelected(selected.includes(brand.id) && selected.length > 1 ? selected.filter((id) => id !== brand.id) : [brand.id])} className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 ${selected.includes(brand.id) ? "bg-white" : "opacity-45"}`} key={brand.id}><span className="size-2.5 rounded-full" style={{ background: brand.color }} />{brand.name}</button>)}</div>
    </div>
  </PageFrame>;
}
