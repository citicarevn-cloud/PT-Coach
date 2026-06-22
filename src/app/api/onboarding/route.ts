export const maxDuration = 60;

import { NextResponse } from "next/server";
import { z } from "zod";
import { addCalendarDays, getLocalDateKey, localDateKeyToUtc } from "@/lib/dates";
import { getDemoUser } from "@/lib/demoUser";
import { prisma } from "@/lib/prisma";
import { OcrServiceError, parseInbodyImage } from "@/services/ocrService";
import {
  generatePersonalizedPlan,
  OnboardingServiceError,
  onboardingInputSchema,
} from "@/services/onboardingService";

export const runtime = "nodejs";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const user = await getDemoUser();
    const fileValue = formData.get("inbodyImage");
    const file = fileValue instanceof File && fileValue.size > 0 ? fileValue : null;

    if (file && (!SUPPORTED_IMAGE_TYPES.has(file.type) || file.size > MAX_FILE_SIZE_BYTES)) {
      return NextResponse.json({ success: false, error: "INVALID_IMAGE" }, { status: 400 });
    }

    const manualBodyFat = optionalNumber(formData.get("bodyFatPercent"));
    const manualMuscleMass = optionalNumber(formData.get("muscleMassKg"));
    const manualBoneMass = optionalNumber(formData.get("boneMassKg"));
    const ocrData = file ? await parseInbodyImage(file, user.geminiApiKey) : null;
    const input = onboardingInputSchema.parse({
      age: requiredNumber(formData.get("age")),
      height: requiredNumber(formData.get("height")),
      weight: ocrData?.weightKg ?? requiredNumber(formData.get("weight")),
      targetWeight: requiredNumber(formData.get("targetWeight")),
      goal: formData.get("goal"),
      sex: user.sex,
      bodyFatPercent: ocrData?.bodyFatPercent ?? manualBodyFat,
      muscleMassKg: ocrData?.muscleMassKg ?? manualMuscleMass,
      boneMassKg: ocrData?.boneMassKg ?? manualBoneMass,
    });
    const plan = await generatePersonalizedPlan(input, user.geminiApiKey);
    const todayKey = getLocalDateKey();

    await prisma.$transaction(async (transaction) => {
      await transaction.workoutPlan.deleteMany({
        where: { userId: user.id },
      });
      await transaction.user.update({
        where: { id: user.id },
        data: {
          age: input.age,
          height: input.height,
          heightCm: input.height,
          weight: input.weight,
          targetWeight: input.targetWeight,
          targetWeightKg: input.targetWeight,
          goal: input.goal,
          bmi: plan.bmi,
          bmr: plan.bmr,
          tdee: plan.tdee,
          targetActiveKcal: plan.targetActiveKcal,
          hasCompletedOnboarding: true,
        },
      });
      await transaction.inbodyHistory.create({
        data: {
          userId: user.id,
          measuredAt: new Date(),
          weightKg: input.weight,
          bmi: plan.bmi,
          bodyFatPercent: input.bodyFatPercent,
          muscleMassKg: input.muscleMassKg,
          boneMassKg: input.boneMassKg,
          bmrKcal: plan.bmr,
          rawOcrData: file ? { source: "ONBOARDING_GEMINI_VISION" } : { source: "ONBOARDING_MANUAL" },
        },
      });
      await transaction.fitnessRoadmap.upsert({
        where: { userId: user.id },
        update: {
          currentWeight: input.weight,
          targetWeight: input.targetWeight,
          totalChangeKg: plan.goalAnalysis.totalChangeKg,
          recommendedWeeklyChangeKg: plan.goalAnalysis.recommendedWeeklyChangeKg,
          estimatedWeeks: plan.goalAnalysis.estimatedWeeks,
          estimatedMonths: plan.goalAnalysis.estimatedMonths,
          phases: plan.phases,
          weeklyTemplate: plan.weeklyTemplate,
          nutritionMacros: plan.nutrition,
          aiSummary: plan.aiSummary,
        },
        create: {
          userId: user.id,
          currentWeight: input.weight,
          targetWeight: input.targetWeight,
          totalChangeKg: plan.goalAnalysis.totalChangeKg,
          recommendedWeeklyChangeKg: plan.goalAnalysis.recommendedWeeklyChangeKg,
          estimatedWeeks: plan.goalAnalysis.estimatedWeeks,
          estimatedMonths: plan.goalAnalysis.estimatedMonths,
          phases: plan.phases,
          weeklyTemplate: plan.weeklyTemplate,
          nutritionMacros: plan.nutrition,
          aiSummary: plan.aiSummary,
        },
      });
      await transaction.workoutPlan.createMany({
        data: plan.weeklyTemplate.map((day) => ({
          userId: user.id,
          date: localDateKeyToUtc(addCalendarDays(todayKey, day.dayNumber - 1)),
          dayNumber: day.dayNumber,
          exerciseType: day.exerciseType,
          targetDuration: day.targetDuration,
          targetKcal: day.targetKcal,
          aiAdvice: day.aiAdvice,
          exercises: day.exercises,
        })),
      });
    });

    return NextResponse.json({ success: true, data: plan });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "INVALID_ONBOARDING_DATA", fields: error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    if (error instanceof OcrServiceError || error instanceof OnboardingServiceError) {
      const status = error.code.endsWith("NOT_CONFIGURED") ? 503 : error.code.includes("PROVIDER") ? 502 : 422;
      return NextResponse.json({ success: false, error: error.code, message: error.message }, { status });
    }
    console.error("Onboarding failed.", error);
    return NextResponse.json({ success: false, error: "ONBOARDING_FAILED" }, { status: 500 });
  }
}

function requiredNumber(value: FormDataEntryValue | null): number {
  if (typeof value !== "string" || value.trim() === "") return Number.NaN;
  return Number(value);
}

function optionalNumber(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
