import { MapPin } from "lucide-react";

export function Logo({ compact = false }: { compact?: boolean }) {
  return <span className="display-font inline-flex items-center gap-2 font-extrabold text-[var(--green-dark)]">
    <span className="grid size-9 place-items-center rounded-xl bg-[var(--orange)] text-white shadow-sm"><MapPin size={20} strokeWidth={2.6} /></span>
    {!compact && <span className="text-xl">Klai</span>}
  </span>;
}
