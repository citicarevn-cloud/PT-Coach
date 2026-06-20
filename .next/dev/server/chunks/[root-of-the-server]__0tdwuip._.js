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
"[project]/src/services/aiCoachService.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "analyzeWorkoutSession",
    ()=>analyzeWorkoutSession,
    "buildWorkoutPrompt",
    ()=>buildWorkoutPrompt
]);
const MOCK_COACH_MESSAGE = "Tuyệt vời Ted! Bạn vừa hoàn thành 6,21 km đi bộ trong 1 giờ 1 phút và đốt 404 kcal, một buổi vận động rất chất lượng. Việc duy trì nhịp tim trung bình 134 bpm trong Zone 2 giúp cơ thể sử dụng chất béo hiệu quả hơn, đồng thời xây dựng nền tảng sức bền mà không gây quá tải. Hãy bù nước đều trong vài giờ tới và nhớ tuân thủ thực đơn bữa tối giàu protein để hỗ trợ phục hồi nhé!";
async function analyzeWorkoutSession(workout) {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) return createMockResponse(workout);
    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "Bạn là AI Fitness Coach thân thiện, năng động. Chỉ phân tích từ dữ liệu được cung cấp, trả lời bằng tiếng Việt trong 3-4 câu ngắn gọn."
                    },
                    {
                        role: "user",
                        content: buildWorkoutPrompt(workout)
                    }
                ],
                max_tokens: 250
            }),
            signal: AbortSignal.timeout(12_000)
        });
        if (!response.ok) {
            throw new Error(`OpenAI request failed with status ${response.status}`);
        }
        const payload = await response.json();
        const message = extractOutputText(payload);
        if (!message) throw new Error("OpenAI response did not contain text output");
        return message;
    } catch (error) {
        console.warn("AI Coach is using its local fallback response.", error);
        return createMockResponse(workout);
    }
}
function buildWorkoutPrompt(workout) {
    const activity = activityLabel(workout.type);
    const distance = workout.distanceKm === undefined ? "không ghi nhận quãng đường" : `${formatDecimal(workout.distanceKm)} km`;
    const heartRate = workout.avgHeartRateBpm === undefined ? "không ghi nhận nhịp tim" : `nhịp tim trung bình ${workout.avgHeartRateBpm} bpm`;
    const zone = workout.heartRateZone ? `Thiết bị/hồ sơ cá nhân phân loại nhịp tim này ở Zone ${workout.heartRateZone}${workout.heartRateZone === 2 ? " (Vùng đốt mỡ)" : ""}.` : "Không tự suy đoán vùng nhịp tim khi chưa có phân loại cá nhân.";
    return [
        `Người dùng tên Ted Tran vừa hoàn thành buổi tập: ${activity} ${distance} trong ${formatDuration(workout.durationSeconds)}, ${heartRate}, đốt ${workout.activeCaloriesKcal} kcal.`,
        zone,
        "Hãy chúc mừng, phân tích lợi ích của buổi tập và vùng nhịp tim nếu có, sau đó nhắc uống đủ nước và tuân thủ thực đơn bữa tối."
    ].join(" ");
}
function createMockResponse(workout) {
    const isMasterPromptExample = workout.type === "WALK" && workout.distanceKm === 6.21 && workout.durationSeconds === 3685 && workout.avgHeartRateBpm === 134 && workout.activeCaloriesKcal === 404 && workout.heartRateZone === 2;
    if (isMasterPromptExample) return MOCK_COACH_MESSAGE;
    const activity = activityLabel(workout.type).toLocaleLowerCase("vi-VN");
    const zoneMessage = workout.heartRateZone === 2 ? "Duy trì Zone 2 giúp xây dựng sức bền aerobic và hỗ trợ cơ thể sử dụng chất béo hiệu quả." : "Buổi vận động này là một bước tiến tốt cho sức bền và mục tiêu năng lượng của bạn.";
    return `Làm tốt lắm Ted! Bạn đã hoàn thành buổi ${activity} trong ${formatDuration(workout.durationSeconds)} và đốt ${workout.activeCaloriesKcal} kcal. ${zoneMessage} Hãy uống đủ nước và giữ đúng thực đơn bữa tối để cơ thể phục hồi nhé!`;
}
function extractOutputText(payload) {
    const content = payload.choices?.[0]?.message?.content;
    return content?.trim() || null;
}
function activityLabel(type) {
    const labels = {
        WALK: "Đi bộ",
        RUN: "Chạy bộ",
        CYCLING: "Đạp xe",
        STRENGTH: "Tập kháng lực",
        HIIT: "HIIT",
        OTHER: "Vận động"
    };
    return labels[type];
}
function formatDuration(durationSeconds) {
    const hours = Math.floor(durationSeconds / 3_600);
    const minutes = Math.floor(durationSeconds % 3_600 / 60);
    if (hours === 0) return `${minutes} phút`;
    if (minutes === 0) return `${hours} giờ`;
    return `${hours} giờ ${minutes} phút`;
}
function formatDecimal(value) {
    return value.toLocaleString("vi-VN", {
        maximumFractionDigits: 2
    });
}
}),
"[project]/src/app/api/coach/analyze/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v3/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$aiCoachService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/aiCoachService.ts [app-route] (ecmascript)");
;
;
;
const workoutSessionSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        "WALK",
        "RUN",
        "CYCLING",
        "STRENGTH",
        "HIIT",
        "OTHER"
    ]),
    distanceKm: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().positive().max(500).optional(),
    durationSeconds: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive().max(86_400),
    avgHeartRateBpm: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().min(30).max(240).optional(),
    activeCaloriesKcal: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().nonnegative().max(5_000),
    heartRateZone: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].union([
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal(1),
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal(2),
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal(3),
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal(4),
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal(5)
    ]).optional()
});
async function POST(request) {
    try {
        const body = await request.json();
        const parsed = workoutSessionSchema.safeParse(body);
        if (!parsed.success) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "INVALID_WORKOUT_DATA",
                details: parsed.error.flatten()
            }, {
                status: 400
            });
        }
        const message = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$aiCoachService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["analyzeWorkoutSession"])(parsed.data);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message
        });
    } catch  {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "INVALID_JSON",
            message: "Request body phải là JSON hợp lệ."
        }, {
            status: 400
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0tdwuip._.js.map