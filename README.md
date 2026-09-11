<div align="center">

<img src="app/icon.svg" width="92" alt="Klai logo" />

# Klai · ใกล้กว่าที่คิด

### หาร้านสะดวกซื้อและคาเฟ่ใกล้ตัว เลือกหลายแบรนด์ได้ในครั้งเดียว

[![Next.js](https://img.shields.io/badge/Next.js-16-111111?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-087EA4?logo=react&logoColor=white)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![OpenStreetMap](https://img.shields.io/badge/Data-OpenStreetMap-7EBC6F?logo=openstreetmap&logoColor=white)](https://www.openstreetmap.org/)
[![License](https://img.shields.io/badge/Project-Personal_MVP-E85D12)](#license--data)

**ฟรี · ไม่ต้องสมัคร · ไม่มี backend ของตัวเอง · ไม่สร้างโปรไฟล์ผู้ใช้**

[เริ่มต้นใช้งาน](#-quick-start) · [ดูฟีเจอร์](#-มีอะไรใน-klai) · [อ่านสถาปัตยกรรม](#-ทำงานอย่างไร)

</div>

---

## 🌤️ Klai คืออะไร

**Klai** คือเว็บแอป client-side สำหรับค้นหาร้านสะดวกซื้อและคาเฟ่รอบตำแหน่งปัจจุบัน ดึงข้อมูลสดจาก OpenStreetMap ผ่าน Overpass API คำนวณระยะทางบนอุปกรณ์ แล้วส่งต่อไป Google Maps เมื่อต้องการนำทาง

> จากคำถามง่าย ๆ ว่า “ร้านไหนใกล้ที่สุด?” สู่เครื่องมือวางแผนก่อนแวะที่ไม่ต้องแลกด้วยบัญชีผู้ใช้หรือข้อมูลส่วนตัว

## ✨ มีอะไรใน Klai

| | ฟีเจอร์ | สิ่งที่ทำได้ |
|---:|---|---|
| 🗺️ | **Multi-brand Map** | เลือกหลายแบรนด์ ดู pin แยกสี ค้นหาร้าน และเลือกจุดบนแผนที่ |
| 📍 | **Nearby Stores** | กรองชื่อ แบรนด์ รัศมี เวลาเปิด ที่จอดรถ ATM และร้านในปั๊ม |
| 🧮 | **Distance First** | คำนวณ Haversine และเรียงร้านจากใกล้ไปไกลบน browser |
| 🧺 | **Shopping List** | เพิ่มของ แบ่งหมวด ปรับจำนวน ติ๊กของ และบันทึกไว้ในเครื่อง |
| 💬 | **Share to LINE** | สร้างข้อความลิสต์พร้อมส่งต่อ หรือใช้ Web Share / คัดลอกข้อความ |
| ⛽ | **Combo Prototype** | ทดลองจับคู่ปั๊มน้ำมันกับร้านในเครือจากระยะห่างของจุดข้อมูล OSM — เริ่มจาก PTT ก่อน คู่ Caltex/Star Petroleum + Jiffy ยังรอ verify |
| 🧭 | **One-tap Navigation** | เปิดเส้นทางไปยังจุดหมายด้วย Google Maps โดยไม่ใช้ API key |

### แบรนด์ที่ค้นหาได้

`7-Eleven` · `Café Amazon` · `อินทนิล` · `พันธุ์ไทย` · `Black Canyon` · `PTT` · `CJ More` · `Jiffy`

> `Chao Doi` เตรียมไว้ใน Brand Registry แต่ยังไม่เปิดใช้จนกว่าจะยืนยันรูปแบบ tag ใน OSM ได้ค่ะ
>
> ตั้งแต่ v0.6 `PTT` ค้นหาได้อิสระผ่าน Map/List Store เหมือนแบรนด์อื่น (แสดงทุกสาขา ไม่ใช่แค่สาขาที่มีร้านในเครือ) แยกจากโหมด Combo ที่กรองเฉพาะปั๊มที่จับคู่กับร้านสำเร็จ

## 🪄 User flow

```text
เปิด Klai
   │
   ├─ ค้นหาร้านใกล้ฉัน ── ขอ GPS ── Map / List ── นำทางด้วย Google Maps
   │
   ├─ ดูแผนที่ทั้งหมด ─── Browse mode โดยยังไม่ขอ GPS
   │
   └─ จดลิสต์ของ ─────── เก็บในเครื่อง ── ส่ง LINE / แชร์ / คัดลอก
```

## 🚀 Quick start

ต้องมี [Node.js](https://nodejs.org/) 20.9 ขึ้นไป จากนั้นรัน:

```bash
npm install
npm run dev
```

เปิด **http://localhost:3000** แล้วเลือก “ค้นหาร้านใกล้ฉัน” เพื่อเริ่มใช้งาน

### คำสั่งที่ใช้บ่อย

| คำสั่ง | ใช้ทำอะไร |
|---|---|
| `npm run dev` | เปิด development server |
| `npm test` | รัน unit tests ด้วย Vitest |
| `npm run lint` | ตรวจ ESLint และกฎของ Next.js |
| `npm run build` | type-check, build และ static export ไปที่ `out/` |

## 🧩 Routes

| Route | หน้าที่ |
|---|---|
| `/` | Landing page และจุดเริ่มต้นของ user flow |
| `/map` | แผนที่หลายแบรนด์, search, radius และ selected-store sheet |
| `/stores` | รายชื่อร้านพร้อมตัวกรองแบบละเอียด |
| `/shopping-list` | เช็กลิสต์แบ่งหมวดและเครื่องมือแชร์ |
| `/gas-station-combo` | Gas Station Combo prototype จาก proximity matching (PTT proven, คู่อื่นรอ verify) |
| `/about` | ที่มา Disclaimer และ OpenStreetMap attribution |

## 🧠 ทำงานอย่างไร

```text
HTML5 Geolocation
        │
        ▼
Brand Registry ──► Overpass union query ──► OSM nodes / ways
                                                │
                                                ▼
                                  Normalize + Haversine distance
                                                │
                           ┌────────────────────┼────────────────────┐
                           ▼                    ▼                    ▼
                       Leaflet Map          Store List       Fuel proximity match
                           │                    │                    │
                           └──────────── Google Maps deep link ◄────┘
```

### หลักการสำคัญ

- **Single Brand Registry** — สี ชื่อ OSM tags และคู่ปั๊มอยู่ใน config กลาง
- **Client-side only** — ไม่มี API หรือฐานข้อมูลของ Klai เอง
- **Privacy by architecture** — พิกัดใช้ชั่วคราวเพื่อค้นหาผ่าน Overpass และไม่ถูกเก็บในฐานข้อมูลของโปรเจกต์
- **Graceful fallback** — Overpass มี mirror fallback และผลค้นหามี cache อายุสั้น
- **Static deploy** — build เป็นไฟล์ static พร้อมนำไปวางบน Vercel, Netlify หรือ static hosting อื่น

## 🗂️ Project structure

```text
Klai/
├── app/            # Next.js routes, layout และ global styles
├── components/     # UI ที่ใช้ร่วมกัน เช่น Map, Brand chips และ Store cards
├── hooks/          # ตำแหน่ง, การค้นหาร้าน และ search preferences
├── lib/            # Brand Registry, Overpass, Haversine และ domain logic
├── tests/          # Tests ตาม public seams ของ business logic
├── spec/           # Product spec และรายละเอียดรายโมดูล
├── html/           # HTML visual references
└── design/         # Design canvas และ wireframes ต้นฉบับ
```

## ✅ Quality checks

Logic สำคัญถูกทดสอบผ่าน public interfaces:

- Haversine distance
- Overpass union query และ OSM normalization
- Search / brand / radius / facility filtering
- Shopping List state transitions และ persistence hydration
- Fuel-station proximity matching

```bash
npm test && npm run lint && npm run build
```

## ⚠️ ข้อจำกัดที่ควรรู้

- ข้อมูลร้านและสิ่งอำนวยความสะดวกขึ้นกับความครบถ้วนของ OpenStreetMap
- Overpass เป็น public service จึงไม่มี SLA และอาจตอบช้าบางช่วง
- Gas Station Combo เป็น **prototype**: OSM ไม่มี field ที่บอกว่าร้านอยู่ในปั๊มโดยตรง จึงต้องประมาณจากระยะห่างของพิกัด
- LINE share เหมาะกับมือถือที่ติดตั้ง LINE; อุปกรณ์อื่นใช้ Web Share หรือคัดลอกข้อความแทนได้

## 🤝 Data & attribution

ข้อมูลแผนที่และตำแหน่งร้านมาจากผู้ร่วมแก้ไข [OpenStreetMap](https://www.openstreetmap.org/copyright) ภายใต้ Open Database License หากพบข้อมูลผิด สามารถช่วยแก้ไขที่ต้นทางเพื่อให้ทุกคนได้รับข้อมูลที่ดีขึ้น

## License & data

โค้ดชุดนี้เป็น personal MVP โปรดตรวจสอบสิทธิ์ก่อนนำไปเผยแพร่หรือใช้งานต่อ ข้อมูล OpenStreetMap อยู่ภายใต้เงื่อนไขของผู้ให้บริการข้อมูล และชื่อแบรนด์ทั้งหมดเป็นทรัพย์สินของเจ้าของแบรนด์นั้น ๆ

---

<div align="center">

สร้างด้วย 🧡 เพื่อให้คำว่า **“ใกล้”** ตอบได้ในไม่กี่วินาที

</div>
