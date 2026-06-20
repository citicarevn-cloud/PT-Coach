module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/lib/prisma.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prisma",
    ()=>prisma
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/@prisma/client)");
;
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]();
if ("TURBOPACK compile-time truthy", 1) globalForPrisma.prisma = prisma;
}),
"[project]/src/lib/demoUser.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEMO_USER_EMAIL",
    ()=>DEMO_USER_EMAIL,
    "getDemoUser",
    ()=>getDemoUser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-route] (ecmascript)");
;
const DEMO_USER_EMAIL = "ted.tran@example.com";
async function getDemoUser() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.upsert({
        where: {
            email: DEMO_USER_EMAIL
        },
        update: {
            name: "Ted Tran"
        },
        create: {
            email: DEMO_USER_EMAIL,
            name: "Ted Tran",
            sex: "MALE"
        }
    });
}
}),
"[project]/src/services/ocrService.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OcrServiceError",
    ()=>OcrServiceError,
    "fileToBase64",
    ()=>fileToBase64,
    "parseInbodyImage",
    ()=>parseInbodyImage,
    "parseWorkoutImage",
    ()=>parseWorkoutImage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v3/external.js [app-route] (ecmascript) <export * as z>");
;
const OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";
const SUPPORTED_IMAGE_TYPES = new Set([
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/gif"
]);
const nullablePositiveNumber = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().positive().finite().nullable();
const nullablePositiveInteger = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive().nullable();
const nullableNonNegativeInteger = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().nonnegative().nullable();
const inbodyResponseSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    weightKg: nullablePositiveNumber,
    bmi: nullablePositiveNumber,
    bodyFatPercent: nullablePositiveNumber,
    fatMassKg: nullablePositiveNumber,
    muscleMassKg: nullablePositiveNumber,
    boneMassKg: nullablePositiveNumber,
    bmrKcal: nullablePositiveInteger,
    bodyAge: nullablePositiveInteger
});
const workoutResponseSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        "WALK",
        "RUN",
        "CYCLING",
        "STRENGTH",
        "HIIT",
        "OTHER"
    ]).nullable(),
    distanceKm: nullablePositiveNumber,
    durationSeconds: nullablePositiveInteger,
    avgHeartRateBpm: nullablePositiveInteger,
    activeCaloriesKcal: nullableNonNegativeInteger
});
class OcrServiceError extends Error {
    code;
    constructor(code, message, options){
        super(message, options), this.code = code;
        this.name = "OcrServiceError";
    }
}
async function fileToBase64(file) {
    assertImageFile(file);
    return Buffer.from(await file.arrayBuffer()).toString("base64");
}
async function parseInbodyImage(file) {
    const content = await analyzeImage(file, [
        "Đây là ảnh chụp màn hình chỉ số cơ thể từ cân thông minh.",
        "Hãy trích xuất các thông số sau và trả về ĐÚNG định dạng JSON, không kèm markdown (không có ```json), không có bất kỳ text nào khác ngoài JSON:",
        "weightKg (số thực), bmi (số thực), bodyFatPercent (số thực), fatMassKg (số thực), muscleMassKg (số thực), boneMassKg (số thực), bmrKcal (số nguyên), bodyAge (số nguyên).",
        "Nếu không thấy chỉ số nào, hãy để null. Không tự suy đoán giá trị không hiển thị trong ảnh."
    ].join(" "));
    return parseAndValidateJson(content, inbodyResponseSchema);
}
async function parseWorkoutImage(file) {
    const content = await analyzeImage(file, [
        "Đây là ảnh chụp màn hình bản đồ hoặc kết quả tập luyện từ Strava, Garmin, Fitbit hoặc ứng dụng tương tự.",
        "Hãy phân tích và trả về ĐÚNG định dạng JSON, không kèm markdown và không có text ngoài JSON:",
        "type (chọn đúng một loại phù hợp nhất: WALK, RUN, CYCLING, STRENGTH, HIIT, OTHER), distanceKm (số thực), durationSeconds (tổng thời gian hoạt động quy ra giây, ví dụ 1:01:25 là 3685), avgHeartRateBpm (số nguyên), activeCaloriesKcal (số nguyên).",
        "Nếu không thấy một chỉ số, hãy để null. Không tự suy đoán giá trị không hiển thị trong ảnh."
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
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: process.env.OPENAI_VISION_MODEL?.trim() || process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "Bạn là hệ thống OCR dữ liệu sức khỏe và vận động. Chỉ đọc dữ liệu nhìn thấy rõ trong ảnh và luôn trả về một JSON object hợp lệ."
                    },
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: prompt
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:${file.type};base64,${base64}`,
                                    detail: "high"
                                }
                            }
                        ]
                    }
                ],
                response_format: {
                    type: "json_object"
                },
                max_tokens: 500,
                temperature: 0
            }),
            signal: AbortSignal.timeout(30_000)
        });
    } catch (error) {
        throw new OcrServiceError("OCR_PROVIDER_ERROR", "Không thể kết nối tới OpenAI Vision.", {
            cause: error
        });
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
    } catch (error) {
        throw new OcrServiceError("OCR_INVALID_RESPONSE", "Phản hồi từ OpenAI Vision không phải JSON hợp lệ.", {
            cause: error
        });
    }
}
function parseAndValidateJson(content, schema) {
    let parsed;
    try {
        parsed = JSON.parse(content);
    } catch (error) {
        throw new OcrServiceError("OCR_INVALID_RESPONSE", "Nội dung OCR không phải JSON hợp lệ.", {
            cause: error
        });
    }
    const result = schema.safeParse(parsed);
    if (!result.success) {
        throw new OcrServiceError("OCR_INVALID_RESPONSE", `JSON OCR không đúng cấu trúc: ${result.error.issues.map((issue)=>issue.path.join(".")).join(", ")}`);
    }
    return result.data;
}
function assertImageFile(file) {
    if (file.size === 0) throw new Error("Ảnh tải lên không được để trống.");
    if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
        throw new Error("Ảnh phải có định dạng PNG, JPEG, WEBP hoặc GIF không chuyển động.");
    }
}
}),
"[project]/src/app/api/upload/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$demoUser$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/demoUser.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$ocrService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/ocrService.ts [app-route] (ecmascript)");
;
;
;
;
const runtime = "nodejs";
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = new Set([
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/gif"
]);
async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file");
        const uploadType = formData.get("uploadType");
        if (!(file instanceof File)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "MISSING_IMAGE"
            }, {
                status: 400
            });
        }
        if (uploadType !== "inbody" && uploadType !== "workout") {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "INVALID_UPLOAD_TYPE"
            }, {
                status: 400
            });
        }
        if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "UNSUPPORTED_IMAGE_TYPE"
            }, {
                status: 400
            });
        }
        if (file.size === 0 || file.size > MAX_FILE_SIZE_BYTES) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "INVALID_FILE_SIZE"
            }, {
                status: 400
            });
        }
        const fileMetadata = {
            fileName: file.name,
            mimeType: file.type,
            sizeBytes: file.size,
            provider: "openai-vision",
            model: process.env.OPENAI_VISION_MODEL?.trim() || process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini"
        };
        if (uploadType === "inbody") {
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$ocrService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseInbodyImage"])(file);
            if (result.weightKg === null || result.bmrKcal === null) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: false,
                    error: "INBODY_REQUIRED_FIELDS_MISSING",
                    data: result
                }, {
                    status: 422
                });
            }
            const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$demoUser$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDemoUser"])();
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].inbodyHistory.create({
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
                    rawOcrData: fileMetadata
                }
            });
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                data: result
            });
        }
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$ocrService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseWorkoutImage"])(file);
        if (result.type === null || result.durationSeconds === null || result.activeCaloriesKcal === null) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "WORKOUT_REQUIRED_FIELDS_MISSING",
                data: result
            }, {
                status: 422
            });
        }
        const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$demoUser$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDemoUser"])();
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].workoutLog.create({
            data: {
                userId: user.id,
                performedAt: new Date(),
                activityType: result.type,
                distanceKm: result.distanceKm,
                durationSeconds: result.durationSeconds,
                avgPaceSecondsPerKm: result.distanceKm ? Math.round(result.durationSeconds / result.distanceKm) : null,
                avgHeartRateBpm: result.avgHeartRateBpm,
                activeCaloriesKcal: result.activeCaloriesKcal,
                sourceProvider: "OPENAI_VISION",
                rawOcrData: fileMetadata
            }
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: result
        });
    } catch (error) {
        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$ocrService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["OcrServiceError"]) {
            const status = error.code === "OCR_NOT_CONFIGURED" ? 503 : error.code === "OCR_PROVIDER_ERROR" ? 502 : 422;
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: error.code,
                message: error.message
            }, {
                status
            });
        }
        console.error("Upload processing failed.", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: "UPLOAD_PROCESSING_FAILED"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1l62h5i._.js.map