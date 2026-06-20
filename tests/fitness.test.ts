import { describe, expect, it } from "vitest";
import {
  assessWeightGoal,
  calculateCalorieTarget,
  calculateMacros,
  calculateTdee,
} from "../src/domain/fitness.js";

describe("fitness calculations", () => {
  it("calculates TDEE from BMR and measured active calories", () => {
    expect(calculateTdee(1_650, 404)).toBe(2_384);
  });

  it("flags an unsafe 8.6 kg in one month target", () => {
    const result = assessWeightGoal({
      currentWeightKg: 77.6,
      targetWeightKg: 69,
      requestedWeeks: 4,
    });
    expect(result.adjusted).toBe(true);
    expect(result.safeMinimumWeeks).toBe(13);
    expect(result.recommendedWeeks).toBe(18);
  });

  it("caps the deficit and respects the calorie floor", () => {
    expect(calculateCalorieTarget(1_600, 900, "MALE")).toMatchObject({
      targetCaloriesKcal: 1_500,
      appliedDeficitKcal: 100,
      floorApplied: true,
    });
  });

  it("allocates high protein macros close to the calorie target", () => {
    const result = calculateMacros({ weightKg: 77.6, targetCaloriesKcal: 1_850 });
    expect(result.proteinGramsPerKg).toBeGreaterThanOrEqual(1.8);
    expect(Math.abs(result.calculatedCaloriesKcal - 1_850)).toBeLessThanOrEqual(2);
  });

  it("preserves the carb and fat minimums for a constrained calorie target", () => {
    const result = calculateMacros({ weightKg: 120, targetCaloriesKcal: 1_200 });
    expect(result.carbGrams).toBe(50);
    expect(result.fatGrams).toBeGreaterThanOrEqual(40);
    expect(result.constraintWarning).not.toBeNull();
  });
});
