"use client";

import Link from "next/link";
import { Map, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { BrandChips } from "@/components/BrandChips";
import { PageFrame } from "@/components/PageFrame";
import { StatusPanel } from "@/components/StatusPanel";
import { StoreCard } from "@/components/StoreCard";
import { useNearbyStores } from "@/hooks/useNearbyStores";
import { defaultBrandIds } from "@/lib/brands";
import { filterStores, type Facility } from "@/lib/stores";
import type { BrandId } from "@/lib/types";

const facilityOptions: [Facility, string][] = [["24hours", "เปิด 24 ชม."], ["parking", "ที่จอดรถ"], ["atm", "มี ATM"], ["fuel", "อยู่ในปั๊ม"]];

export default function StoresPage() {
  const [brands, setBrands] = useState<BrandId[]>(defaultBrandIds);
  const [radius, setRadius] = useState(3);
  const [search, setSearch] = useState("");
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const { stores, status, error, retry } = useNearbyStores(brands, radius);
  const filtered = useMemo(() => filterStores(stores, { search, brandIds: brands, radiusKm: radius, facilities }), [stores, search, brands, radius, facilities]);
  const toggleFacility = (facility: Facility) => setFacilities((current) => current.includes(facility) ? current.filter((item) => item !== facility) : [...current, facility]);
  return <PageFrame>
    <section className="container-wide py-8 md:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">ค้นหาและกรอง</p><h1 className="display-font mt-1 text-3xl font-extrabold">ร้านใกล้คุณ</h1><p className="mt-2 text-[var(--muted)]">เรียงตามระยะทางจากตำแหน่งปัจจุบัน</p></div><Link href="/map" className="btn-primary"><Map size={18} /> ดูบนแผนที่</Link></div>
      <div className="surface mt-7 rounded-3xl p-4 md:p-6">
        <div className="relative"><Search className="absolute left-4 top-3.5 text-[var(--muted)]" size={19} /><input className="field !pl-11" placeholder="ค้นหาชื่อร้านหรือย่าน…" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_auto]"><div><label className="mb-2 block text-xs font-bold text-[var(--muted)]">แบรนด์</label><BrandChips selected={brands} onChange={setBrands} /></div><label className="text-xs font-bold text-[var(--muted)]">รัศมี<select className="field mt-2 min-w-32" value={radius} onChange={(event) => setRadius(Number(event.target.value))}>{[.5, 1, 3, 5].map((value) => <option key={value} value={value}>{value < 1 ? "500 ม." : `${value} กม.`}</option>)}</select></label></div>
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[var(--border)] pt-4"><SlidersHorizontal size={17} className="mr-1 text-[var(--muted)]" />{facilityOptions.map(([id, label]) => <button key={id} className="brand-chip" aria-pressed={facilities.includes(id)} style={facilities.includes(id) ? { background: "var(--green)" } : {}} onClick={() => toggleFacility(id)}>{label}</button>)}</div>
      </div>
      <div className="mt-7"><StatusPanel status={status} error={error} retry={retry} />{status === "ready" && <><div className="mb-4 flex justify-between text-sm"><strong>{filtered.length} ร้าน</strong><span className="text-[var(--muted)]">ระยะใกล้ → ไกล</span></div><div className="grid gap-4 lg:grid-cols-2">{filtered.map((store) => <StoreCard key={store.id} store={store} />)}</div>{!filtered.length && <div className="surface rounded-2xl p-10 text-center"><p className="font-semibold">ไม่พบร้านที่ตรงกับตัวกรอง</p><button className="mt-3 text-sm font-bold text-[var(--orange)]" onClick={() => { setSearch(""); setFacilities([]); }}>ล้างตัวกรอง</button></div>}</>}</div>
    </section>
  </PageFrame>;
}
