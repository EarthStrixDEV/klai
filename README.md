# Klai

Klai คือเว็บแอปค้นหาร้านสะดวกซื้อและคาเฟ่ใกล้ตัวจากข้อมูล OpenStreetMap แบบ client-side ล้วน ไม่มีระบบสมาชิก ไม่มี backend และไม่มีฐานข้อมูลของตัวเอง

## Tech stack

- Next.js 16 (App Router, static export)
- React 19 + TypeScript
- Tailwind CSS 4
- Lucide React
- Leaflet + OpenStreetMap tiles
- Vitest

## เริ่มใช้งาน

```bash
npm install
npm run dev
```

เปิด `http://localhost:3000`

## คำสั่งตรวจสอบ

```bash
npm test
npm run lint
npm run build
```

ผลจาก `npm run build` จะเป็น static site ในโฟลเดอร์ `out/`

## Routes

- `/` — Landing page
- `/map` — แผนที่ร้านใกล้ตัวและ multi-brand filter
- `/stores` — รายชื่อร้านพร้อมค้นหาและตัวกรอง
- `/shopping-list` — เช็กลิสต์ที่บันทึกใน `localStorage` และแชร์ไป LINE
- `/gas-station-combo` — จับคู่ปั๊มกับร้านในเครือจากระยะใกล้เคียง
- `/about` — ที่มา ข้อจำกัดความรับผิดชอบ และ OSM attribution

## หมายเหตุข้อมูล

ข้อมูลร้านขึ้นกับความครบถ้วนของ OpenStreetMap และบริการ Overpass สาธารณะ การจับคู่ Gas Station Combo ใช้ proximity threshold จึงเป็นค่าประมาณ ไม่ใช่ความสัมพันธ์ที่ OSM รับรองโดยตรง
