"use client";

import Link from "next/link";
import { Map, Moon, Search, Share2, SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { BrandChips } from "@/components/BrandChips";
import { FavoriteButton } from "@/components/FavoriteButton";
import { PageFrame } from "@/components/PageFrame";
import { StatusPanel } from "@/components/StatusPanel";
import { StoreCard } from "@/components/StoreCard";
import { useFavorites } from "@/hooks/useFavorites";
import { useNearbyStores } from "@/hooks/useNearbyStores";
import { filterStores, shareStoreUrl, type Facility } from "@/lib/stores";
import { isFavorite } from "@/lib/favorites";
import { isAlongRoute, parseDestination, ROUTE_CORRIDOR_KM } from "@/lib/route";
import { useSearchPreferences } from "@/hooks/useSearchPreferences";

const facilityOptions: [Facility, string][] = [["24hours", "เปิด 24 ชม."], ["parking", "ที่จอดรถ"], ["atm", "มี ATM"], ["fuel", "อยู่ในปั๊ม"]];

export default function StoresPage() {
  return <Suspense>
    <StoresPageContent />
  </Suspense>;
}

function StoresPageContent() {
  const { brandIds: brands, radiusKm: radius, nightMode, setBrandIds: setBrands, setRadiusKm: setRadius, setNightMode } = useSearchPreferences();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const { center, stores, status, error, retry } = useNearbyStores(brands, radius);
  const { favorites, toggle } = useFavorites();
  const destination = useMemo(() => parseDestination(searchParams.get("to") ?? ""), [searchParams]);
  const effectiveFacilities = useMemo<Facility[]>(() => nightMode && !facilities.includes("24hours") ? [...facilities, "24hours"] : facilities, [nightMode, facilities]);
  const matching = useMemo(() => filterStores(stores, { search, brandIds: brands, radiusKm: radius, facilities: effectiveFacilities }), [stores, search, brands, radius, effectiveFacilities]);
  const filtered = useMemo(() => (center && destination)
    ? matching.filter((store) => isAlongRoute(center, destination, store, ROUTE_CORRIDOR_KM))
    : matching, [matching, center, destination]);
  const toggleFacility = (facility: Facility) => setFacilities((current) => current.includes(facility) ? current.filter((item) => item !== facility) : [...current, facility]);
  const viewOnMapHref = useMemo(() => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    for (const facility of facilities) params.append("facility", facility);
    return params.toString() ? `/map?${params.toString()}` : "/map";
  }, [search, facilities]);
  return <PageFrame>
    <section className="container-wide py-8 md:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">ค้นหาและกรอง</p><h1 className="display-font mt-1 text-3xl font-extrabold">ร้านใกล้คุณ</h1><p className="mt-2 text-[var(--muted)]">เรียงตามระยะทางจากตำแหน่งปัจจุบัน</p></div><Link href={viewOnMapHref} className="btn-primary"><Map size={18} /> ดูบนแผนที่</Link></div>
      <div className="surface mt-7 rounded-3xl p-4 md:p-6">
        <div className="relative"><Search className="absolute left-4 top-3.5 text-[var(--muted)]" size={19} /><input className="field !pl-11" placeholder="ค้นหาชื่อร้านหรือย่าน…" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_auto]"><div><label className="mb-2 block text-xs font-bold text-[var(--muted)]">แบรนด์</label><BrandChips selected={brands} onChange={setBrands} /></div><label className="text-xs font-bold text-[var(--muted)]">รัศมี<select className="field mt-2 min-w-32" value={radius} onChange={(event) => setRadius(Number(event.target.value))}>{[.5, 1, 3, 5].map((value) => <option key={value} value={value}>{value < 1 ? "500 ม." : `${value} กม.`}</option>)}</select></label></div>
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[var(--border)] pt-4">
          <button className="brand-chip" aria-pressed={nightMode} style={nightMode ? { background: "#1e293b", color: "white" } : {}} onClick={() => setNightMode(!nightMode)}><Moon size={15} /> โหมดกลางคืน</button>
          <span className="mx-1 h-5 w-px bg-[var(--border)]" />
          <SlidersHorizontal size={17} className="mr-1 text-[var(--muted)]" />{facilityOptions.map(([id, label]) => <button key={id} className="brand-chip" aria-pressed={facilities.includes(id)} style={facilities.includes(id) ? { background: "var(--green)" } : {}} onClick={() => toggleFacility(id)}>{label}</button>)}
        </div><p className="mt-3 text-xs text-[var(--muted)]">ข้อมูลเวลาเปิด ที่จอดรถ ATM และร้านในปั๊มอ้างอิงจาก OpenStreetMap ซึ่งอาจไม่ครบทุกสาขา</p>
      </div>
      <div className="mt-7"><StatusPanel status={status} error={error} retry={retry} />{status === "ready" && <><div className="mb-4 flex justify-between text-sm"><strong>{filtered.length} ร้าน</strong><span className="text-[var(--muted)]">ระยะใกล้ → ไกล</span></div><div className="grid gap-4 lg:grid-cols-2">{filtered.map((store) => <StoreCard
        key={store.id}
        store={store}
        actions={<FavoriteButton store={{ id: store.id, name: store.name, brandId: store.brandId, lat: store.lat, lng: store.lng }} saved={isFavorite(favorites, store.id)} onToggle={toggle} />}
        badges={destination ? <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-bold text-[var(--green-dark)]">อยู่ระหว่างทาง</span> : undefined}
        footer={<a href={shareStoreUrl(store)} target="_blank" rel="noreferrer" className="btn-secondary mt-4 w-full !py-2.5 text-sm"><Share2 size={16} /> ส่งพิกัดไป LINE</a>}
      />)}</div>{!filtered.length && <div className="surface rounded-2xl p-10 text-center"><p className="font-semibold">ไม่พบร้านที่ตรงกับตัวกรอง</p><button className="mt-3 text-sm font-bold text-[var(--orange)]" onClick={() => { setSearch(""); setFacilities([]); }}>ล้างตัวกรอง</button></div>}</>}</div>
    </section>
  </PageFrame>;
}
