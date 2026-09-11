import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Klai — หาร้านใกล้ตัว",
    short_name: "Klai",
    description: "ค้นหาร้านสะดวกซื้อและคาเฟ่ใกล้ตัวจากข้อมูล OpenStreetMap ฟรี ไม่ต้องสมัครสมาชิก",
    start_url: "/",
    display: "standalone",
    background_color: "#fffcf8",
    theme_color: "#e85d12",
    lang: "th",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
