import { distanceKm } from "./distance";
import type { Coordinates } from "./types";

/** ความกว้างของ "ทางผ่าน" ที่ยอมรับว่าอยู่ระหว่างทาง — วัดจากเส้นตรง ไม่ใช่เส้นทางถนนจริง */
export const ROUTE_CORRIDOR_KM = 1;

export type Destination = Coordinates & { id: string };

/** จุดหมายเดินทางไปกับ URL ในรูป "id,lat,lng" — พก id ไว้หาชื่อร้าน และพิกัดไว้คำนวณเส้นทาง */
export const formatDestination = (destination: Destination) => `${destination.id},${destination.lat},${destination.lng}`;

export function parseDestination(value: string): Destination | null {
  const [id, latText, lngText] = value.split(",");
  const lat = Number(latText); const lng = Number(lngText);
  return id && Number.isFinite(lat) && Number.isFinite(lng) ? { id, lat, lng } : null;
}

/**
 * ระยะจากจุดหนึ่งไปยังเส้นตรงระหว่างต้นทาง-ปลายทาง (ไม่ใช่เส้นทางถนนจริง)
 *
 * ฉายจุดลงบนเส้นในระนาบ equirectangular ที่ปรับ longitude ตาม cos(lat) แล้ว
 * clamp ไว้ในช่วงปลายทั้งสอง เพื่อไม่ให้จุดที่อยู่เลยปลายทางถูกวัดจากเส้นที่ยืดออกไปไม่สิ้นสุด
 * — ข้อจำกัดนี้สเปกยอมรับไว้แล้ว ดู spec/klai-spec.md หัวข้อ Open Questions
 */
export function distanceFromRouteKm(origin: Coordinates, destination: Coordinates, point: Coordinates): number {
  const scale = Math.cos((origin.lat * Math.PI) / 180);
  const toXY = (coordinate: Coordinates) => ({ x: coordinate.lng * scale, y: coordinate.lat });
  const a = toXY(origin); const b = toXY(destination); const p = toXY(point);
  const dx = b.x - a.x; const dy = b.y - a.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) return distanceKm(origin, point);
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSquared));
  const projected = { lat: origin.lat + t * (destination.lat - origin.lat), lng: origin.lng + t * (destination.lng - origin.lng) };
  return distanceKm(projected, point);
}

export const isAlongRoute = (origin: Coordinates, destination: Coordinates, point: Coordinates, corridorKm: number) =>
  distanceFromRouteKm(origin, destination, point) <= corridorKm;
