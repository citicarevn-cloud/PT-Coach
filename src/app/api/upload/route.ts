import { NextResponse } from "next/server";
import { getDemoUser } from "../../../lib/demoUser";
import { prisma } from "../../../lib/prisma";
import {
  OcrServiceError,
  parseInbodyImage,
  parseWorkoutImage,
} from "../../../services/ocrService";

export const runtime = "nodejs";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const uploadType = formData.get("uploadType");

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: "MISSING_IMAGE" }, { status: 400 });
    }
    if (uploadType !== "inbody" && uploadType !== "workout") {
      return NextResponse.json({ success: false, error: "INVALID_UPLOAD_TYPE" }, { status: 400 });
    }
    if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json({ success: false, error: "UNSUPPORTED_IMAGE_TYPE" }, { status: 400 });
    }
    if (file.size === 0 || file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ success: false, error: "INVALID_FILE_SIZE" }, { status: 400 });
    }

    const user = await getDemoUser();

    const fileMetadata = {
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      provider: "gemini-vision",
      model: "gemini-2.5-flash",
    };

    if (uploadType === "inbody") {
      const result = await parseInbodyImage(file, user.geminiApiKey);
      if (result.weightKg === null || result.bmrKcal === null) {
        return NextResponse.json(
          { success: false, error: "INBODY_REQUIRED_FIELDS_MISSING", data: result },
          { status: 422 },
        );
      }
      await prisma.inbodyHistory.create({
        data: {
          userId: user.id,
          measuredAt: new Date(),
          weightKg: result.weightKg,
          bmi: result.bmi,
          bodyFatPercent: result.bodyFatPercent,
          fatMassKg: result.fatMassKg,
          muscleMassKg: result.muscleMassKg,
          boneMassKg: result.boneMassKg,
          bmrKcal: result.bmrKcal,
          bodyAge: result.bodyAge,
          rawOcrData: fileMetadata,
        },
      });
      return NextResponse.json({ success: true, data: result });
    }

    const result = await parseWorkoutImage(file, user.geminiApiKey);
    if (result.type === null || result.durationSeconds === null || result.activeCaloriesKcal === null) {
      return NextResponse.json(
        { success: false, error: "WORKOUT_REQUIRED_FIELDS_MISSING", data: result },
        { status: 422 },
      );
    }
    await prisma.workoutLog.create({
      data: {
        userId: user.id,
        performedAt: new Date(),
        activityType: result.type,
        distanceKm: result.distanceKm,
        durationSeconds: result.durationSeconds,
        avgPaceSecondsPerKm: result.distanceKm
          ? Math.round(result.durationSeconds / result.distanceKm)
          : null,
        avgHeartRateBpm: result.avgHeartRateBpm,
        activeCaloriesKcal: result.activeCaloriesKcal,
        sourceProvider: "GEMINI_VISION",
        isAiOcrInput: true,
        rawOcrData: fileMetadata,
      },
    });
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof OcrServiceError) {
      const status = error.code === "OCR_NOT_CONFIGURED"
        ? 503
        : error.code === "OCR_PROVIDER_ERROR"
          ? 502
          : 422;
      return NextResponse.json(
        { success: false, error: error.code, message: error.message },
        { status },
      );
    }
    console.error("Upload processing failed.", error);
    return NextResponse.json(
      { success: false, error: "UPLOAD_PROCESSING_FAILED" },
      { status: 500 },
    );
  }
}
