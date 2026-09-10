import Link from "next/link";
import { ArrowRight, BadgeCheck, Coffee, ListChecks, LocateFixed, Map, MapPin, Navigation, ShieldCheck, Store, Zap } from "lucide-react";
import { PageFrame } from "@/components/PageFrame";

const steps = [
  [LocateFixed, "อนุญาตตำแหน่ง", "Klai ใช้ GPS เฉพาะตอนค้นหา และไม่เก็บตำแหน่งไว้"],
  [Store, "เลือกแบรนด์", "ค้นหาร้านสะดวกซื้อและคาเฟ่หลายแบรนด์พร้อมกัน"],
  [Navigation, "เลือกแล้วออกเดินทาง", "เปิดเส้นทางต่อใน Google Maps ได้ทันที"],
];

export default function HomePage() {
  return <PageFrame>
    <section className="relative overflow-hidden py-16 md:py-24">
      <div className="absolute -right-20 top-10 size-80 rounded-full bg-orange-200/40 blur-3xl" />
      <div className="container-wide grid items-center gap-12 md:grid-cols-[1.05fr_.95fr]">
        <div className="relative z-10">
          <p className="eyebrow">ร้านใกล้ อยู่แค่ปลายนิ้ว</p>
          <h1 className="display-font mt-4 text-4xl font-extrabold leading-[1.15] tracking-tight md:text-6xl">หาร้านสะดวกซื้อ<br /><span className="text-[var(--orange)]">ใกล้ตัวคุณ</span></h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--muted)]">ค้นหาร้านและคาเฟ่ที่สนใจจากตำแหน่งปัจจุบัน เปรียบเทียบระยะทาง แล้วเปิดนำทางได้เลย</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link href="/map" className="btn-primary"><MapPin size={19} /> ค้นหาร้านใกล้ฉัน</Link><Link href="/stores" className="btn-secondary"><ListChecks size={19} /> ดูรายชื่อร้าน</Link></div>
          <div className="mt-8 flex flex-wrap gap-5 text-sm text-[var(--muted)]"><span className="inline-flex gap-2"><BadgeCheck size={18} className="text-[var(--green)]" />ใช้ฟรี</span><span className="inline-flex gap-2"><ShieldCheck size={18} className="text-[var(--green)]" />ไม่ต้องสมัคร</span><span className="inline-flex gap-2"><Zap size={18} className="text-[var(--green)]" />ข้อมูลเปิด</span></div>
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-[470px]">
          <div className="absolute inset-[8%] rounded-[34%_66%_54%_46%] bg-[#dfeee5]" />
          <div className="surface absolute inset-x-[8%] top-[18%] rounded-3xl p-5 rotate-2">
            <div className="mb-5 flex items-center justify-between"><span className="display-font font-bold">ร้านใกล้คุณ</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-[var(--orange)]">5 ร้าน</span></div>
            {[["7-Eleven", "280 ม.", "#e85d12"], ["Café Amazon", "650 ม.", "#116149"], ["อินทนิล", "1.1 กม.", "#72a942"]].map(([name, distance, color]) => <div key={name} className="mb-3 flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-white p-3"><span className="grid size-10 place-items-center rounded-xl text-white" style={{ background: color }}><Coffee size={19} /></span><strong className="flex-1">{name}</strong><span className="text-sm text-[var(--muted)]">{distance}</span></div>)}
          </div>
        </div>
      </div>
    </section>
    <section className="bg-white py-16 md:py-20"><div className="container-wide text-center"><p className="eyebrow">ง่ายและเป็นส่วนตัว</p><h2 className="display-font mt-3 text-3xl font-extrabold md:text-4xl">ใช้งานง่ายใน 3 ขั้นตอน</h2><div className="mt-10 grid gap-5 md:grid-cols-3">{steps.map(([Icon, title, body], index) => { const StepIcon = Icon as typeof Map; return <div key={String(title)} className="rounded-3xl border border-[var(--border)] p-7 text-left"><span className="mb-5 grid size-12 place-items-center rounded-2xl bg-orange-50 text-[var(--orange)]"><StepIcon /></span><small className="font-bold text-[var(--orange)]">0{index + 1}</small><h3 className="display-font mt-2 text-xl font-bold">{String(title)}</h3><p className="mt-2 leading-7 text-[var(--muted)]">{String(body)}</p></div>; })}</div></div></section>
    <section className="py-16 md:py-20"><div className="container-wide grid gap-5 md:grid-cols-3"><Link href="/map" className="surface rounded-3xl p-7 hover:-translate-y-1 transition"><Map className="text-[var(--green)]" /><h3 className="display-font mt-5 text-xl font-bold">แผนที่หลายแบรนด์</h3><p className="mt-2 text-[var(--muted)]">เห็นตำแหน่งร้านด้วยสีที่แยกง่าย</p></Link><Link href="/shopping-list" className="surface rounded-3xl p-7 hover:-translate-y-1 transition"><ListChecks className="text-[var(--orange)]" /><h3 className="display-font mt-5 text-xl font-bold">จดก่อนออกไปซื้อ</h3><p className="mt-2 text-[var(--muted)]">เช็กลิสต์ของพร้อมส่งต่อไป LINE</p></Link><Link href="/gas-station-combo" className="surface rounded-3xl p-7 hover:-translate-y-1 transition"><Coffee className="text-[#8a5638]" /><h3 className="display-font mt-5 text-xl font-bold">แวะเดียวครบ</h3><p className="mt-2 text-[var(--muted)]">หาปั๊มที่มีร้านหรือคาเฟ่อยู่ใกล้กัน</p></Link></div></section>
    <section className="container-wide mb-16 rounded-[32px] bg-[var(--green-dark)] px-6 py-12 text-center text-white md:px-12"><h2 className="display-font text-3xl font-extrabold">พร้อมหาร้านใกล้ตัวหรือยัง?</h2><p className="mt-3 text-white/75">ไม่มีค่าใช้จ่าย ไม่ต้องสร้างบัญชี</p><Link href="/map" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-bold text-[var(--orange)]">เริ่มค้นหา <ArrowRight size={18} /></Link></section>
  </PageFrame>;
}
