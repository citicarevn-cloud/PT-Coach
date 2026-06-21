import { z } from "zod";
import { extractJsonText, GEMINI_VISION_MODEL, GeminiClientError, generateGeminiText } from "./geminiClient";
const SUPPORTED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

const nullablePositiveNumber = z.number().positive().finite().nullable();
const nullablePositiveInteger = z.number().int().positive().nullable();
const nullableNonNegativeInteger = z.number().int().nonnegative().nullable();

const inbodyResponseSchema = z.object({
  weightKg: nullablePositiveNumber,
  bmi: nullablePositiveNumber,
  bodyFatPercent: nullablePositiveNumber,
  fatMassKg: nullablePositiveNumber,
  muscleMassKg: nullablePositiveNumber,
  boneMassKg: nullablePositiveNumber,
  bmrKcal: nullablePositiveInteger,
  bodyAge: nullablePositiveInteger,
});

const workoutResponseSchema = z.object({
  type: z.enum(["WALK", "RUN", "CYCLING", "STRENGTH", "HIIT", "OTHER"]).nullable(),
  distanceKm: nullablePositiveNumber,
  durationSeconds: nullablePositiveInteger,
  avgHeartRateBpm: nullablePositiveInteger,
  activeCaloriesKcal: nullableNonNegativeInteger,
});

export type ParsedInbodyData = z.infer<typeof inbodyResponseSchema>;
export type ParsedWorkoutData = z.infer<typeof workoutResponseSchema>;

export class OcrServiceError extends Error {
  constructor(
    public readonly code: "OCR_NOT_CONFIGURED" | "OCR_PROVIDER_ERROR" | "OCR_INVALID_RESPONSE",
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "OcrServiceError";
  }
}

export async function fileToBase64(file: File): Promise<string> {
  assertImageFile(file);
  return Buffer.from(await file.arrayBuffer()).toString("base64");
}

export async function parseInbodyImage(file: File, geminiApiKey: string | null | undefined): Promise<ParsedInbodyData> {
  const content = await analyzeImage(file, geminiApiKey, [
    "Đây là ảnh chụp màn hình chỉ số cơ thể từ cân thông minh.",
    "Hãy trích xuất các thông số sau và trả về ĐÚNG định dạng JSON, không kèm markdown (không có ```json), không có bất kỳ text nào khác ngoài JSON:",
    "weightKg (số thực), bmi (số thực), bodyFatPercent (số thực), fatMassKg (số thực), muscleMassKg (số thực), boneMassKg (số thực), bmrKcal (số nguyên), bodyAge (số nguyên).",
    "Nếu không thấy chỉ số nào, hãy để null. Không tự suy đoán giá trị không hiển thị trong ảnh.",
  ].join(" "));

  return parseAndValidateJson(content, inbodyResponseSchema);
}

export async function parseWorkoutImage(file: File, geminiApiKey: string | null | undefined): Promise<ParsedWorkoutData> {
  const content = await analyzeImage(file, geminiApiKey, [
    "Đây là ảnh chụp màn hình bản đồ hoặc kết quả tập luyện từ Strava, Garmin, Fitbit hoặc ứng dụng tương tự.",
    "Hãy phân tích và trả về ĐÚNG định dạng JSON, không kèm markdown và không có text ngoài JSON:",
    "type (chọn đúng một loại phù hợp nhất: WALK, RUN, CYCLING, STRENGTH, HIIT, OTHER), distanceKm (số thực), durationSeconds (tổng thời gian hoạt động quy ra giây, ví dụ 1:01:25 là 3685), avgHeartRateBpm (số nguyên), activeCaloriesKcal (số nguyên).",
    "Nếu không thấy một chỉ số, hãy để null. Không tự suy đoán giá trị không hiển thị trong ảnh.",
  ].join(" "));

  return parseAndValidateJson(content, workoutResponseSchema);
}

async function analyzeImage(file: File, geminiApiKey: string | null | undefined, prompt: string): Promise<string> {
  const base64 = await fileToBase64(file);
  try {
    return await generateGeminiText({
      apiKey: geminiApiKey,
      model: GEMINI_VISION_MODEL,
      json: true,
      temperature: 0,
      maxOutputTokens: 500,
      prompt: `Bạn là hệ thống OCR dữ liệu sức khỏe và vận động. Chỉ đọc dữ liệu nhìn thấy rõ trong ảnh. ${prompt}`,
      image: { data: base64, mimeType: file.type },
    });
  } catch (error) {
    if (error instanceof GeminiClientError && error.code === "GEMINI_KEY_REQUIRED") {
      throw new OcrServiceError("OCR_NOT_CONFIGURED", error.message, { cause: error });
    }
    throw new OcrServiceError(
      "OCR_PROVIDER_ERROR",
      "Không thể kết nối tới Gemini Vision.",
      { cause: error },
    );
  }
}

function parseAndValidateJson<T>(content: string, schema: z.ZodType<T>): T {
  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJsonText(content));
  } catch (error) {
    throw new OcrServiceError(
      "OCR_INVALID_RESPONSE",
      "Nội dung OCR không phải JSON hợp lệ.",
      { cause: error },
    );
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    throw new OcrServiceError(
      "OCR_INVALID_RESPONSE",
      `JSON OCR không đúng cấu trúc: ${result.error.issues.map((issue) => issue.path.join(".")).join(", ")}`,
    );
  }
  return result.data;
}

function assertImageFile(file: File): void {
  if (file.size === 0) throw new Error("Ảnh tải lên không được để trống.");
  if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Ảnh phải có định dạng PNG, JPEG, WEBP hoặc GIF không chuyển động.");
  }
}
