import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  calculateBaselineMetrics,
  generatePersonalizedPlan,
  type OnboardingInput,
} from "../src/services/onboardingService.js";

const originalApiKey = process.env.OPENAI_API_KEY;
const profile: OnboardingInput = {
  age: 32,
  height: 175,
  weight: 77.6,
  goal: "LOSE_FAT",
  sex: "MALE",
  bodyFatPercent: 24.1,
};

describe("onboarding plan service", () => {
  beforeEach(() => {
    process.env.OPENAI_API_KEY = "test-key";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    if (originalApiKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = originalApiKey;
  });

  it("calculates Harris-Benedict baseline metrics", () => {
    expect(calculateBaselineMetrics(profile)).toEqual({
      bmi: 25.3,
      bmr: 1786,
      tdee: 2456,
      targetActiveKcal: 400,
    });
  });

  it("keeps server metrics and normalizes unsafe AI workout values", async () => {
    const workoutPlan = Array.from({ length: 7 }, (_, index) => ({
      dayNumber: index + 1,
      exerciseType: index === 6 ? "REST" : "WALK",
      targetDuration: index === 0 ? 120 : 40,
      targetKcal: index === 0 ? 800 : 300,
      aiAdvice: "Duy trì nhịp độ vừa phải và chú ý phục hồi.",
    }));
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      choices: [{ message: { content: JSON.stringify({
        bmi: 99,
        bmr: 9999,
        tdee: 9999,
        targetActiveKcal: 450,
        workoutPlan,
      }) } }],
    }), { status: 200, headers: { "Content-Type": "application/json" } })));

    const result = await generatePersonalizedPlan(profile);
    expect(result).toMatchObject({ bmi: 25.3, bmr: 1786, tdee: 2456, targetActiveKcal: 450 });
    expect(result.workoutPlan[0]).toMatchObject({ targetDuration: 90, targetKcal: 600 });
    expect(result.workoutPlan[6]).toMatchObject({ exerciseType: "REST", targetDuration: 0, targetKcal: 0 });
  });
});
