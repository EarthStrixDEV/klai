import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Klai — หาร้านใกล้ตัว", template: "%s — Klai" },
  description: "ค้นหาร้านสะดวกซื้อและคาเฟ่ใกล้ตัวจากข้อมูล OpenStreetMap ฟรี ไม่ต้องสมัครสมาชิก",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="th"><body>{children}</body></html>;
}
