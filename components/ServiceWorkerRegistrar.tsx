"use client";

import { useEffect } from "react";

/**
 * ลงทะเบียน service worker ให้แอปติดตั้งเป็น PWA และเปิดได้ตอนสัญญาณไม่ดี
 * ข้ามตอน dev เพราะ cache-first จะไปทับ hot reload ทำให้แก้โค้ดแล้วไม่เห็นผล
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => { /* PWA เป็นของเสริม ไม่ต้องรบกวนผู้ใช้ถ้าลงทะเบียนไม่ได้ */ });
  }, []);
  return null;
}
