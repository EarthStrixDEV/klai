export const categories = {
  drinks: "เครื่องดื่ม",
  snacks: "ขนม",
  meals: "อาหารพร้อมทาน",
  essentials: "ของใช้ประจำวัน",
} as const;

export type CategoryId = keyof typeof categories;
export type ShoppingItem = { id: string; name: string; category: CategoryId; quantity: number; completed: boolean };
export type ShoppingAction =
  | { type: "add"; name: string; category: CategoryId }
  | { type: "remove" | "toggle" | "increment" | "decrement"; id: string }
  | { type: "hydrate"; items: ShoppingItem[] }
  | { type: "clear" };

export function shoppingListReducer(state: ShoppingItem[], action: ShoppingAction): ShoppingItem[] {
  if (action.type === "hydrate") return action.items;
  if (action.type === "add") return [...state, { id: crypto.randomUUID(), name: action.name.trim(), category: action.category, quantity: 1, completed: false }];
  if (action.type === "clear") return [];
  if (action.type === "remove") return state.filter((item) => item.id !== action.id);
  return state.map((item) => {
    if (item.id !== action.id) return item;
    if (action.type === "toggle") return { ...item, completed: !item.completed };
    if (action.type === "increment") return { ...item, quantity: item.quantity + 1 };
    return { ...item, quantity: Math.max(1, item.quantity - 1) };
  });
}

export function listText(items: ShoppingItem[]) {
  const lines = items.map((item) => `${item.completed ? "✓" : "□"} ${item.name} ×${item.quantity}`);
  return ["ลิสต์ของจาก Klai", ...lines].join("\n").slice(0, 1800);
}
