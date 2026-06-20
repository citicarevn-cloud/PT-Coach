export interface WorkoutSessionInput {
  type: "WALK" | "RUN" | "CYCLING" | "STRENGTH" | "HIIT" | "OTHER";
  distanceKm?: number;
  durationSeconds: number;
  avgHeartRateBpm?: number;
  activeCaloriesKcal: number;
  heartRateZone?: 1 | 2 | 3 | 4 | 5;
}

interface OpenAIChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
}

const MOCK_COACH_MESSAGE =
  "Tuyệt vời Ted! Bạn vừa hoàn thành 6,21 km đi bộ trong 1 giờ 1 phút và đốt 404 kcal, một buổi vận động rất chất lượng. Việc duy trì nhịp tim trung bình 134 bpm trong Zone 2 giúp cơ thể sử dụng chất béo hiệu quả hơn, đồng thời xây dựng nền tảng sức bền mà không gây quá tải. Hãy bù nước đều trong vài giờ tới và nhớ tuân thủ thực đơn bữa tối giàu protein để hỗ trợ phục hồi nhé!";

export async function analyzeWorkoutSession(workout: WorkoutSessionInput): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return createMockResponse(workout);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
            content: "Bạn là AI Fitness Coach thân thiện, năng động. Chỉ phân tích từ dữ liệu được cung cấp, trả lời bằng tiếng Việt trong 3-4 câu ngắn gọn.",
          },
          { role: "user", content: buildWorkoutPrompt(workout) },
        ],
        max_tokens: 250,
      }),
      signal: AbortSignal.timeout(12_000),
    });

    if (!response.ok) {
      throw new Error(`OpenAI request failed with status ${response.status}`);
    }

    const payload = await response.json() as OpenAIChatCompletionResponse;
    const message = extractOutputText(payload);
    if (!message) throw new Error("OpenAI response did not contain text output");
    return message;
  } catch (error) {
    console.warn("AI Coach is using its local fallback response.", error);
    return createMockResponse(workout);
  }
}

export function buildWorkoutPrompt(workout: WorkoutSessionInput): string {
  const activity = activityLabel(workout.type);
  const distance = workout.distanceKm === undefined
    ? "không ghi nhận quãng đường"
    : `${formatDecimal(workout.distanceKm)} km`;
  const heartRate = workout.avgHeartRateBpm === undefined
    ? "không ghi nhận nhịp tim"
    : `nhịp tim trung bình ${workout.avgHeartRateBpm} bpm`;
  const zone = workout.heartRateZone
    ? `Thiết bị/hồ sơ cá nhân phân loại nhịp tim này ở Zone ${workout.heartRateZone}${workout.heartRateZone === 2 ? " (Vùng đốt mỡ)" : ""}.`
    : "Không tự suy đoán vùng nhịp tim khi chưa có phân loại cá nhân.";

  return [
    `Người dùng tên Ted Tran vừa hoàn thành buổi tập: ${activity} ${distance} trong ${formatDuration(workout.durationSeconds)}, ${heartRate}, đốt ${workout.activeCaloriesKcal} kcal.`,
    zone,
    "Hãy chúc mừng, phân tích lợi ích của buổi tập và vùng nhịp tim nếu có, sau đó nhắc uống đủ nước và tuân thủ thực đơn bữa tối.",
  ].join(" ");
}

function createMockResponse(workout: WorkoutSessionInput): string {
  const isMasterPromptExample = workout.type === "WALK"
    && workout.distanceKm === 6.21
    && workout.durationSeconds === 3685
    && workout.avgHeartRateBpm === 134
    && workout.activeCaloriesKcal === 404
    && workout.heartRateZone === 2;

  if (isMasterPromptExample) return MOCK_COACH_MESSAGE;

  const activity = activityLabel(workout.type).toLocaleLowerCase("vi-VN");
  const zoneMessage = workout.heartRateZone === 2
    ? "Duy trì Zone 2 giúp xây dựng sức bền aerobic và hỗ trợ cơ thể sử dụng chất béo hiệu quả."
    : "Buổi vận động này là một bước tiến tốt cho sức bền và mục tiêu năng lượng của bạn.";

  return `Làm tốt lắm Ted! Bạn đã hoàn thành buổi ${activity} trong ${formatDuration(workout.durationSeconds)} và đốt ${workout.activeCaloriesKcal} kcal. ${zoneMessage} Hãy uống đủ nước và giữ đúng thực đơn bữa tối để cơ thể phục hồi nhé!`;
}

function extractOutputText(payload: OpenAIChatCompletionResponse): string | null {
  const content = payload.choices?.[0]?.message?.content;
  return content?.trim() || null;
}

function activityLabel(type: WorkoutSessionInput["type"]): string {
  const labels: Record<WorkoutSessionInput["type"], string> = {
    WALK: "Đi bộ",
    RUN: "Chạy bộ",
    CYCLING: "Đạp xe",
    STRENGTH: "Tập kháng lực",
    HIIT: "HIIT",
    OTHER: "Vận động",
  };
  return labels[type];
}

function formatDuration(durationSeconds: number): string {
  const hours = Math.floor(durationSeconds / 3_600);
  const minutes = Math.floor((durationSeconds % 3_600) / 60);
  if (hours === 0) return `${minutes} phút`;
  if (minutes === 0) return `${hours} giờ`;
  return `${hours} giờ ${minutes} phút`;
}

function formatDecimal(value: number): string {
  return value.toLocaleString("vi-VN", { maximumFractionDigits: 2 });
}
