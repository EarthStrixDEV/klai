import { distanceKm } from "./distance";
import type { Coordinates } from "./types";

const toCoordinates = ({ coords }: GeolocationPosition): Coordinates => ({ lat: coords.latitude, lng: coords.longitude });
const permissionError = () => new Error("กรุณาอนุญาตการเข้าถึงตำแหน่ง เพื่อค้นหาร้านใกล้คุณ");

/** พิกัดที่ขยับน้อยกว่านี้ไม่คุ้มจะ re-fetch ผลค้นหาใหม่ */
const REFINE_THRESHOLD_KM = 0.2;

/**
 * ขอตำแหน่งแบบ low-accuracy ก่อน (เร็ว มักได้ผลในไม่กี่ร้อยมิลลิวินาทีจาก WiFi/cell) เพื่อไม่ให้ user
 * รอนานเหมือนตอนขอ high-accuracy ตรงๆ (เคยวัดได้ค้าง 12 วิเต็มตอน GPS cold-start/ไม่ได้อนุญาต)
 * ถ้าใส่ onRefine มา จะขอ high-accuracy คู่ขนานแบบเงียบๆ แล้วเรียก callback ต่อเมื่อพิกัดต่างจากเดิมพอสมควร
 */
export function requestCoordinates(onRefine?: (coordinates: Coordinates) => void): Promise<Coordinates> {
  if (!navigator.geolocation) return Promise.reject(new Error("เบราว์เซอร์นี้ไม่รองรับการระบุตำแหน่ง"));

  return new Promise((resolve, reject) => {
    let settled = false;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates = toCoordinates(position);
        settled = true;
        resolve(coordinates);

        if (onRefine) {
          navigator.geolocation.getCurrentPosition(
            (refined) => {
              const refinedCoordinates = toCoordinates(refined);
              if (distanceKm(coordinates, refinedCoordinates) >= REFINE_THRESHOLD_KM) onRefine(refinedCoordinates);
            },
            () => { /* ตำแหน่งคร่าวๆ ที่ resolve ไปแล้วยังใช้ได้ ไม่ต้องแจ้ง error ซ้ำ */ },
            { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 },
          );
        }
      },
      () => { if (!settled) reject(permissionError()); },
      { enableHighAccuracy: false, timeout: 5_000, maximumAge: 60_000 },
    );
  });
}
