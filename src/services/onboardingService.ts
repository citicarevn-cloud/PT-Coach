import { z } from "zod";
import { GeminiClientError, generateGeminiText } from "./geminiClient";

export const onboardingInputSchema = z.object({
  age: z.number().int().min(16).max(100),
  height: z.number().min(120).max(230),
  weight: z.number().min(35).max(300),
  targetWeight: z.number().min(35).max(300),
  goal: z.enum(["LOSE_FAT", "BUILD_MUSCLE", "MAINTAIN_FITNESS"]),
  sex: z.enum(["MALE", "FEMALE", "UNSPECIFIED"]),
  bodyFatPercent: z.number().min(2).max(70).nullable().optional(),
  muscleMassKg: z.number().positive().max(200).nullable().optional(),
  boneMassKg: z.number().positive().max(15).nullable().optional(),
});

const phaseSchema = z.object({
  phaseNumber: z.number().int().min(1).max(6),
  name: z.string().trim().min(3).max(100),
  startWeek: z.number().int().min(1),
  endWeek: z.number().int().min(1),
  focus: z.string().trim().min(10).max(500),
  targetWeightEnd: z.number().min(35).max(300),
  progression: z.string().trim().min(10).max(500),
  successCriteria: z.string().trim().min(10).max(500),
}).refine((phase) => phase.endWeek >= phase.startWeek, {
  message: "endWeek must be greater than or equal to startWeek",
});

const weeklyTemplateDaySchema = z.object({
  dayNumber: z.number().int().min(1).max(7),
  dayLabel: z.string().trim().min(2).max(30),
  exerciseType: z.enum(["WALK", "RUN", "CYCLING", "STRENGTH", "HIIT", "REST", "OTHER"]),
  targetDuration: z.number().int().min(0).max(120),
  targetKcal: z.number().int().min(0).max(800),
  intensity: z.string().trim().min(2).max(100),
  aiAdvice: z.string().trim().min(8).max(500),
});

const nutritionSchema = z.object({
  tdeeKcal: z.number().int().positive(),
  targetCaloriesKcal: z.number().int().positive(),
  proteinGrams: z.number().int().positive(),
  carbGrams: z.number().int().positive(),
  fatGrams: z.number().int().positive(),
});

const aiRoadmapResponseSchema = z.object({
  bmi: z.number().positive(),
  bmr: z.number().positive(),
  tdee: z.number().positive(),
  targetActiveKcal: z.number().int().min(150).max(600),
  goalAnalysis: z.object({
    currentWeight: z.number().positive(),
    targetWeight: z.number().positive(),
    totalChangeKg: z.number().nonnegative(),
    direction: z.enum(["LOSE", "GAIN", "MAINTAIN"]),
    recommendedWeeklyChangeKg: z.number().nonnegative().max(1),
    estimatedWeeks: z.number().int().positive(),
    estimatedMonths: z.number().positive(),
    safetyNote: z.string().trim().min(10).max(500),
  }),
  nutrition: nutritionSchema,
  phases: z.array(phaseSchema).min(2).max(6),
  weeklyTemplate: z.array(weeklyTemplateDaySchema).length(7),
  aiSummary: z.string().trim().min(20).max(1_000),
});

export type OnboardingInput = z.infer<typeof onboardingInputSchema>;
export type RoadmapPhase = z.infer<typeof phaseSchema>;
export type WeeklyTemplateDay = z.infer<typeof weeklyTemplateDaySchema>;
export type NutritionTargets = z.infer<typeof nutritionSchema>;

export interface PersonalizedRoadmap {
  bmi: number;
  bmr: number;
  tdee: number;
  targetActiveKcal: number;
  goalAnalysis: {
    currentWeight: number;
    targetWeight: number;
    totalChangeKg: number;
    direction: "LOSE" | "GAIN" | "MAINTAIN";
    recommendedWeeklyChangeKg: number;
    estimatedWeeks: number;
    estimatedMonths: number;
    safetyNote: string;
  };
  nutrition: NutritionTargets;
  phases: RoadmapPhase[];
  weeklyTemplate: WeeklyTemplateDay[];
  aiSummary: string;
}

export class OnboardingServiceError extends Error {
  constructor(
    public readonly code: "AI_NOT_CONFIGURED" | "AI_PROVIDER_ERROR" | "AI_INVALID_RESPONSE",
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "OnboardingServiceError";
  }
}

export function calculateBaselineMetrics(input: OnboardingInput) {
  const bmi = input.weight / ((input.height / 100) ** 2);
  const maleBmr = 88.362 + (13.397 * input.weight) + (4.799 * input.height) - (5.677 * input.age);
  const femaleBmr = 447.593 + (9.247 * input.weight) + (3.098 * input.height) - (4.33 * input.age);
  const bmr = input.sex === "MALE" ? maleBmr : input.sex === "FEMALE" ? femaleBmr : (maleBmr + femaleBmr) / 2;
  const tdee = Math.round(bmr * 1.375);
  const direction = getDirection(input.weight, input.targetWeight);
  const totalChangeKg = round(Math.abs(input.targetWeight - input.weight), 1);
  const recommendedWeeklyChangeKg = direction === "LOSE"
    ? round(clampNumber(input.weight * 0.0075, 0.5, 1), 2)
    : direction === "GAIN"
      ? 0.25
      : 0;
  const estimatedWeeks = direction === "MAINTAIN"
    ? 4
    : Math.max(4, Math.ceil(totalChangeKg / recommendedWeeklyChangeKg));
  const targetActiveKcal = input.goal === "LOSE_FAT" ? 400 : input.goal === "BUILD_MUSCLE" ? 350 : 300;
  const targetCaloriesKcal = direction === "LOSE"
    ? Math.max(input.sex === "FEMALE" ? 1_200 : 1_500, tdee - 500)
    : direction === "GAIN"
      ? tdee + 250
      : tdee;
  const proteinGrams = Math.round(input.weight * (direction === "LOSE" ? 2 : input.goal === "BUILD_MUSCLE" ? 1.8 : 1.6));
  const fatGrams = Math.max(40, Math.round(input.weight * 0.8));
  const carbGrams = Math.max(50, Math.round((targetCaloriesKcal - proteinGrams * 4 - fatGrams * 9) / 4));

  return {
    bmi: round(bmi, 1),
    bmr: Math.round(bmr),
    tdee,
    targetActiveKcal,
    goalAnalysis: {
      currentWeight: input.weight,
      targetWeight: input.targetWeight,
      totalChangeKg,
      direction,
      recommendedWeeklyChangeKg,
      estimatedWeeks,
      estimatedMonths: round(estimatedWeeks / 4.345, 1),
      safetyNote: direction === "LOSE"
        ? "Lộ trình dùng tốc độ giảm khoảng 0,5-1 kg mỗi tuần để hạn chế mất cơ và tránh thâm hụt quá mức."
        : direction === "GAIN"
          ? "Tăng cân chậm khoảng 0,25 kg mỗi tuần giúp ưu tiên phát triển cơ thay vì tích mỡ nhanh."
          : "Duy trì cân nặng và đánh giá lại thành phần cơ thể sau mỗi bốn tuần.",
    },
    nutrition: { tdeeKcal: tdee, targetCaloriesKcal, proteinGrams, carbGrams, fatGrams },
  };
}

export async function generatePersonalizedPlan(
  input: OnboardingInput,
  geminiApiKey: string | null | undefined,
): Promise<PersonalizedRoadmap> {
  const validatedInput = onboardingInputSchema.parse(input);
  const baseline = calculateBaselineMetrics(validatedInput);
  let content: string;

  try {
    content = await generateGeminiText({
      apiKey: geminiApiKey,
      json: true,
      temperature: 0.25,
      maxOutputTokens: 8_192,
      prompt: buildRoadmapPrompt(validatedInput, baseline),
    });
  } catch (error) {
    if (error instanceof GeminiClientError && error.code === "GEMINI_KEY_REQUIRED") {
      throw new OnboardingServiceError("AI_NOT_CONFIGURED", error.message, { cause: error });
    }
    throw new OnboardingServiceError("AI_PROVIDER_ERROR", "Không thể kết nối tới Gemini để tạo lộ trình.", { cause: error });
  }

  let parsed: unknown;
  try {
    const rawText = content;
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Không tìm thấy cấu trúc JSON trong phản hồi của Gemini.");
    }
    const cleanedText = jsonMatch[0];
    parsed = JSON.parse(cleanedText);
  } catch (error) {
    const message = error instanceof Error && error.message.includes("Không tìm thấy cấu trúc JSON")
      ? error.message
      : "Gemini trả về JSON không hợp lệ.";
    throw new OnboardingServiceError("AI_INVALID_RESPONSE", message, { cause: error });
  }

  const result = aiRoadmapResponseSchema.safeParse(parsed);
  if (!result.success) {
    throw new OnboardingServiceError(
      "AI_INVALID_RESPONSE",
      `JSON roadmap sai cấu trúc: ${result.error.issues.map((issue) => issue.path.join(".")).join(", ")}`,
    );
  }
  if (new Set(result.data.weeklyTemplate.map((day) => day.dayNumber)).size !== 7) {
    throw new OnboardingServiceError("AI_INVALID_RESPONSE", "Weekly template phải có đủ ngày 1 đến 7.");
  }

  return {
    ...baseline,
    targetActiveKcal: clamp(result.data.targetActiveKcal, 150, 600),
    phases: normalizePhases(result.data.phases, baseline.goalAnalysis),
    weeklyTemplate: result.data.weeklyTemplate
      .sort((a, b) => a.dayNumber - b.dayNumber)
      .map(normalizeWeeklyDay),
    aiSummary: result.data.aiSummary,
  };
}

function buildRoadmapPrompt(input: OnboardingInput, baseline: ReturnType<typeof calculateBaselineMetrics>): string {
  return [
    "Bạn là chuyên gia thiết kế lộ trình fitness dài hạn an toàn.",
    "Chỉ trả về một JSON object hợp lệ, tuyệt đối không markdown hoặc giải thích ngoài JSON.",
    "Phân tích cân nặng hiện tại so với cân nặng mục tiêu và thời gian an toàn để đạt mục tiêu.",
    "Không tạo một kế hoạch 7 ngày như toàn bộ lộ trình. Hãy tạo roadmap nhiều giai đoạn và một weeklyTemplate 7 ngày để lặp lại, tăng tiến trong từng giai đoạn.",
    "Các phase cần bao gồm thích nghi, tiến triển chính và củng cố/duy trì; mốc tuần phải liên tục.",
    "Macro là mục tiêu mỗi ngày và tổng calories phải hợp lý với TDEE cùng hướng tăng/giảm cân.",
    JSON.stringify({
      profile: input,
      serverCalculatedSafetyBaseline: baseline,
      requiredJsonShape: {
        bmi: "number",
        bmr: "number",
        tdee: "number",
        targetActiveKcal: "integer 150-600",
        goalAnalysis: {
          currentWeight: "number",
          targetWeight: "number",
          totalChangeKg: "positive number",
          direction: "LOSE|GAIN|MAINTAIN",
          recommendedWeeklyChangeKg: "0-1",
          estimatedWeeks: "positive integer",
          estimatedMonths: "positive number",
          safetyNote: "Vietnamese string",
        },
        nutrition: {
          tdeeKcal: "integer",
          targetCaloriesKcal: "integer",
          proteinGrams: "integer",
          carbGrams: "integer",
          fatGrams: "integer",
        },
        phases: [{
          phaseNumber: "integer",
          name: "Vietnamese phase name",
          startWeek: "integer",
          endWeek: "integer",
          focus: "Vietnamese string",
          targetWeightEnd: "number",
          progression: "Vietnamese string",
          successCriteria: "Vietnamese string",
        }],
        weeklyTemplate: [{
          dayNumber: "integer 1-7",
          dayLabel: "Thứ 2 ... Chủ nhật",
          exerciseType: "WALK|RUN|CYCLING|STRENGTH|HIIT|REST|OTHER",
          targetDuration: "minutes",
          targetKcal: "workout kcal; 0 on REST",
          intensity: "Vietnamese intensity/RPE",
          aiAdvice: "Vietnamese string",
        }],
        aiSummary: "Vietnamese roadmap summary",
      },
    }),
    "CRITICAL RULE: DO NOT OUTPUT ANY MARKDOWN, NO CONVERSATIONAL TEXT, NO BACKTICKS. OUTPUT ONLY A RAW, VALID JSON OBJECT STARTING WITH { AND ENDING WITH }.",
  ].join(" ");
}

function normalizePhases(
  phases: RoadmapPhase[],
  goal: ReturnType<typeof calculateBaselineMetrics>["goalAnalysis"],
): RoadmapPhase[] {
  const sorted = [...phases].sort((a, b) => a.phaseNumber - b.phaseNumber);
  let previousEnd = 0;
  return sorted.map((phase, index) => {
    const remainingPhases = sorted.length - index;
    const remainingWeeks = goal.estimatedWeeks - previousEnd;
    const duration = index === sorted.length - 1 ? remainingWeeks : Math.max(1, Math.floor(remainingWeeks / remainingPhases));
    const startWeek = previousEnd + 1;
    const endWeek = Math.min(goal.estimatedWeeks, startWeek + duration - 1);
    previousEnd = endWeek;
    const progress = endWeek / goal.estimatedWeeks;
    const targetWeightEnd = round(goal.currentWeight + (goal.targetWeight - goal.currentWeight) * progress, 1);
    return { ...phase, phaseNumber: index + 1, startWeek, endWeek, targetWeightEnd };
  });
}

function normalizeWeeklyDay(day: WeeklyTemplateDay): WeeklyTemplateDay {
  if (day.exerciseType === "REST") return { ...day, targetDuration: 0, targetKcal: 0 };
  return {
    ...day,
    targetDuration: clamp(day.targetDuration, 10, 90),
    targetKcal: clamp(day.targetKcal, 80, 600),
  };
}

function getDirection(currentWeight: number, targetWeight: number): "LOSE" | "GAIN" | "MAINTAIN" {
  if (targetWeight < currentWeight - 0.2) return "LOSE";
  if (targetWeight > currentWeight + 0.2) return "GAIN";
  return "MAINTAIN";
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(Math.round(value), minimum), maximum);
}

function clampNumber(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}

function round(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
