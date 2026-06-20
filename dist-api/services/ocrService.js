"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OcrServiceError = void 0;
exports.fileToBase64 = fileToBase64;
exports.parseInbodyImage = parseInbodyImage;
exports.parseWorkoutImage = parseWorkoutImage;
const zod_1 = require("zod");
const OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";
const SUPPORTED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const nullablePositiveNumber = zod_1.z.number().positive().finite().nullable();
const nullablePositiveInteger = zod_1.z.number().int().positive().nullable();
const nullableNonNegativeInteger = zod_1.z.number().int().nonnegative().nullable();
const inbodyResponseSchema = zod_1.z.object({
    weightKg: nullablePositiveNumber,
    bmi: nullablePositiveNumber,
    bodyFatPercent: nullablePositiveNumber,
    fatMassKg: nullablePositiveNumber,
    muscleMassKg: nullablePositiveNumber,
    boneMassKg: nullablePositiveNumber,
    bmrKcal: nullablePositiveInteger,
    bodyAge: nullablePositiveInteger,
});
const workoutResponseSchema = zod_1.z.object({
    type: zod_1.z.enum(["WALK", "RUN", "CYCLING", "STRENGTH", "HIIT", "OTHER"]).nullable(),
    distanceKm: nullablePositiveNumber,
    durationSeconds: nullablePositiveInteger,
    avgHeartRateBpm: nullablePositiveInteger,
    activeCaloriesKcal: nullableNonNegativeInteger,
});
class OcrServiceError extends Error {
    code;
    constructor(code, message, options) {
        super(message, options);
        this.code = code;
        this.name = "OcrServiceError";
    }
}
exports.OcrServiceError = OcrServiceError;
async function fileToBase64(file) {
    assertImageFile(file);
    return Buffer.from(await file.arrayBuffer()).toString("base64");
}
async function parseInbodyImage(file) {
    const content = await analyzeImage(file, [
        "Đây là ảnh chụp màn hình chỉ số cơ thể từ cân thông minh.",
        "Hãy trích xuất các thông số sau và trả về ĐÚNG định dạng JSON, không kèm markdown (không có ```json), không có bất kỳ text nào khác ngoài JSON:",
        "weightKg (số thực), bmi (số thực), bodyFatPercent (số thực), fatMassKg (số thực), muscleMassKg (số thực), boneMassKg (số thực), bmrKcal (số nguyên), bodyAge (số nguyên).",
        "Nếu không thấy chỉ số nào, hãy để null. Không tự suy đoán giá trị không hiển thị trong ảnh.",
    ].join(" "));
    return parseAndValidateJson(content, inbodyResponseSchema);
}
async function parseWorkoutImage(file) {
    const content = await analyzeImage(file, [
        "Đây là ảnh chụp màn hình bản đồ hoặc kết quả tập luyện từ Strava, Garmin, Fitbit hoặc ứng dụng tương tự.",
        "Hãy phân tích và trả về ĐÚNG định dạng JSON, không kèm markdown và không có text ngoài JSON:",
        "type (chọn đúng một loại phù hợp nhất: WALK, RUN, CYCLING, STRENGTH, HIIT, OTHER), distanceKm (số thực), durationSeconds (tổng thời gian hoạt động quy ra giây, ví dụ 1:01:25 là 3685), avgHeartRateBpm (số nguyên), activeCaloriesKcal (số nguyên).",
        "Nếu không thấy một chỉ số, hãy để null. Không tự suy đoán giá trị không hiển thị trong ảnh.",
    ].join(" "));
    return parseAndValidateJson(content, workoutResponseSchema);
}
async function analyzeImage(file, prompt) {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
        throw new OcrServiceError("OCR_NOT_CONFIGURED", "OPENAI_API_KEY chưa được cấu hình cho OCR Vision.");
    }
    const base64 = await fileToBase64(file);
    let response;
    try {
        response = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: process.env.OPENAI_VISION_MODEL?.trim()
                    || process.env.OPENAI_MODEL?.trim()
                    || "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "Bạn là hệ thống OCR dữ liệu sức khỏe và vận động. Chỉ đọc dữ liệu nhìn thấy rõ trong ảnh và luôn trả về một JSON object hợp lệ.",
                    },
                    {
                        role: "user",
                        content: [
                            { type: "text", text: prompt },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:${file.type};base64,${base64}`,
                                    detail: "high",
                                },
                            },
                        ],
                    },
                ],
                response_format: { type: "json_object" },
                max_tokens: 500,
                temperature: 0,
            }),
            signal: AbortSignal.timeout(30_000),
        });
    }
    catch (error) {
        throw new OcrServiceError("OCR_PROVIDER_ERROR", "Không thể kết nối tới OpenAI Vision.", { cause: error });
    }
    const payload = await readOpenAIResponse(response);
    if (!response.ok) {
        throw new OcrServiceError("OCR_PROVIDER_ERROR", payload.error?.message || `OpenAI Vision trả về HTTP ${response.status}.`);
    }
    const content = payload.choices?.[0]?.message?.content?.trim();
    if (!content) {
        throw new OcrServiceError("OCR_INVALID_RESPONSE", "OpenAI Vision không trả về nội dung JSON.");
    }
    return content;
}
async function readOpenAIResponse(response) {
    try {
        return await response.json();
    }
    catch (error) {
        throw new OcrServiceError("OCR_INVALID_RESPONSE", "Phản hồi từ OpenAI Vision không phải JSON hợp lệ.", { cause: error });
    }
}
function parseAndValidateJson(content, schema) {
    let parsed;
    try {
        parsed = JSON.parse(content);
    }
    catch (error) {
        throw new OcrServiceError("OCR_INVALID_RESPONSE", "Nội dung OCR không phải JSON hợp lệ.", { cause: error });
    }
    const result = schema.safeParse(parsed);
    if (!result.success) {
        throw new OcrServiceError("OCR_INVALID_RESPONSE", `JSON OCR không đúng cấu trúc: ${result.error.issues.map((issue) => issue.path.join(".")).join(", ")}`);
    }
    return result.data;
}
function assertImageFile(file) {
    if (file.size === 0)
        throw new Error("Ảnh tải lên không được để trống.");
    if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
        throw new Error("Ảnh phải có định dạng PNG, JPEG, WEBP hoặc GIF không chuyển động.");
    }
}
