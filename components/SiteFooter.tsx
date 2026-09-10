import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Logo } from "./Logo";

export function SiteFooter() {
  return <footer className="border-t border-[var(--border)] bg-white py-10">
    <div className="container-wide grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
      <div><Logo /><p className="mt-3 max-w-md text-sm leading-7 text-[var(--muted)]">โปรเจกต์อิสระสำหรับค้นหาร้านใกล้ตัว ไม่เกี่ยวข้องหรือได้รับการรับรองจากแบรนด์ใด ๆ</p></div>
      <div className="grid content-start gap-2 text-sm"><strong>ใช้งาน Klai</strong><Link href="/map">แผนที่</Link><Link href="/stores">รายชื่อร้าน</Link><Link href="/shopping-list">ลิสต์ของ</Link></div>
      <div className="grid content-start gap-2 text-sm"><strong>ข้อมูล</strong><Link href="/about">เกี่ยวกับและ Disclaimer</Link><a className="inline-flex items-center gap-1" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap <ExternalLink size={13} /></a></div>
    </div>
  </footer>;
}
