import { describe, expect, it } from "vitest";
import { foodDatabase, generateVietnameseMenu } from "../src/domain/menu.js";

describe("Vietnamese menu generator", () => {
  it("provides at least three options for every meal type", () => {
    for (const options of Object.values(foodDatabase)) {
      expect(options.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("selects options and scales each meal near its calorie target", () => {
    const menu = generateVietnameseMenu(1_800, true, () => 0.99);
    expect(menu).toHaveLength(4);
    expect(menu[0].optionId).toBe("chicken-pho");
    for (const meal of menu) {
      expect(Math.abs(meal.totals.kcal - meal.targetKcal)).toBeLessThanOrEqual(meal.items.length);
    }
    expect(menu[2].items.some((item) => item.name.includes("Canxi/Vitamin D"))).toBe(true);
  });
});
