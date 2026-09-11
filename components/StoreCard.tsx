import type { ReactNode } from "react";
import { Clock3, ExternalLink, Fuel, Landmark, MapPin, Navigation, ParkingCircle, Zap } from "lucide-react";
import { getBrand } from "@/lib/brands";
import { formatDistance } from "@/lib/distance";
import { navigationUrl } from "@/lib/stores";
import type { Store } from "@/lib/types";

type StoreCardProps = {
  store: Store;
  compact?: boolean;
  /** ปุ่มเสริมมุมขวาบนของการ์ด เช่น ดาวร้านโปรด — วางคู่กับชื่อร้าน ไม่แทนที่ปุ่มนำทาง */
  actions?: ReactNode;
  /** ป้ายกำกับเสริมข้างชื่อร้าน เช่น "อยู่ระหว่างทาง" / "เก็บแต้มได้" */
  badges?: ReactNode;
  /** เนื้อหาเสริมเหนือปุ่มนำทาง เช่น ราคาน้ำมัน หรือปุ่มแชร์ */
  footer?: ReactNode;
};

const brandIcon = (osmValue: string) => (osmValue === "fuel" ? Fuel : osmValue === "charging_station" ? Zap : MapPin);

export function StoreCard({ store, compact = false, actions, badges, footer }: StoreCardProps) {
  const brand = getBrand(store.brandId);
  const Icon = brandIcon(brand.osmValue);
  return <article className="surface rounded-2xl p-4 md:p-5">
    <div className="flex items-start gap-3">
      <span className="mt-1 grid size-11 shrink-0 place-items-center rounded-xl" style={{ background: brand.bg, color: brand.color }}><Icon size={22} /></span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2"><h3 className="display-font font-bold">{store.name}</h3><span className="rounded-full px-2 py-1 text-[11px] font-bold" style={{ color: brand.color, background: brand.bg }}>{brand.name}</span>{badges}</div>
        <p className="mt-1 text-sm text-[var(--muted)]">{store.address || "ข้อมูลจาก OpenStreetMap"} · <strong className="text-[var(--green-dark)]">{formatDistance(store.distanceKm)}</strong></p>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
    </div>
    {!compact && <div className="mt-4 flex flex-wrap gap-3 text-xs text-[var(--muted)]">
      {store.is24Hours && <span className="inline-flex items-center gap-1"><Clock3 size={14} /> เปิด 24 ชม.</span>}
      {store.hasParking && <span className="inline-flex items-center gap-1"><ParkingCircle size={14} /> ที่จอดรถ</span>}
      {store.hasAtm && <span className="inline-flex items-center gap-1"><Landmark size={14} /> ATM</span>}
    </div>}
    {footer}
    <a href={navigationUrl(store)} target="_blank" rel="noreferrer" className="btn-primary mt-4 w-full !py-2.5 text-sm"><Navigation size={16} /> นำทางด้วย Google Maps</a>
    {!compact && <a href={`https://www.openstreetmap.org/edit#map=19/${store.lat}/${store.lng}`} target="_blank" rel="noreferrer" className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-[var(--muted)] hover:text-[var(--green)]"><ExternalLink size={13} /> แก้ไขข้อมูลร้านนี้บน OpenStreetMap</a>}
  </article>;
}
