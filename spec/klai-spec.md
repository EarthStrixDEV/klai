# Klai — Spec (v0.6)

> **Klai** — หาร้านสะดวกซื้อใกล้ตัว
> โปรเจกต์ส่วนตัว / MVP — Client-side ล้วนๆ ไม่มี server, ไม่มี database ของตัวเอง
> Wireframe อ้างอิง: [แคนวาสดีไซน์](https://claude.ai/code/artifact/1fa2cb12-e659-4ce3-8c23-be33630eb627) *(sync เป็น multi-brand แล้ว)*
>
> *ชื่อเดิม "7-11 Finder" — เปลี่ยนเป็น "Klai" เพื่อไม่ผูกกับแบรนด์ 7-Eleven ตรงๆ ในชื่อแอป เปิดทางขยายไปหาแบรนด์อื่นได้ — v0.5 นี้คือจุดที่ขยายจริงแล้ว: จากแอปหา "7-Eleven อย่างเดียว" เป็นแอปหา "ร้านสะดวกซื้อ/คาเฟ่ที่เลือกได้หลายแบรนด์พร้อมกัน"*

## 1. Problem

คนอยากรู้ว่าร้านสะดวกซื้อ/คาเฟ่ที่ใกล้ตัวที่สุดอยู่ตรงไหน อยากได้ตัวช่วยวางแผนก่อนแวะซื้อของ — เริ่มจากปัญหาเฉพาะ 7-Eleven ก่อน แล้วพบว่าคนละแบรนด์ก็มีปัญหาเดียวกัน (อินทนิล, พันธุ์ไทย, Black Canyon, Chao Doi ฯลฯ) จึงขยายให้เลือกแบรนด์ที่สนใจเองได้ — ทำโปรเจกต์นี้เพื่อฝึกทำระบบ geospatial ของตัวเอง แบบไม่ต้องพึ่ง infrastructure ที่มีค่าใช้จ่าย

## 2. Goal

- หาร้าน (แบรนด์ที่เลือกไว้) ที่ใกล้ตำแหน่งปัจจุบันของ user ได้ถูกต้อง — เลือกได้หลายแบรนด์พร้อมกันในการค้นหาเดียว
- ช่วยวางแผนก่อนซื้อ (ลิสต์ของ, หาปั๊มน้ำมันที่มีร้านในเครืออยู่ในตัว) โดยไม่เพิ่มความซับซ้อนของระบบ
- **ต้นทุน infrastructure = $0 และ 0 maintenance** — ไม่มี server ให้ล่ม ไม่มี DB ให้ backup
- เพิ่มแบรนด์ใหม่ในอนาคตได้โดยแก้แค่ "Brand Registry" (ดูหัวข้อ 4) ไม่ต้องแตะ logic หลักของแอป

## 3. Scope

**In scope (v1)**
- ค้นหาร้านใกล้ตัวจากตำแหน่ง GPS ปัจจุบัน — **เลือกได้หลายแบรนด์พร้อมกัน** จากรายชื่อที่รองรับ (ดู Brand Registry) ดึงข้อมูลสดจาก OSM ทุกครั้ง
- แสดงผลบนแผนที่ (แยกสี pin ตามแบรนด์) + list เรียงตามระยะทาง พร้อมค้นหา/filter
- กดเพื่อเปิด Google Maps นำทางไปร้าน (deep link ธรรมดา ฟรี ไม่ต้องใช้ API key)
- **Gas Station Combo Finder** — กรองหาปั๊มน้ำมันที่มีร้านในเครืออยู่ในตัว ครอบคลุมหลายคู่ปั๊ม-ร้าน ไม่ใช่แค่ PTT+7-Eleven (ดู 4.5)
- ทำลิสต์ของที่อยากซื้อ (checklist ไม่มีราคา) และส่งลิสต์ไป LINE ได้

**Out of scope (v1)**
- **ไม่มี server-side database** — ไม่เก็บพิกัดร้าน/ข้อมูลผู้ใช้ไว้เอง
- **ไม่มี backend API ของตัวเอง** — client เรียก OSM/LINE ตรงๆ
- ระบบนำทาง (turn-by-turn) ในแอปเอง — deep link ไป Google Maps แทน
- Login/account ผู้ใช้
- **ราคาสินค้า/เปรียบเทียบราคา** — ดูหัวข้อ "ฟีเจอร์ที่ตัดออก" ด้านล่าง

### ฟีเจอร์ที่พิจารณาแล้วตัดออก

| ฟีเจอร์ | เหตุผลที่ตัด |
|---|---|
| เปรียบเทียบราคาสินค้าระหว่างสาขา | ไม่มี API ราคาจากแบรนด์ไหนอย่างเป็นทางการ การทำ crowd-source ราคาต้องมี DB เก็บ ซึ่งขัดกับสถาปัตยกรรม "ไม่มี DB" ที่ตั้งไว้ |
| แสดงราคาสินค้าในลิสต์ของที่จะซื้อ | เหตุผลเดียวกับด้านบน — ไม่มีแหล่งราคาที่เชื่อถือได้แบบไม่ต้องมี backend |

## 4. Brand Registry (สถาปัตยกรรมใหม่ใน v0.5)

หัวใจของการรองรับหลายแบรนด์คือ **config รายชื่อแบรนด์** ตัวเดียว ที่ทั้ง Map, List Store และ Gas Station Combo Finder อ่านค่าจากตรงนี้ร่วมกัน — เพิ่มแบรนด์ใหม่ทีหลัง แก้แค่ตารางนี้ ไม่ต้องแก้ logic ของแต่ละหน้า

| แบรนด์ | ประเภท | OSM tag ที่ใช้กรอง (แนวทาง) | สีที่ใช้บนแผนที่ | หมายเหตุ |
|---|---|---|---|---|
| 7-Eleven | ร้านสะดวกซื้อ | `shop=convenience` + `brand~"7-Eleven"` | ส้ม | ค่าเริ่มต้น/default ของแอป — OSM coverage ในไทยค่อนข้างดีเพราะสาขาเยอะมาก |
| Café Amazon | คาเฟ่ | `amenity=cafe` + `brand~"Café Amazon"` | เขียวเข้ม | ส่วนใหญ่อยู่ในปั๊ม PTT |
| อินทนิล (Inthanin) | คาเฟ่ | `amenity=cafe` + `brand~"Inthanin"` | เขียวอ่อน | ส่วนใหญ่อยู่ในปั๊มบางจาก |
| พันธุ์ไทย (Punthai Coffee) | คาเฟ่ | `amenity=cafe` + `brand~"Punthai"` | น้ำตาล | ส่วนใหญ่อยู่ในปั๊ม PT (PTG) |
| Black Canyon | คาเฟ่/ร้านอาหาร | `amenity=cafe` หรือ `restaurant` + `brand~"Black Canyon"` | แดง | ไม่ได้ผูกกับปั๊มน้ำมันแบรนด์ใดแบรนด์หนึ่ง พบทั่วไปในห้าง/อาคารสำนักงาน — เข้า Map/List Store ได้ แต่ **ไม่เข้าเงื่อนไข Gas Station Combo** |
| Chao Doi | คาเฟ่/ร้านชา | `amenity=cafe` + `brand~"..."` (ยังไม่ยืนยัน tag ที่แน่นอน) | ม่วง | สาขาน้อยกว่าเจ้าอื่นมาก ความครบถ้วนของ OSM ยังไม่ทราบ — **ต้องเช็คผ่าน overpass-turbo.eu ก่อนเปิดใช้จริง** |
| PTT (ปั๊มน้ำมัน) | ปั๊มน้ำมัน | `amenity=fuel` + `brand~"PTT"` | น้ำเงิน | **ใหม่ใน v0.6** — ต่างจากแบรนด์อื่นตรงที่ค้นหาได้อิสระ ไม่ต้องมีร้าน/คาเฟ่ในเครือถึงจะแสดง (คนละกรณีกับ Gas Station Combo Finder ที่กรองเฉพาะปั๊มที่มีร้านในเครือ — ดู 5.5) |
| CJ More | ร้านสะดวกซื้อ | `shop=convenience` + `brand~"CJ More"` | ชมพู/แดงอมชมพู | **ใหม่ใน v0.6** — ไม่ได้ผูกกับปั๊มน้ำมันแบรนด์ใดแบรนด์หนึ่ง เหมือน Black Canyon/Chao Doi — **ไม่เข้าเงื่อนไข Gas Station Combo** |
| Jiffy | ร้านสะดวกซื้อ | `shop=convenience` + `brand~"Jiffy"` | เขียวอมฟ้า (teal) | **ใหม่ใน v0.6** — ส่วนใหญ่อยู่ในปั๊ม Caltex/Star Petroleum (ยังไม่ยืนยันชื่อแบรนด์ปั๊มที่ใช้ใน OSM จริง — ดู Open Questions) |

> ⚠️ **ยังไม่ได้ verify สด**: tag `brand` ของ Inthanin, Punthai, Black Canyon, Chao Doi, CJ More และ Jiffy ใน OSM ยังไม่ได้ตรวจสอบจริง (สภาพแวดล้อมตอนคุยกันนี้เรียก Overpass API ตรงๆ ไม่ได้) พี่เอิร์ธควรลองเช็คค่า `brand`/`name` ที่แต่ละสาขาใช้จริงผ่าน [overpass-turbo.eu](https://overpass-turbo.eu) ก่อนเขียนเป็น config จริง เผื่อบาง node ใส่แค่ `name` ไม่มี `brand` ทำให้กรองไม่เจอทั้งที่มีอยู่ ส่วน PTT (`amenity=fuel`) น่าจะ tag ไว้ค่อนข้างสมบูรณ์แล้วเพราะเป็นปั๊มน้ำมันเจ้าใหญ่ที่สุดในไทย แต่ก็ควรเช็คซ้ำก่อนใช้งานจริงเช่นกัน

## 5. Modules

แอปแบ่งเป็น 6 หน้า/โมดูล ดังนี้:

### 5.1 Home (Landing)
หน้าแรกสไตล์ landing page มืออาชีพ — hero พร้อม CTA, trust bar (ฟรี/ไม่ต้องสมัคร/ข้อมูลเปิด), how-it-works 3 ขั้นตอน, feature highlights, CTA banner ปิดท้าย เนื้อหาปรับเป็นกลางไม่พูดถึง 7-Eleven อย่างเดียวอีกต่อไป (ดู `01-home.md` module doc)

### 5.2 Map
แผนที่แสดงร้านรอบตัว **เลือกได้หลายแบรนด์พร้อมกันผ่าน chip แบบ multi-select** (ค่าเริ่มต้นติ๊ก 7-Eleven ไว้ให้) แต่ละแบรนด์ pin คนละสีตาม Brand Registry มี legend บอกสี พร้อม filter รัศมี (500ม./1กม./3กม./5กม.) และ bottom sheet แสดงร้านที่ใกล้สุด กดนำทางได้ทันที

### 5.3 List Store
รายชื่อร้านเรียงตามระยะทาง มีเครื่องมือช่วยค้นหาครบ:
- ช่องค้นหาชื่อร้าน/ย่าน
- **Filter แบรนด์ (multi-select เหมือนหน้า Map)** — แต่ละการ์ดมี badge สีบอกแบรนด์
- Filter รัศมี (500ม./1กม./3กม./5กม.)
- Filter เพิ่มเติม: เปิด 24 ชม. / มีที่จอดรถ / มี ATM / อยู่ในปั๊มน้ำมัน (ใช้ผลจาก Gas Station Combo Finder)
- เรียงลำดับ (ตามระยะทาง)

### 5.4 Shopping List
ลิสต์ของที่อยากซื้อก่อนไปร้าน — เพิ่มรายการ, จัดหมวดหมู่ (เครื่องดื่ม/ขนม/อาหารพร้อมทาน/ของใช้ประจำวัน), ปรับจำนวน, ติ๊กเมื่อหยิบแล้ว **ไม่มีราคา** (ดูเหตุผลในหัวข้อ 3) ไม่ผูกกับแบรนด์ใดแบรนด์หนึ่งอยู่แล้ว จึงไม่กระทบจาก multi-brand

**ส่งลิสต์ไป LINE**: ปุ่ม "ส่งไป LINE" ใช้ LINE URL scheme (`https://line.me/R/share?text=...`) — ไม่ต้องมี API key/backend, เปิด LINE พร้อมข้อความลิสต์ให้ user เลือกส่งเอง ใช้ได้เฉพาะแอปมือถือ (LINE บน PC ไม่รองรับ URL scheme นี้)

### 5.5 Gas Station Combo Finder *(เดิมชื่อ "PTT + 7-Eleven Combo Finder")*
กรองแสดงเฉพาะปั๊มน้ำมันที่มีร้านในเครืออยู่ในตัว เหมาะกับคนขับรถที่อยากแวะเติมน้ำมันพร้อมช้อป/จิบกาแฟทีเดียวจบ — ขยายจากเดิมที่ผูกกับ PTT+7-Eleven คู่เดียว เป็น**ตัวจับคู่ทั่วไปตาม config**:

| ปั๊มน้ำมัน | ร้าน/คาเฟ่ในเครือที่มักเจอ |
|---|---|
| PTT | 7-Eleven, Café Amazon |
| บางจาก (Bangchak) | อินทนิล (Inthanin) |
| PT (PTG) | พันธุ์ไทย (Punthai Coffee) |
| Caltex / Star Petroleum | Jiffy *(ใหม่ใน v0.6 — คู่จับคู่นี้เป็นการสันนิษฐานจากความรู้ทั่วไป ยังไม่ได้ verify ทั้งชื่อแบรนด์ปั๊มที่ใช้ใน OSM ปัจจุบันและความแม่นยำของการจับคู่ ต้อง prototype ก่อนเปิดใช้จริงเหมือนคู่อื่น)* |

แสดงระยะทาง, สิ่งอำนวยความสะดวก (EV charger, ห้องน้ำ, ที่จอดรถ), เวลาเปิด-ปิด — **Black Canyon, Chao Doi และ CJ More ไม่เข้าโมดูลนี้** เพราะไม่มีความสัมพันธ์กับปั๊มน้ำมันแบรนด์ใดแบรนด์หนึ่งแบบผูกขาด (พบทั่วไปในห้าง/อาคารมากกว่าปั๊ม) — ยังค้นหาได้ปกติผ่าน Map/List Store เช่นกัน ส่วน **PTT เองก็ค้นหาได้อิสระผ่าน Map/List Store แล้วตั้งแต่ v0.6** (ดูตาราง Brand Registry หัวข้อ 4) โดยไม่ต้องพึ่งโมดูลนี้ถ้าแค่อยากหาปั๊ม ไม่สนว่ามีร้านในเครือหรือเปล่า

> **หมายเหตุทางเทคนิค**: OSM ไม่มี tag มาตรฐานที่บอกตรงๆ ว่า "ปั๊มนี้มีร้าน X อยู่ข้างใน" ต้องคำนวณเองโดยจับคู่ node `amenity=fuel` (ตาม brand ปั๊มใน config) กับ node ร้าน/คาเฟ่ (ตาม brand คู่ที่ config ไว้) ที่อยู่ในระยะใกล้กันมากๆ (เช่น <50-80 เมตร) — เป็นงาน data engineering ที่ต้องพิสูจน์แนวคิดก่อนสร้างจริง ทำแบบเดียวกันได้กับทุกคู่ในตาราง เพราะ logic การจับคู่เป็นแบบเดียวกันหมด ต่างกันแค่ brand ที่ระบุใน config ดูหัวข้อ Open Questions

### 5.6 About
อธิบายที่มาของแอปและข้อมูล — ที่มาข้อมูล OSM, **disclaimer ว่าเป็นโปรเจกต์อิสระ ไม่เกี่ยวข้อง/ไม่ได้รับการรับรองจากแบรนด์ใดๆ ที่ปรากฏในแอป** (7-Eleven/ซีพี ออลล์, Café Amazon/PTT, อินทนิล/บางจาก, พันธุ์ไทย/PT, Black Canyon, Chao Doi, CJ More, Jiffy/Caltex-Star Petroleum) — ขยายจากเดิมที่พูดถึงแค่ 7-Eleven เพราะตอนนี้แสดงข้อมูลหลายแบรนด์พร้อมกัน, ช่องทางแจ้งปัญหา

## 6. Requirements

**Must-have (P0)**
- [ ] ยิง Overpass query แบบ "around" (รัศมี X กม. รอบพิกัด user) ตาม tag ของแต่ละแบรนด์ที่ติ๊กเลือกไว้ (parametrized จาก Brand Registry ไม่ hardcode)
- [ ] คำนวณระยะทางแบบ Haversine ฝั่ง client (JS ล้วน)
- [ ] แสดงแผนที่ + pin ตำแหน่งร้าน แยกสีตามแบรนด์ พร้อม legend (Leaflet + OSM tile)
- [ ] Brand filter chip แบบ multi-select ใช้ร่วมกันระหว่างหน้า Map และ List Store
- [ ] List Store: ค้นหา + filter แบรนด์ + filter รัศมี + filter เพิ่มเติม + เรียงลำดับ
- [ ] ปุ่มนำทาง — deep link ไป Google Maps เท่านั้น (`https://www.google.com/maps/dir/?api=1&destination={lat},{lng}`) ไม่แยก platform, ไม่เช็ค iOS/Android
- [ ] Shopping List: เพิ่ม/ลบ/ปรับจำนวนรายการ, ติ๊กเมื่อหยิบแล้ว
- [ ] ปุ่มส่งลิสต์ไป LINE (URL scheme)
- [ ] Loading state ระหว่างรอ Overpass ตอบ (โดยเฉพาะตอนติ๊กหลายแบรนด์ = ยิงหลาย query พร้อมกัน)

**Nice-to-have (P1)**
- [ ] Gas Station Combo Finder ครบทั้ง 3 คู่ปั๊ม (ต้องพิสูจน์แนวคิดการจับคู่ข้อมูลก่อนทีละคู่)
- [ ] Cache ผล query ไว้ใน `localStorage` กันยิง Overpass รัวๆ (แยก cache key ตามชุดแบรนด์ที่เลือก)
- [ ] Fallback ไป Overpass mirror server อื่น ถ้า server หลักช้า/ล่ม
- [ ] Web Share API (`navigator.share`) เป็นทางเลือกเสริมนอกจาก LINE โดยเฉพาะ

**Future considerations (P2)**
- เพิ่มแบรนด์อื่นเข้า Brand Registry ต่อเรื่อยๆ ตามที่ผู้ใช้ร้องขอ
- Filter ตามบริการอื่นๆ เพิ่มเติม

## 7. Tech Stack

| Layer | เลือกใช้ | เหตุผล |
|---|---|---|
| ข้อมูลร้าน | OSM Overpass API (query สดตาม bounding box, parametrized ด้วย brand tag จาก config) | ฟรี ไม่ต้องเก็บ/ดูแล data เอง — ไม่มีแบรนด์ไหนมี public API ให้ใช้ |
| Brand config | ไฟล์ config เดียว (Brand Registry) — array ของ `{name, category, osmBrandTag, pinColor, fuelBrandPair?}` | เพิ่ม/แก้แบรนด์โดยไม่ต้องแตะ logic |
| Distance calc | Haversine formula (client-side JS) | ไม่ต้องมี DB/PostGIS |
| Map display | Leaflet + OSM tile (หรือ Longdo ถ้าอยากได้ UX ดีกว่า) | ฟรี เบา พอสำหรับ MVP |
| Geolocation | HTML5 Geolocation API | ฟรี ไม่พึ่งบริการนอก |
| นำทาง | Google Maps URL scheme (`google.com/maps/dir/?api=1&destination=...`) | ไม่ต้องมี API key/billing — คนละแบบกับ Google Maps JS/Places API ที่ต้องผูกบัตร โฟกัสแค่ Google Maps ตัวเดียว ไม่รองรับ Apple Maps |
| แชร์ลิสต์ | LINE URL scheme (`line.me/R/share`) | ไม่ต้องมี backend/API key |
| Frontend | React/Next.js (static export) หรือ Vite | ไม่มี backend, deploy เป็น static site ล้วน |
| Hosting | Vercel/Netlify/GitHub Pages (free tier) | static site เปิดใช้ได้ทันที |

## 8. ตัวอย่าง Overpass Query

Query แบบ parametrized ตามแบรนด์ที่เลือก (ตัวอย่าง 7-Eleven + อินทนิล พร้อมกัน ใช้ `union` ยิงครั้งเดียว):

```
[out:json][timeout:15];
(
  node["shop"="convenience"]["brand"~"7-Eleven",i](around:3000,{lat},{lng});
  node["amenity"="cafe"]["brand"~"Inthanin",i](around:3000,{lat},{lng});
);
out body;
```

## 9. Brand & Design

- สีหลักของแอป: ส้ม-เขียว (ธีมของ Klai เอง ไม่ใช่ของแบรนด์ไหนแบรนด์หนึ่ง) — ใช้เป็น UI chrome (nav, ปุ่ม, CTA)
- สี pin บนแผนที่: แยกตามแบรนด์ตาม Brand Registry (ตาราง 4) เพื่อให้แยกออกตอนติ๊กหลายแบรนด์พร้อมกัน — เป็นคนละชุดสีกับธีมหลักของแอป
- Mascot: น้องหมาการ์ตูนดีไซน์เอง (ไม่ใช่ตัวละครลิขสิทธิ์) ถือหมุดแผนที่ ใช้เป็นตัวแทนแบรนด์บนหน้า Home / Shopping List / About
- ชื่อแอป **"Klai"** (ใกล้) — สั้น จำง่าย เป็นกลางทางแบรนด์ คู่กับ **tagline "หาร้านสะดวกซื้อใกล้ตัว"** เสมอในจุดที่แนะนำแอปครั้งแรก (nav/hero/About) — ยิ่งสำคัญขึ้นตอนนี้ที่แอปไม่ได้ผูกกับแบรนด์เดียวแล้ว
- ไม่ใช้โลโก้จริงของแบรนด์ไหนทั้งสิ้น (7-Eleven, PTT, บางจาก, PT, Café Amazon, CJ More, Jiffy, Caltex/Star Petroleum ฯลฯ) — ใช้ชื่อ/สีอ้างอิงเป็นข้อความล้วนเท่านั้น พร้อม disclaimer ครอบคลุมทุกแบรนด์ในหน้า About

## 10. Open Questions

- **Tag `brand` จริงของ Inthanin/Punthai/Black Canyon/Chao Doi/CJ More/Jiffy ใน OSM** — ยังไม่ได้ verify สด ต้องเช็คผ่าน overpass-turbo.eu ก่อนใส่ใน Brand Registry จริง (ดูหัวข้อ 4)
- **การจับคู่ปั๊มน้ำมันกับร้าน/คาเฟ่ในเครือ** — ยังไม่ได้ทดสอบว่า OSM data พอให้จับคู่ได้แม่นแค่ไหน ต้อง prototype ทีละคู่ (PTT+7-Eleven/Amazon ก่อน เพราะข้อมูลน่าจะครบสุด) ก่อนตัดสินใจว่าคู่ไหนใช้งานได้จริง
- **Caltex/Star Petroleum ↔ Jiffy** — ไม่แน่ใจด้วยซ้ำว่า OSM ใช้ชื่อแบรนด์ปั๊มว่า "Caltex" หรือ "Star" (หรือทั้งคู่ปนกันในข้อมูล เพราะเพิ่ง rebrand) ต้องเช็คก่อน prototype การจับคู่
- **Rate limit ของ Overpass public server เมื่อยิงหลาย brand query พร้อมกัน** — ยิ่งติ๊กหลายแบรนด์ ยิ่งมี query/หรือ union query ใหญ่ขึ้น ต้องเตรียม mirror server สำรองไว้รึเปล่า
- ความครบถ้วนของ OSM data ในไทยของแต่ละแบรนด์ต่างกันแค่ไหน (7-Eleven น่าจะครบสุด, Chao Doi น่าจะน้อยสุด) — ยังไม่ได้เช็คตัวเลขจริงทีละแบรนด์
- ถ้า Overpass ตอบช้า/ล่มตอน user กำลังใช้งาน จะ handle ยังไง (retry? แจ้งเตือน?)
- UI ตอนติ๊กหลายแบรนด์แล้ว pin เยอะมากจนแผนที่รก — ต้อง cluster pin ไหม (ยังไม่ได้ตัดสินใจ)

---
*ร่างนี้เป็น draft คร่าวๆ ยังไม่ fix — ปรับ scope/priority ได้ตามที่คุยกันต่อ*
