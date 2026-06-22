import { afterEach, describe, expect, it, vi } from "vitest";

const geminiMocks = vi.hoisted(() => ({ generateContent: vi.fn(), getGenerativeModel: vi.fn() }));

vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel(config: unknown) {
      geminiMocks.getGenerativeModel(config);
      return { generateContent: geminiMocks.generateContent };
    }
  },
}));
import {
  calculateBaselineMetrics,
  generatePersonalizedPlan,
  type OnboardingInput,
  weeklyTemplateDaySchema,
} from "../src/services/onboardingService.js";

const profile: OnboardingInput = {
  age: 32,
  height: 175,
  weight: 77.6,
  targetWeight: 69,
  goal: "LOSE_FAT",
  sex: "MALE",
  bodyFatPercent: 24.1,
};

describe("onboarding plan service", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("calculates Harris-Benedict baseline metrics", () => {
    expect(calculateBaselineMetrics(profile)).toMatchObject({
      bmi: 25.3,
      bmr: 1786,
      tdee: 2456,
      targetActiveKcal: 400,
      goalAnalysis: {
        currentWeight: 77.6,
        targetWeight: 69,
        totalChangeKg: 8.6,
        recommendedWeeklyChangeKg: 0.58,
        estimatedWeeks: 15,
        estimatedMonths: 3.5,
      },
      nutrition: {
        tdeeKcal: 2456,
        targetCaloriesKcal: 1956,
        proteinGrams: 155,
        carbGrams: 195,
        fatGrams: 62,
      },
    });
  });

  it("cleans fenced JSON, keeps server metrics, and normalizes the weekly template", async () => {
    const weeklyTemplate = Array.from({ length: 7 }, (_, index) => ({
      dayNumber: index + 1,
      dayLabel: `Ngày ${index + 1}`,
      exerciseType: index === 6 ? "REST" : "WALK",
      targetDuration: index === 6 ? 0 : index === 0 ? 60 : 40,
      targetKcal: index === 0 ? 800 : 300,
      intensity: index === 6 ? "Phục hồi" : "RPE 5-6",
      aiAdvice: "Duy trì nhịp độ vừa phải và chú ý phục hồi.",
      exercises: index === 6 ? [] : index === 0 ? [
        {
          name: "30 phút Full Body HIIT",
          durationMinutes: 30,
          sets: null,
          reps: null,
          type: "video_hubert",
          illustrationUrl: "https://www.youtube.com/results?search_query=Hubert+Cu+Full+Body",
        },
        {
          name: "30 phút Cardio đốt mỡ",
          durationMinutes: 30,
          sets: null,
          reps: null,
          type: "video_hubert",
          illustrationUrl: "https://www.youtube.com/results?search_query=Hubert+Cu+Cardio",
        },
      ] : [
        {
          name: "25 phút tập toàn thân",
          durationMinutes: 25,
          sets: null,
          reps: null,
          type: "video_hubert",
          illustrationUrl: "https://www.youtube.com/results?search_query=Hubert+Cu+Toan+Than",
        },
        {
          name: "Giãn cơ và thả lỏng",
          durationMinutes: 15,
          sets: 1,
          reps: "liên tục",
          type: "custom",
          illustrationUrl: "https://www.youtube.com/results?search_query=Gian+co",
        },
      ],
    }));
    const phases = [1, 2, 3].map((phaseNumber) => ({
      phaseNumber,
      name: `Giai đoạn ${phaseNumber}`,
      startWeek: phaseNumber * 2 - 1,
      endWeek: phaseNumber * 2,
      focus: "Xây dựng thói quen và tăng tiến khối lượng tập luyện an toàn.",
      targetWeightEnd: 75 - phaseNumber,
      progression: "Tăng nhẹ thời lượng hoặc mức kháng lực mỗi tuần.",
      successCriteria: "Hoàn thành ít nhất tám mươi phần trăm số buổi tập.",
    }));
    const responseJson = JSON.stringify({
        bmi: 99,
        bmr: 9999,
        tdee: 9999,
        targetActiveKcal: 450,
        goalAnalysis: {
          currentWeight: 77.6, targetWeight: 69, totalChangeKg: 8.6,
          direction: "LOSE", recommendedWeeklyChangeKg: 0.7,
          estimatedWeeks: 13, estimatedMonths: 3, safetyNote: "Giảm cân từ từ để bảo toàn cơ bắp và sức khỏe.",
        },
        nutrition: { tdeeKcal: 9999, targetCaloriesKcal: 1500, proteinGrams: 150, carbGrams: 120, fatGrams: 50 },
        phases,
        weeklyTemplate,
        aiSummary: "Lộ trình giảm mỡ theo ba giai đoạn, ưu tiên tính bền vững và bảo toàn cơ bắp.",
      });
    geminiMocks.generateContent.mockResolvedValue({
      response: { text: () => `Đây là lộ trình được đề xuất:\n\`\`\`json\n${responseJson}\n\`\`\`\nChúc bạn thành công!` },
    });

    const result = await generatePersonalizedPlan(profile, "test-gemini-key");
    expect(result).toMatchObject({
      bmi: 25.3, bmr: 1786, tdee: 2456, targetActiveKcal: 450,
      goalAnalysis: { estimatedWeeks: 15, targetWeight: 69 },
      nutrition: { targetCaloriesKcal: 1956, proteinGrams: 155 },
    });
    expect(result.weeklyTemplate[0]).toMatchObject({ targetDuration: 60, targetKcal: 600 });
    expect(result.weeklyTemplate[0].exercises).toHaveLength(2);
    expect(result.weeklyTemplate[0].exercises.reduce((sum, exercise) => sum + exercise.durationMinutes, 0)).toBe(60);
    expect(result.weeklyTemplate[0].exercises[0]?.illustrationUrl).toContain("youtube.com/results?search_query=Hubert%20Cu");
    expect(result.weeklyTemplate[6]).toMatchObject({ exerciseType: "REST", targetDuration: 0, targetKcal: 0 });
    expect(result.phases.at(-1)).toMatchObject({ endWeek: 15, targetWeightEnd: 69 });
    expect(geminiMocks.getGenerativeModel).toHaveBeenCalledWith(expect.objectContaining({
      generationConfig: expect.objectContaining({
        responseMimeType: "application/json",
        maxOutputTokens: 8_192,
      }),
    }));
    const prompt = geminiMocks.generateContent.mock.calls[0]?.[0];
    expect(prompt).toBeTypeOf("string");
    expect(prompt).toContain("Hubert Cù");
    expect(prompt).toContain("durationMinutes of all exercises sum up to the daily total");
    expect(prompt).toContain("Respond IMMEDIATELY with the JSON object");
    expect(prompt).toMatch(/CRITICAL RULE: DO NOT OUTPUT ANY MARKDOWN.*ENDING WITH \}\.$/);
  });

  it("returns a clear error when Gemini response contains no JSON object", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    geminiMocks.generateContent.mockResolvedValue({ response: { text: () => "Không thể tạo lộ trình lúc này." } });
    await expect(generatePersonalizedPlan(profile, "test-gemini-key")).rejects.toMatchObject({
      code: "AI_INVALID_RESPONSE",
      message: "Dữ liệu trả về không đúng định dạng JSON.",
    });
  });

  it("rejects a 60-minute day when exercise details cover only 20 minutes", () => {
    const result = weeklyTemplateDaySchema.safeParse({
      dayNumber: 1,
      dayLabel: "Thứ 2",
      exerciseType: "HIIT",
      targetDuration: 60,
      targetKcal: 450,
      intensity: "RPE 7",
      aiAdvice: "Giữ form chuẩn và nghỉ ngắn giữa các video.",
      exercises: [{
        name: "20 phút HIIT",
        durationMinutes: 20,
        sets: null,
        reps: null,
        type: "video_hubert",
        illustrationUrl: "https://www.youtube.com/results?search_query=Hubert+Cu+HIIT",
      }],
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.some((issue) => issue.message.includes("must equal targetDuration"))).toBe(true);
  });
});
