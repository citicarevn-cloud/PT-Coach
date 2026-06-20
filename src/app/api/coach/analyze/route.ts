import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzeWorkoutSession } from "../../../../services/aiCoachService";

const workoutSessionSchema = z.object({
  type: z.enum(["WALK", "RUN", "CYCLING", "STRENGTH", "HIIT", "OTHER"]),
  distanceKm: z.number().positive().max(500).optional(),
  durationSeconds: z.number().int().positive().max(86_400),
  avgHeartRateBpm: z.number().int().min(30).max(240).optional(),
  activeCaloriesKcal: z.number().int().nonnegative().max(5_000),
  heartRateZone: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
  ]).optional(),
});

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = workoutSessionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "INVALID_WORKOUT_DATA", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const message = await analyzeWorkoutSession(parsed.data);
    return NextResponse.json({ message });
  } catch {
    return NextResponse.json(
      { error: "INVALID_JSON", message: "Request body phải là JSON hợp lệ." },
      { status: 400 },
    );
  }
}
