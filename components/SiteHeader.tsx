"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { LocationCta } from "./LocationCta";

const links = [
  ["/", "หน้าหลัก"], ["/map", "แผนที่"], ["/stores", "รายชื่อร้าน"],
  ["/favorites", "ร้านโปรด"], ["/shopping-list", "ลิสต์ของ"], ["/gas-station-combo", "Combo"],
  ["/emergency", "ฉุกเฉิน"], ["/about", "เกี่ยวกับ"],
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return <header className="sticky top-0 z-[1000] border-b border-black/5 bg-[rgba(255,250,244,.92)] backdrop-blur-xl">
    <div className="container-wide flex h-[72px] items-center justify-between">
      <Link href="/" aria-label="Klai หน้าหลัก"><Logo /></Link>
      <nav className="desktop-only flex items-center gap-6 text-sm font-semibold text-[var(--muted)]">
        {links.map(([href, label]) => <Link key={href} href={href} className="hover:text-[var(--green-dark)]">{label}</Link>)}
      </nav>
      <span className="desktop-only"><LocationCta compact label="ร้านใกล้ฉัน" /></span>
      <button className="icon-button mobile-menu-button" onClick={() => setOpen(!open)} aria-label="เปิดเมนู">{open ? <X /> : <Menu />}</button>
    </div>
    {open && <nav className="container-wide mobile-menu grid gap-1 pb-4">
      {links.map(([href, label]) => <Link key={href} href={href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 font-semibold hover:bg-white">{label}</Link>)}
    </nav>}
  </header>;
}
