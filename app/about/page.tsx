import { Database, ExternalLink, Heart, Mail, MapPinned, ShieldCheck } from "lucide-react";
import { PageFrame } from "@/components/PageFrame";
import { Logo } from "@/components/Logo";

export default function AboutPage() {
  return <PageFrame>
    <section className="container-wide max-w-4xl py-10 md:py-16">
      <div className="text-center"><div className="inline-flex"><Logo /></div><h1 className="display-font mt-6 text-4xl font-extrabold">ใกล้กว่าที่คิด</h1><p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-[var(--muted)]">Klai เป็นโปรเจกต์ส่วนตัวที่ช่วยหาร้านสะดวกซื้อและคาเฟ่รอบตัว โดยไม่ต้องสมัครสมาชิกและไม่มีฐานข้อมูลผู้ใช้</p></div>
      <div className="mt-10 grid gap-4 md:grid-cols-3">{[[MapPinned, "ข้อมูลสด", "ค้นหาจาก OpenStreetMap ทุกครั้ง"], [Database, "ไม่มีฐานข้อมูล", "ไม่เก็บพิกัดหรือข้อมูลส่วนตัว"], [Heart, "สร้างเพื่อชุมชน", "ใช้ฟรี และอาศัยข้อมูลเปิด"]].map(([Icon, title, text]) => { const CardIcon = Icon as typeof MapPinned; return <article key={String(title)} className="surface rounded-2xl p-5"><CardIcon className="text-[var(--orange)]" /><h2 className="display-font mt-4 font-bold">{String(title)}</h2><p className="mt-2 text-sm leading-6 text-[var(--muted)]">{String(text)}</p></article>; })}</div>
      <article className="mt-8 rounded-3xl border-2 border-amber-200 bg-amber-50 p-6 md:p-8"><div className="flex items-center gap-3 text-amber-900"><ShieldCheck /><h2 className="display-font text-xl font-extrabold">ข้อจำกัดความรับผิดชอบ</h2></div><p className="mt-4 leading-8 text-amber-950/80">“Klai” เป็นโปรเจกต์อิสระที่พัฒนาโดยบุคคลทั่วไป <strong>ไม่มีความเกี่ยวข้อง ไม่ได้เป็นพันธมิตร และไม่ได้รับการรับรองจากแบรนด์ใดๆ ที่ปรากฏในแอป</strong> (รวมถึงแต่ไม่จำกัดเพียง 7-Eleven, ซีพี ออลล์, Café Amazon, PTT, อินทนิล, บางจาก, พันธุ์ไทย, PT, Black Canyon และ Chao Doi) แต่อย่างใด ข้อมูลตำแหน่งร้านค้าอ้างอิงจาก OpenStreetMap ซึ่งเป็นข้อมูลโอเพนซอร์สที่ชุมชนช่วยกันปรับปรุง อาจมีความคลาดเคลื่อนหรือไม่ครบถ้วน ผู้ใช้ควรตรวจสอบข้อมูลอีกครั้งก่อนการเดินทาง</p></article>
      <div className="surface mt-8 rounded-3xl p-6 md:p-8"><h2 className="display-font text-xl font-extrabold">ช่วยกันทำให้ข้อมูลดีขึ้น</h2><p className="mt-2 leading-7 text-[var(--muted)]">พบชื่อร้านหรือตำแหน่งผิด สามารถแก้ที่ต้นทางบน OpenStreetMap หรือส่งข้อเสนอแนะทางอีเมลได้ค่ะ</p><div className="mt-5 flex flex-wrap gap-3"><a className="btn-secondary" href="https://www.openstreetmap.org/edit" target="_blank" rel="noreferrer"><ExternalLink size={17} /> แก้ไขบน OpenStreetMap</a><a className="btn-secondary" href="mailto:hello@klai.app?subject=%E0%B9%81%E0%B8%88%E0%B9%89%E0%B8%87%E0%B8%9B%E0%B8%B1%E0%B8%8D%E0%B8%AB%E0%B8%B2%20Klai"><Mail size={17} /> แจ้งปัญหา</a></div></div>
    </section>
  </PageFrame>;
}
