export type Coordinates = { lat: number; lng: number };

export type BrandId =
  | "seven-eleven"
  | "cafe-amazon"
  | "inthanin"
  | "punthai"
  | "black-canyon"
  | "chao-doi";

export type Brand = {
  id: BrandId;
  name: string;
  shortName: string;
  color: string;
  bg: string;
  osmKey: "shop" | "amenity";
  osmValue: string;
  osmBrandPattern: string;
  fuelBrandPair?: "PTT" | "Bangchak" | "PT";
  enabled: boolean;
};

export type Store = Coordinates & {
  id: string;
  name: string;
  brandId: BrandId;
  distanceKm: number;
  address?: string;
  openingHours?: string;
  is24Hours: boolean;
  hasParking: boolean;
  hasAtm: boolean;
  inFuelStation: boolean;
};
