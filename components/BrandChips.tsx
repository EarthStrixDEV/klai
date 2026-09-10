import { enabledBrands } from "@/lib/brands";
import type { BrandId } from "@/lib/types";

export function BrandChips({ selected, onChange }: { selected: BrandId[]; onChange: (ids: BrandId[]) => void }) {
  const toggle = (id: BrandId) => {
    if (selected.includes(id)) {
      if (selected.length > 1) onChange(selected.filter((brandId) => brandId !== id));
    } else onChange([...selected, id]);
  };
  return <div className="flex flex-wrap gap-2" aria-label="เลือกแบรนด์">
    {enabledBrands.map((brand) => <button key={brand.id} className="brand-chip" aria-pressed={selected.includes(brand.id)} style={selected.includes(brand.id) ? { background: brand.color } : { color: brand.color }} onClick={() => toggle(brand.id)}>
      <span className="brand-dot" />{brand.shortName}
    </button>)}
  </div>;
}
