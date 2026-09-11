// Service worker ของ Klai — ทำให้ติดตั้งเป็นแอปได้และเปิดใช้ได้ตอนสัญญาณไม่ดี
// ดู spec/klai-spec.md หัวข้อ 7
const SHELL_CACHE = "klai-shell-v1";
const DATA_CACHE = "klai-data-v1";
const KEEP = [SHELL_CACHE, DATA_CACHE];

// หน้าหลักที่อยากให้เปิดได้ตอนออฟไลน์
const SHELL_ROUTES = ["/", "/map", "/stores", "/favorites", "/shopping-list", "/gas-station-combo", "/emergency", "/about"];

self.addEventListener("install", (event) => {
  // แคชทีละหน้า ไม่ใช้ addAll เพราะถ้าหน้าใดหน้าหนึ่งพลาด (เช่น host ไม่ rewrite /map ให้)
  // addAll จะ reject ทั้งชุดแล้ว service worker จะไม่ถูกติดตั้งเลย
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => Promise.all(SHELL_ROUTES.map((route) => cache.add(route).catch(() => { /* ข้ามหน้าที่แคชไม่ได้ */ }))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => !KEEP.includes(key)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

// host ของข้อมูลที่ดึงสด — ต้องตรงกับที่ lib/overpass.ts, lib/fuel-prices.ts และ lib/weather.ts เรียกจริง
// เพิ่ม mirror ใหม่ใน lib/overpass.ts เมื่อไหร่ ต้องเพิ่มที่นี่ด้วย ไม่งั้นผลค้นหาจะไม่ถูกแคชไว้ใช้ตอนออฟไลน์
const DATA_HOSTS = [
  "maps.mail.ru",
  "overpass-api.de",
  "overpass.kumi.systems",
  "overpass.private.coffee",
  "api.chnwt.dev",
  "api.open-meteo.com",
];

const isDataHost = (url) => DATA_HOSTS.includes(url.hostname);

// ไฟล์ใน /_next/static มี content hash อยู่ในชื่อ เปลี่ยนเนื้อหาเมื่อไหร่ชื่อก็เปลี่ยน จึงแคชยาวได้ปลอดภัย
const isHashedAsset = (url) => url.pathname.startsWith("/_next/static/");

/** เก็บเฉพาะ response ที่ใช้ได้จริง — กัน error page ค้างในแคช */
function cacheIfOk(cacheName, request, response) {
  if (!response.ok || response.type === "opaque") return;
  const copy = response.clone();
  caches.open(cacheName).then((cache) => cache.put(request, copy)).catch(() => { /* แคชเต็มหรือถูกปิด */ });
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  // ผลค้นหา/ราคา/อากาศ: เอาของสดก่อน ถ้าเน็ตล่มค่อยหยิบชุดล่าสุดที่แคชไว้มาแสดง
  if (isDataHost(url)) {
    event.respondWith(
      fetch(request)
        .then((response) => { cacheIfOk(DATA_CACHE, request, response); return response; })
        .catch(() => caches.match(request).then((cached) => cached ?? Response.error())),
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  // asset ที่มี hash: หยิบจากแคชได้เลย ไม่ต้องถามเน็ต
  if (isHashedAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => cached ?? fetch(request).then((response) => {
        cacheIfOk(SHELL_CACHE, request, response);
        return response;
      })),
    );
    return;
  }

  // HTML และไฟล์อื่นที่ชื่อไม่เปลี่ยนตามเนื้อหา: ต้องเอาของสดก่อน
  // ไม่งั้น deploy ใหม่แล้วผู้ใช้จะติดหน้าเก่าค้างจนกว่าจะล้างแคชเอง
  event.respondWith(
    fetch(request)
      .then((response) => { cacheIfOk(SHELL_CACHE, request, response); return response; })
      .catch(() => caches.match(request).then((cached) => cached ?? caches.match("/").then((home) => home ?? Response.error()))),
  );
});
