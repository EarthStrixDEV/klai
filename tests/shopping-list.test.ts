import { describe, expect, it } from "vitest";
import { shoppingListReducer } from "../lib/shopping-list";

describe("shoppingListReducer", () => {
  it("adds, increments, and toggles an item through its public state transition seam", () => {
    const added = shoppingListReducer([], { type: "add", name: "น้ำเปล่า", category: "drinks" });
    const incremented = shoppingListReducer(added, { type: "increment", id: added[0].id });
    const toggled = shoppingListReducer(incremented, { type: "toggle", id: added[0].id });
    expect(toggled[0]).toMatchObject({ name: "น้ำเปล่า", quantity: 2, completed: true });
  });

  it("restores persisted quantity and completion state", () => {
    const saved = [{ id: "saved", name: "นม", category: "drinks" as const, quantity: 3, completed: true }];
    expect(shoppingListReducer([], { type: "hydrate", items: saved })).toEqual(saved);
  });
});
