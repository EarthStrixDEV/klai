import { AlertTriangle, Phone } from "lucide-react";
import { PageFrame } from "@/components/PageFrame";
import { criticalContacts, emergencyGroups, lastReviewed } from "@/lib/emergency";

export default function EmergencyPage() {
  return <PageFrame>
    <section className="container-wide max-w-3xl py-8 md:py-12">
      <p className="eyebrow">ช่วยเหลือฉุกเฉิน</p>
      <h1 className="display-font mt-1 text-3xl font-extrabold">เบอร์โทรฉุกเฉิน</h1>
      <p className="mt-3 leading-7 text-[var(--muted)]">รวมเบอร์โทรฉุกเฉินหลักของไทย ไว้ให้กดโทรได้เร็วเวลาเจอเหตุฉุกเฉินระหว่างเดินทาง</p>

      <div className="mt-7 rounded-3xl bg-red-600 p-6 text-white">
        <div className="flex items-center gap-2"><AlertTriangle size={20} /><span className="font-bold">เหตุฉุกเฉิน — โทรได้ทันที</span></div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {criticalContacts.map((contact) => <a key={contact.number} href={`tel:${contact.number}`} className="grid place-items-center gap-1 rounded-2xl bg-white/15 px-2 py-4 transition hover:bg-white/25">
            <span className="display-font text-2xl font-extrabold md:text-3xl">{contact.number}</span>
            <span className="text-center text-[11.5px] text-white/85">{contact.label}</span>
          </a>)}
        </div>
      </div>

      {emergencyGroups.map((group) => <div key={group.title} className="mt-7">
        <h2 className="text-sm font-bold text-[var(--muted)]">{group.title}</h2>
        <div className="mt-3 grid gap-2.5">
          {group.contacts.map((contact) => <div key={contact.number} className="surface flex items-center gap-3 rounded-2xl px-4 py-3.5">
            <span className="min-w-0 flex-1 font-semibold">{contact.label}</span>
            <span className="display-font text-lg font-extrabold text-red-600">{contact.number}</span>
            <a href={`tel:${contact.number}`} aria-label={`โทร ${contact.label} ${contact.number}`} className="grid size-9 shrink-0 place-items-center rounded-full bg-red-50 text-red-700 transition hover:bg-red-100"><Phone size={16} /></a>
          </div>)}
        </div>
      </div>)}

      <article className="mt-8 rounded-3xl border-2 border-amber-200 bg-amber-50 p-6">
        <p className="leading-8 text-amber-950/80">รายชื่อเบอร์โทรฉุกเฉินนี้รวบรวมจากแหล่งข้อมูลสาธารณะเพื่อความสะดวก <strong>ไม่ใช่ข้อมูลที่ Klai รับรองความถูกต้อง 100%</strong> เบอร์บางรายการอาจมีการเปลี่ยนแปลงได้ กรุณาตรวจสอบเบอร์อีกครั้งก่อนใช้งานในสถานการณ์ฉุกเฉินจริง</p>
        <p className="mt-3 text-sm text-amber-950/60">ข้อมูล ณ {lastReviewed}</p>
      </article>
    </section>
  </PageFrame>;
}
