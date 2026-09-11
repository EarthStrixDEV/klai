import type { FuelBrand } from "./combo";
import type { BrandId } from "./types";

/**
 * ระบบสะสมแต้มของแต่ละแบรนด์ — เป็น label บอกเฉยๆ ไม่ได้ดึงแต้มจริงของผู้ใช้
 *
 * ใส่เฉพาะแบรนด์ที่สเปกระบุไว้ (spec/klai-spec.md หัวข้อ 5.3) เท่านั้น
 * ส่วนแบรนด์ที่ยังไม่ verify ว่ามีระบบแต้มไหม (CJ More, Chao Doi, Jiffy ฯลฯ)
 * เว้นไว้ก่อนตาม Open Questions ดีกว่าเดาแล้วบอกผู้ใช้ผิด
 */
const programs: Partial<Record<BrandId, string>> = {
  "seven-eleven": "All Member",
  ptt: "Blue Card",
  "cafe-amazon": "Blue Card",
  inthanin: "Greenmiles",
};

export const loyaltyProgramFor = (brandId: BrandId): string | null => programs[brandId] ?? null;

/** การ์ดปั๊มในหน้า Combo อ้างแบรนด์ด้วย FuelBrand ไม่ใช่ BrandId จึง map ข้ามฝั่งตรงนี้ */
const fuelPrograms: Partial<Record<FuelBrand, string>> = { PTT: "Blue Card", Bangchak: "Greenmiles" };

export const loyaltyProgramForFuel = (brand: FuelBrand): string | null => fuelPrograms[brand] ?? null;
