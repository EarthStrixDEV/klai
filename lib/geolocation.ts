import type { Coordinates } from "./types";

export function requestCoordinates(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) { reject(new Error("เบราว์เซอร์นี้ไม่รองรับการระบุตำแหน่ง")); return; }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ lat: coords.latitude, lng: coords.longitude }),
      () => reject(new Error("กรุณาอนุญาตการเข้าถึงตำแหน่ง เพื่อค้นหาร้านใกล้คุณ")),
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 },
    );
  });
}
