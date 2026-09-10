"use client";

import Link from "next/link";
import { Check, Clipboard, ListPlus, MapPin, Minus, Plus, Send, Share2, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useReducer, useState } from "react";
import { PageFrame } from "@/components/PageFrame";
import { categories, listText, shoppingListReducer, type CategoryId, type ShoppingItem } from "@/lib/shopping-list";

const STORAGE_KEY = "klai:shopping-list";

export default function ShoppingListPage() {
  const [items, dispatch] = useReducer(shoppingListReducer, []);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<CategoryId>("drinks");
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) dispatch({ type: "hydrate", items: JSON.parse(saved) as ShoppingItem[] });
    } catch { queueMicrotask(() => setNotice("เบราว์เซอร์ไม่อนุญาตให้บันทึก ลิสต์จะอยู่จนกว่าจะปิดแท็บ")); }
    queueMicrotask(() => setReady(true));
  }, []);
  useEffect(() => { if (ready) try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* warning already shown */ } }, [items, ready]);

  const add = (event: FormEvent) => { event.preventDefault(); if (!name.trim()) return; dispatch({ type: "add", name, category }); setName(""); };
  const text = listText(items);
  const copy = async () => { await navigator.clipboard.writeText(text); setNotice("คัดลอกลิสต์แล้ว"); };
  const webShare = async () => { if (navigator.share) await navigator.share({ title: "ลิสต์ของจาก Klai", text }); else await copy(); };

  return <PageFrame>
    <section className="container-wide max-w-4xl py-8 md:py-12">
      <div className="flex items-end justify-between gap-4"><div><p className="eyebrow">วางแผนก่อนแวะ</p><h1 className="display-font mt-1 text-3xl font-extrabold">ลิสต์ของฉัน</h1></div>{items.length > 0 && <button onClick={() => dispatch({ type: "clear" })} className="text-sm font-bold text-[var(--muted)] hover:text-red-600">ล้างลิสต์</button>}</div>
      <form onSubmit={add} className="surface mt-7 grid gap-3 rounded-3xl p-4 md:grid-cols-[1fr_190px_auto] md:p-5"><input className="field" placeholder="เพิ่มของที่อยากซื้อ…" value={name} onChange={(event) => setName(event.target.value)} /><select className="field" value={category} onChange={(event) => setCategory(event.target.value as CategoryId)}>{Object.entries(categories).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select><button className="btn-primary"><ListPlus size={18} /> เพิ่ม</button></form>
      {notice && <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{notice}</p>}
      <div className="mt-6 space-y-3">{items.map((item) => <article key={item.id} className={`surface flex items-center gap-3 rounded-2xl p-4 ${item.completed ? "opacity-60" : ""}`}>
        <button onClick={() => dispatch({ type: "toggle", id: item.id })} className={`grid size-7 shrink-0 place-items-center rounded-full border-2 ${item.completed ? "border-[var(--green)] bg-[var(--green)] text-white" : "border-[#b8c1bd]"}`} aria-label={`ติ๊ก ${item.name}`}>{item.completed && <Check size={16} />}</button>
        <div className="min-w-0 flex-1"><h3 className={`font-bold ${item.completed ? "line-through" : ""}`}>{item.name}</h3><span className="text-xs text-[var(--muted)]">{categories[item.category]}</span></div>
        <div className="flex items-center gap-1 rounded-xl bg-[#f5f5f0] p-1"><button className="grid size-8 place-items-center" onClick={() => dispatch({ type: "decrement", id: item.id })}><Minus size={15} /></button><strong className="w-6 text-center text-sm">{item.quantity}</strong><button className="grid size-8 place-items-center" onClick={() => dispatch({ type: "increment", id: item.id })}><Plus size={15} /></button></div>
        <button className="icon-button !size-9 text-red-500" onClick={() => dispatch({ type: "remove", id: item.id })} aria-label={`ลบ ${item.name}`}><Trash2 size={16} /></button>
      </article>)}
      {!items.length && <div className="surface rounded-3xl py-14 text-center"><Clipboard className="mx-auto text-[var(--orange)]" size={38} /><h2 className="display-font mt-4 text-xl font-bold">ลิสต์ยังว่างอยู่</h2><p className="mt-2 text-[var(--muted)]">เพิ่มของที่ต้องซื้อ แล้วติ๊กออกทีละรายการได้เลย</p></div>}</div>
      <div className="surface sticky bottom-4 mt-7 flex flex-col gap-3 rounded-2xl p-4 sm:flex-row"><a className={`btn-green flex-1 ${!items.length ? "pointer-events-none opacity-50" : ""}`} href={`https://line.me/R/share?text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer"><Send size={18} /> ส่งไป LINE</a><button className="btn-secondary flex-1" onClick={webShare} disabled={!items.length}><Share2 size={18} /> แชร์ / คัดลอก</button><Link className="btn-primary flex-1" href="/map"><MapPin size={18} /> ดูร้านใกล้ฉัน</Link></div>
    </section>
  </PageFrame>;
}
