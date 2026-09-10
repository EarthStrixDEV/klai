import type { BrandId, Store } from "./types";

export type Facility = "24hours" | "parking" | "atm" | "fuel";
export type StoreFilters = { search: string; brandIds: BrandId[]; radiusKm: number; facilities: Facility[] };

export function filterStores(stores: Store[], filters: StoreFilters) {
  const search = filters.search.trim().toLocaleLowerCase("th");
  return stores.filter((store) => {
    if (search && !`${store.name} ${store.address ?? ""}`.toLocaleLowerCase("th").includes(search)) return false;
    if (!filters.brandIds.includes(store.brandId) || store.distanceKm > filters.radiusKm) return false;
    if (filters.facilities.includes("24hours") && !store.is24Hours) return false;
    if (filters.facilities.includes("parking") && !store.hasParking) return false;
    if (filters.facilities.includes("atm") && !store.hasAtm) return false;
    if (filters.facilities.includes("fuel") && !store.inFuelStation) return false;
    return true;
  }).sort((a, b) => a.distanceKm - b.distanceKm);
}

export const navigationUrl = (store: Pick<Store, "lat" | "lng">) =>
  `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`;
