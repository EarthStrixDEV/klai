import type { Metadata, Viewport } from "next";
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Klai — หาร้านใกล้ตัว", template: "%s — Klai" },
  description: "ค้นหาร้านสะดวกซื้อและคาเฟ่ใกล้ตัวจากข้อมูล OpenStreetMap ฟรี ไม่ต้องสมัครสมาชิก",
  appleWebApp: { capable: true, title: "Klai", statusBarStyle: "default" },
};

export const viewport: Viewport = { themeColor: "#e85d12" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="th"><body>{children}<ServiceWorkerRegistrar /></body></html>;
}
