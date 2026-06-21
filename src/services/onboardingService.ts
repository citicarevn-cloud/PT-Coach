import { z } from "zod";

const OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";

export const onboardingInputSchema = z.object({
  age: z.number().int().min(16).max(100),
  height: z.number().min(120).max(230),
  weight: z.number().min(35).max(300),
  goal: z.enum(["LOSE_FAT", "BUILD_MUSCLE", "MAINTAIN_FITNESS"]),
  sex: z.enum(["MALE", "FEMALE", "UNSPECIFIED"]),
  bodyFatPercent: z.number().min(2).max(70).nullable().optional(),
  muscleMassKg: z.number().positive().max(200).nullable().optional(),
  boneMassKg: z.number().positive().max(15).nullable().optional(),
});

const planDaySchema = z.object({
  dayNumber: z.number().int().min(1).max(7),
  exerciseType: z.enum(["WALK", "RUN", "CYCLING", "STRENGTH", "HIIT", "REST", "OTHER"]),
  targetDuration: z.number().int().min(0).max(120),
  targetKcal: z.number().int().min(0).max(800),
  aiAdvice: z.string().trim().min(8).max(500),
});

const aiPlanResponseSchema = z.object({
  bmi: z.number().positive(),
  bmr: z.number().positive(),
  tdee: z.number().positive(),
  targetActiveKcal: z.number().int().min(200).max(600),
  workoutPlan: z.array(planDaySchema).length(7),
});

export type OnboardingInput = z.infer<typeof onboardingInputSchema>;
export type GeneratedWorkoutDay = z.infer<typeof planDaySchema>;

export interface PersonalizedPlan {
  bmi: number;
  bmr: number;
  tdee: number;
  targetActiveKcal: number;
  workoutPlan: GeneratedWorkoutDay[];
}

interface OpenAIResponse {
  choices?: Array<{ message?: { content?: string | null } }>;
  error?: { message?: string };
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
  const bmr = input.sex === "MALE"
    ? maleBmr
    : input.sex === "FEMALE"
      ? femaleBmr
      : (maleBmr + femaleBmr) / 2;
  const tdee = bmr * 1.375;
  const targetActiveKcal = input.goal === "LOSE_FAT"
    ? 400
    : input.goal === "BUILD_MUSCLE"
      ? 350
      : 300;

  return {
    bmi: round(bmi, 1),
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetActiveKcal,
  };
}

export async function generatePersonalizedPlan(input: OnboardingInput): Promise<PersonalizedPlan> {
  const validatedInput = onboardingInputSchema.parse(input);
  const baseline = calculateBaselineMetrics(validatedInput);
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new OnboardingServiceError("AI_NOT_CONFIGURED", "OPENAI_API_KEY chưa được cấu hình.");
  }

  let response: Response;
  try {
    response = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: [
              "Bạn là chuyên gia lập kế hoạch fitness an toàn.",
              "Chỉ trả về một JSON object hợp lệ, không markdown.",
              "Tạo đúng 7 ngày, xen kẽ vận động nhẹ, kháng lực và nghỉ phục hồi.",
              "Không kê chẩn đoán y khoa và không đặt mục tiêu active calories quá 600 kcal/ngày.",
            ].join(" "),
          },
          {
            role: "user",
            content: JSON.stringify({
              request: "Xác nhận BMI/BMR Harris-Benedict/TDEE và tạo lịch tập 7 ngày cá nhân hóa.",
              profile: validatedInput,
              serverCalculatedBaseline: baseline,
              assumptions: {
                tdeeActivityFactor: 1.375,
                activeCaloriesAreWorkoutOnly: true,
              },
              requiredJsonShape: {
                bmi: "number",
                bmr: "number",
                tdee: "number",
                targetActiveKcal: "integer 200-600",
                workoutPlan: [{
                  dayNumber: "integer 1-7",
                  exerciseType: "WALK|RUN|CYCLING|STRENGTH|HIIT|REST|OTHER",
                  targetDuration: "minutes",
                  targetKcal: "workout kcal; 0 on REST",
                  aiAdvice: "short Vietnamese advice",
                }],
              },
            }),
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 1_500,
      }),
      signal: AbortSignal.timeout(45_000),
    });
  } catch (error) {
    throw new OnboardingServiceError(
      "AI_PROVIDER_ERROR",
      "Không thể kết nối tới OpenAI để tạo kế hoạch.",
      { cause: error },
    );
  }

  let payload: OpenAIResponse;
  try {
    payload = await response.json() as OpenAIResponse;
  } catch (error) {
    throw new OnboardingServiceError("AI_INVALID_RESPONSE", "OpenAI không trả về JSON hợp lệ.", { cause: error });
  }
  if (!response.ok) {
    throw new OnboardingServiceError(
      "AI_PROVIDER_ERROR",
      payload.error?.message || `OpenAI trả về HTTP ${response.status}.`,
    );
  }

  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new OnboardingServiceError("AI_INVALID_RESPONSE", "OpenAI không trả về kế hoạch.");

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch (error) {
    throw new OnboardingServiceError("AI_INVALID_RESPONSE", "Kế hoạch AI không phải JSON hợp lệ.", { cause: error });
  }
  const result = aiPlanResponseSchema.safeParse(parsed);
  if (!result.success) {
    throw new OnboardingServiceError(
      "AI_INVALID_RESPONSE",
      `Kế hoạch AI sai cấu trúc: ${result.error.issues.map((issue) => issue.path.join(".")).join(", ")}`,
    );
  }

  const uniqueDays = new Set(result.data.workoutPlan.map((day) => day.dayNumber));
  if (uniqueDays.size !== 7) {
    throw new OnboardingServiceError("AI_INVALID_RESPONSE", "Kế hoạch AI phải có đủ ngày 1 đến 7.");
  }

  return {
    ...baseline,
    targetActiveKcal: clamp(result.data.targetActiveKcal, 200, 600),
    workoutPlan: result.data.workoutPlan
      .sort((a, b) => a.dayNumber - b.dayNumber)
      .map(normalizeWorkoutDay),
  };
}

function normalizeWorkoutDay(day: GeneratedWorkoutDay): GeneratedWorkoutDay {
  if (day.exerciseType === "REST") {
    return { ...day, targetDuration: 0, targetKcal: 0 };
  }
  return {
    ...day,
    targetDuration: clamp(day.targetDuration, 10, 90),
    targetKcal: clamp(day.targetKcal, 80, 600),
  };
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(Math.round(value), minimum), maximum);
}

function round(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
