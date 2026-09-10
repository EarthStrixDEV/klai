import type { Brand, BrandId } from "./types";

export const brands: Brand[] = [
  { id: "seven-eleven", name: "7-Eleven", shortName: "7-Eleven", color: "#e85d12", bg: "#fff1e9", osmKey: "shop", osmValue: "convenience", osmBrandPattern: "7-Eleven", fuelBrandPair: "PTT", enabled: true },
  { id: "cafe-amazon", name: "Café Amazon", shortName: "Amazon", color: "#116149", bg: "#e6f5ef", osmKey: "amenity", osmValue: "cafe", osmBrandPattern: "Café Amazon|Cafe Amazon", fuelBrandPair: "PTT", enabled: true },
  { id: "inthanin", name: "อินทนิล", shortName: "อินทนิล", color: "#72a942", bg: "#eff8e9", osmKey: "amenity", osmValue: "cafe", osmBrandPattern: "Inthanin|อินทนิล", fuelBrandPair: "Bangchak", enabled: true },
  { id: "punthai", name: "พันธุ์ไทย", shortName: "พันธุ์ไทย", color: "#8a5638", bg: "#f7eee8", osmKey: "amenity", osmValue: "cafe", osmBrandPattern: "Punthai|พันธุ์ไทย", fuelBrandPair: "PT", enabled: true },
  { id: "black-canyon", name: "Black Canyon", shortName: "Black Canyon", color: "#bd312b", bg: "#fdeceb", osmKey: "amenity", osmValue: "cafe|restaurant", osmBrandPattern: "Black Canyon", enabled: true },
  { id: "chao-doi", name: "Chao Doi", shortName: "Chao Doi", color: "#7c4d9b", bg: "#f3ebf8", osmKey: "amenity", osmValue: "cafe", osmBrandPattern: "Chao Doi|ชาวดอย", enabled: false },
];

export const enabledBrands = brands.filter((brand) => brand.enabled);
export const defaultBrandIds: BrandId[] = ["seven-eleven"];

export function getBrand(id: string) {
  return brands.find((brand) => brand.id === id) ?? brands[0];
}
