import { loyaltyProgramFor } from "@/lib/loyalty";
import type { BrandId } from "@/lib/types";

/** ป้ายกำกับบนการ์ดร้าน ใช้ร่วมกันทั้งหน้า Map และ List Store */
export function StoreBadges({ brandId, alongRoute = false }: { brandId: BrandId; alongRoute?: boolean }) {
  const loyalty = loyaltyProgramFor(brandId);
  if (!alongRoute && !loyalty) return null;
  return <>
    {alongRoute && <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-bold text-[var(--green-dark)]">อยู่ระหว่างทาง</span>}
    {loyalty && <span className="rounded-full bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-700">เก็บแต้ม {loyalty}</span>}
  </>;
}
