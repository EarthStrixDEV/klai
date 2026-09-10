"use client";

import { BatteryCharging, Coffee, Fuel, LoaderCircle, MapPin, Navigation, ParkingCircle, RefreshCw, Toilet } from "lucide-react";
import { useEffect, useState } from "react";
import { PageFrame } from "@/components/PageFrame";
import { formatDistance } from "@/lib/distance";
import { fetchFuelCombos, type FuelBrand, type FuelCombo } from "@/lib/combo";

const pairLabels: Record<FuelBrand, string> = { PTT: "PTT + 7-Eleven / Amazon", Bangchak: "บางจาก + อินทนิล", PT: "PT + พันธุ์ไทย" };

export default function ComboPage() {
  const [pairs, setPairs] = useState<FuelBrand[]>(["PTT"]);
  const [combos, setCombos] = useState<FuelCombo[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const [run, setRun] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(() => { setStatus("loading"); setError(""); });
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      fetchFuelCombos(pairs, { lat: coords.latitude, lng: coords.longitude }, 5000, 80, controller.signal).then((data) => { setCombos(data); setStatus("ready"); }).catch((reason: unknown) => { if (!controller.signal.aborted) { setError(reason instanceof Error ? reason.message : "ค้นหาไม่สำเร็จ"); setStatus("error"); } });
    }, () => { setError("กรุณาอนุญาตตำแหน่งเพื่อค้นหาปั๊มใกล้ตัว"); setStatus("error"); }, { enableHighAccuracy: true, timeout: 12_000 });
    return () => controller.abort();
  }, [pairs, run]);
  const toggle = (pair: FuelBrand) => setPairs((current) => current.includes(pair) ? (current.length > 1 ? current.filter((item) => item !== pair) : current) : [...current, pair]);
  return <PageFrame>
    <section className="container-wide py-8 md:py-12"><div className="max-w-3xl"><p className="eyebrow">เติมน้ำมัน พร้อมแวะร้าน</p><h1 className="display-font mt-1 text-3xl font-extrabold">Gas Station Combo Finder</h1><p className="mt-3 leading-7 text-[var(--muted)]">ค้นหาปั๊มที่มีร้านหรือคาเฟ่ในเครืออยู่ภายในระยะประมาณ 80 เมตรจากข้อมูล OpenStreetMap</p></div>
      <div className="surface mt-7 rounded-3xl p-5"><label className="mb-3 block text-xs font-bold text-[var(--muted)]">เลือกคู่ปั๊มและร้าน</label><div className="flex flex-wrap gap-2">{(Object.keys(pairLabels) as FuelBrand[]).map((pair) => <button key={pair} className="brand-chip" aria-pressed={pairs.includes(pair)} style={pairs.includes(pair) ? { background: "var(--green)" } : {}} onClick={() => toggle(pair)}><Fuel size={15} />{pairLabels[pair]}</button>)}</div><p className="mt-3 text-xs text-[var(--muted)]">ผลจับคู่เป็นค่าประมาณจากระยะห่างของจุดข้อมูล อาจไม่ครบถ้วนหรือคลาดเคลื่อนได้</p></div>
      {status === "loading" && <div className="surface mt-6 grid min-h-40 place-items-center rounded-2xl text-center"><div><LoaderCircle className="mx-auto animate-spin text-[var(--orange)]" /><p className="mt-3 font-semibold">กำลังจับคู่ปั๊มกับร้านใกล้เคียง…</p></div></div>}
      {status === "error" && <div className="surface mt-6 rounded-2xl p-8 text-center"><p className="font-semibold text-red-700">{error}</p><button className="btn-secondary mt-4" onClick={() => setRun((value) => value + 1)}><RefreshCw size={17} /> ลองใหม่</button></div>}
      {status === "ready" && <div className="mt-7"><div className="mb-4 flex justify-between"><strong>{combos.length} ปั๊มที่จับคู่ได้</strong><span className="text-sm text-[var(--muted)]">ในรัศมี 5 กม.</span></div><div className="grid gap-4 lg:grid-cols-2">{combos.map((combo) => <article key={combo.id} className="surface rounded-2xl p-5"><div className="flex gap-3"><span className="grid size-12 shrink-0 place-items-center rounded-xl bg-emerald-50 text-[var(--green)]"><Fuel /></span><div><h2 className="display-font font-bold">{combo.name}</h2><p className="text-sm text-[var(--muted)]">{combo.brand} · <strong>{formatDistance(combo.distanceKm)}</strong></p></div></div><div className="mt-4 flex flex-wrap gap-2">{combo.pairedStores.map((store) => <span key={store.id} className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold text-[var(--orange)]"><Coffee size={14} />มี {store.name}</span>)}</div><div className="mt-4 flex gap-4 text-xs text-[var(--muted)]">{combo.hasParking && <span className="inline-flex gap-1"><ParkingCircle size={14} />ที่จอดรถ</span>}{combo.hasToilets && <span className="inline-flex gap-1"><Toilet size={14} />ห้องน้ำ</span>}{combo.hasEv && <span className="inline-flex gap-1"><BatteryCharging size={14} />EV</span>}</div><a className="btn-primary mt-5 w-full !py-2.5 text-sm" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/dir/?api=1&destination=${combo.lat},${combo.lng}`}><Navigation size={16} /> นำทางไปปั๊ม</a></article>)}</div>{!combos.length && <div className="surface rounded-2xl p-10 text-center"><MapPin className="mx-auto text-[var(--orange)]" /><h2 className="mt-3 font-bold">ยังไม่พบ Combo ใกล้คุณ</h2><p className="mt-2 text-sm text-[var(--muted)]">ข้อมูล OSM ในพื้นที่อาจยังไม่ครบ หรือลองเลือกคู่ปั๊มอื่น</p></div>}</div>}
    </section>
  </PageFrame>;
}
