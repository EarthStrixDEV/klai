"use client";

import Link from "next/link";
import { LocateFixed, Navigation } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { requestCoordinates } from "@/lib/geolocation";

export function LocationCta({ compact = false, label = "ค้นหาร้านใกล้ฉัน" }: { compact?: boolean; label?: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const locate = async () => {
    setLoading(true); setError("");
    try {
      const coordinates = await requestCoordinates();
      sessionStorage.setItem("klai:initial-location", JSON.stringify(coordinates));
      router.push("/map");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "ระบุตำแหน่งไม่สำเร็จ"); setLoading(false); }
  };
  return <span className={compact ? "relative" : "inline-grid gap-2"}>
    <button onClick={locate} disabled={loading} className={`btn-primary ${compact ? "!px-4 !py-2.5 text-sm" : ""}`}><Navigation size={compact ? 17 : 19} />{loading ? "กำลังหาตำแหน่ง…" : label}</button>
    {error && !compact && <span className="max-w-sm rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error} <Link className="font-bold underline" href="/stores">พิมพ์ค้นหาในรายชื่อร้าน</Link></span>}
  </span>;
}

export function BrowseMapLink() {
  return <Link href="/map#browse" className="btn-secondary"><LocateFixed size={19} /> ดูแผนที่ทั้งหมด</Link>;
}
