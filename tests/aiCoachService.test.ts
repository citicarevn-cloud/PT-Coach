import { afterEach, describe, expect, it, vi } from "vitest";

const geminiMocks = vi.hoisted(() => ({
  generateContent: vi.fn(),
  getGenerativeModel: vi.fn(),
}));

vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel(config: unknown) {
      geminiMocks.getGenerativeModel(config);
      return { generateContent: geminiMocks.generateContent };
    }
  },
}));

import { analyzeWorkoutSession, buildWorkoutPrompt } from "../src/services/aiCoachService.js";

const walkSession = {
  type: "WALK" as const,
  distanceKm: 6.21,
  durationSeconds: 3685,
  avgHeartRateBpm: 134,
  activeCaloriesKcal: 404,
  heartRateZone: 2 as const,
};

describe("Gemini AI Coach service", () => {
  afterEach(() => vi.clearAllMocks());

  it("builds a grounded Vietnamese workout prompt", () => {
    const prompt = buildWorkoutPrompt(walkSession);
    expect(prompt).toContain("Đi bộ 6,21 km trong 1 giờ 1 phút");
    expect(prompt).toContain("134 bpm");
    expect(prompt).toContain("Zone 2");
  });

  it("requires a saved Gemini key", async () => {
    await expect(analyzeWorkoutSession(walkSession, null)).rejects.toMatchObject({
      code: "GEMINI_KEY_REQUIRED",
      message: "Chưa cài đặt Gemini API Key",
    });
  });

  it("generates the coach response with Gemini Flash", async () => {
    geminiMocks.generateContent.mockResolvedValue({
      response: { text: () => "Phân tích từ Gemini" },
    });

    await expect(analyzeWorkoutSession(walkSession, "test-gemini-key")).resolves.toBe("Phân tích từ Gemini");
    expect(geminiMocks.getGenerativeModel).toHaveBeenCalledWith(expect.objectContaining({
      model: "gemini-1.5-flash",
    }));
    expect(geminiMocks.generateContent).toHaveBeenCalledWith(expect.stringContaining("Đi bộ 6,21 km"));
  });
});
