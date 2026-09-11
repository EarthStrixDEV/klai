"use client";

import L from "leaflet";
import { Circle, MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { ReactNode } from "react";
import { getBrand } from "@/lib/brands";
import { formatDistance } from "@/lib/distance";
import { navigationUrl, shareStoreUrl } from "@/lib/stores";
import type { Coordinates, Store } from "@/lib/types";

const icon = (store: Store, selected: boolean) => {
  const brand = getBrand(store.brandId);
  return L.divIcon({ className: "leaflet-div-icon", html: `<div class="map-pin" style="background:${brand.color};${selected ? "box-shadow:0 0 0 5px #fff,0 0 0 9px " + brand.color : ""}"><span>${brand.shortName.slice(0, 2)}</span></div>`, iconSize: [34, 34], iconAnchor: [17, 32] });
};

export default function MapCanvas({ center, stores, radiusKm, selectedId, onSelect, renderPopupActions, alongRoute = false }: {
  center: Coordinates;
  stores: Store[];
  radiusKm: number;
  selectedId?: string;
  onSelect?: (store: Store) => void;
  /** ปุ่มเสริมท้าย popup เช่น ดาวร้านโปรด — ให้หน้า Map เป็นคนกำหนดเพราะ state อยู่ที่นั่น */
  renderPopupActions?: (store: Store) => ReactNode;
  /** true เมื่อกำลังกรองด้วยโหมดแวะระหว่างทาง — pin ที่แสดงอยู่ล้วนเข้าเงื่อนไขแล้ว */
  alongRoute?: boolean;
}) {
  return <MapContainer key={`${center.lat}-${center.lng}`} center={[center.lat, center.lng]} zoom={radiusKm <= 1 ? 15 : 13} scrollWheelZoom>
    <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    <Circle center={[center.lat, center.lng]} radius={80} pathOptions={{ color: "#23735b", fillColor: "#23735b", fillOpacity: .18 }} />
    {stores.map((store) => <Marker key={store.id} position={[store.lat, store.lng]} icon={icon(store, selectedId === store.id)} eventHandlers={{ click: () => onSelect?.(store) }}>
      <Popup>
        <strong>{store.name}</strong>
        {alongRoute && <> · <span style={{ color: "#0a6b3a", fontWeight: 700 }}>อยู่ระหว่างทาง</span></>}
        <br />{formatDistance(store.distanceKm)}
        <br /><a href={navigationUrl(store)} target="_blank" rel="noreferrer">นำทาง</a>
        {" · "}<a href={shareStoreUrl(store)} target="_blank" rel="noreferrer">ส่งไป LINE</a>
        {renderPopupActions && <span style={{ display: "block", marginTop: 6 }}>{renderPopupActions(store)}</span>}
      </Popup>
    </Marker>)}
  </MapContainer>;
}
