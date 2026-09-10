import { AlertTriangle, LoaderCircle, LocateFixed } from "lucide-react";

export function StatusPanel({ status, error, retry }: { status: "idle" | "locating" | "loading" | "ready" | "error"; error: string; retry: () => void }) {
  if (status === "ready") return null;
  return <div className="surface flex min-h-36 flex-col items-center justify-center rounded-2xl p-6 text-center">
    {status === "idle" ? <><LocateFixed className="mb-2 text-[var(--orange)]" /><p className="font-semibold">โหมดดูแผนที่โดยยังไม่ใช้ตำแหน่ง</p><button onClick={retry} className="btn-primary mt-4 !py-2 text-sm"><LocateFixed size={16} /> ใช้ตำแหน่งของฉัน</button></> : status === "error" ? <><AlertTriangle className="mb-2 text-[var(--orange)]" /><p className="font-semibold">{error}</p><button onClick={retry} className="btn-secondary mt-4 !py-2 text-sm"><LocateFixed size={16} /> ลองระบุตำแหน่งอีกครั้ง</button></> : <><LoaderCircle className="mb-3 animate-spin text-[var(--orange)]" /><p className="font-semibold">{status === "locating" ? "กำลังหาตำแหน่งของคุณ…" : "กำลังค้นหาร้านจาก OpenStreetMap…"}</p></>}
  </div>;
}
