import { afterEach, describe, expect, it, vi } from "vitest";

const geminiMocks = vi.hoisted(() => ({ generateContent: vi.fn() }));

vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return { generateContent: geminiMocks.generateContent };
    }
  },
}));
import {
  calculateBaselineMetrics,
  generatePersonalizedPlan,
  type OnboardingInput,
} from "../src/services/onboardingService.js";

const profile: OnboardingInput = {
  age: 32,
  height: 175,
  weight: 77.6,
  goal: "LOSE_FAT",
  sex: "MALE",
  bodyFatPercent: 24.1,
};

describe("onboarding plan service", () => {
  afterEach(() => {
    vi.clearAllMocks();
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
    geminiMocks.generateContent.mockResolvedValue({ response: { text: () => JSON.stringify({
        bmi: 99,
        bmr: 9999,
        tdee: 9999,
        targetActiveKcal: 450,
        workoutPlan,
      }) } });

    const result = await generatePersonalizedPlan(profile, "test-gemini-key");
    expect(result).toMatchObject({ bmi: 25.3, bmr: 1786, tdee: 2456, targetActiveKcal: 450 });
    expect(result.workoutPlan[0]).toMatchObject({ targetDuration: 90, targetKcal: 600 });
    expect(result.workoutPlan[6]).toMatchObject({ exerciseType: "REST", targetDuration: 0, targetKcal: 0 });
  });
});
