import { NextResponse } from "next/server";
import { z } from "zod";
import { getDemoUser } from "@/lib/demoUser";
import { prisma } from "@/lib/prisma";

const manualWorkoutSchema = z.object({
  activityType: z.enum(["WALK", "RUN", "CYCLING", "STRENGTH", "HIIT", "OTHER"]),
  durationMinutes: z.number().int().min(1).max(600),
  activeCaloriesKcal: z.number().int().min(0).max(5_000),
  avgHeartRateBpm: z.number().int().min(30).max(240).nullable().optional(),
});

export async function POST(request: Request) {
  try {
    const input = manualWorkoutSchema.parse(await request.json());
    const user = await getDemoUser();
    const workout = await prisma.workoutLog.create({
      data: {
        userId: user.id,
        performedAt: new Date(),
        activityType: input.activityType,
        durationSeconds: input.durationMinutes * 60,
        avgHeartRateBpm: input.avgHeartRateBpm,
        activeCaloriesKcal: input.activeCaloriesKcal,
        sourceProvider: "MANUAL",
        isAiOcrInput: false,
      },
    });
    return NextResponse.json({ success: true, data: workout }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "INVALID_WORKOUT", fields: error.flatten().fieldErrors }, { status: 400 });
    }
    console.error("Manual workout creation failed.", error);
    return NextResponse.json({ success: false, error: "WORKOUT_CREATE_FAILED" }, { status: 500 });
  }
}
