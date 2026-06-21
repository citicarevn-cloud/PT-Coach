import { generateGeminiText } from "./geminiClient";

export interface WorkoutSessionInput {
  type: "WALK" | "RUN" | "CYCLING" | "STRENGTH" | "HIIT" | "OTHER";
  distanceKm?: number;
  durationSeconds: number;
  avgHeartRateBpm?: number;
  activeCaloriesKcal: number;
  heartRateZone?: 1 | 2 | 3 | 4 | 5;
}

export async function analyzeWorkoutSession(
  workout: WorkoutSessionInput,
  geminiApiKey: string | null | undefined,
): Promise<string> {
  return generateGeminiText({
    apiKey: geminiApiKey,
    prompt: [
      "Bạn là AI Fitness Coach thân thiện, năng động.",
      "Chỉ phân tích từ dữ liệu được cung cấp, trả lời bằng tiếng Việt trong 3-4 câu ngắn gọn.",
      buildWorkoutPrompt(workout),
    ].join(" "),
    temperature: 0.35,
    maxOutputTokens: 250,
  });
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
