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
"[project]/src/services/ocrService.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseInbodyImage",
    ()=>parseInbodyImage,
    "parseWorkoutImage",
    ()=>parseWorkoutImage
]);
async function parseInbodyImage(file) {
    assertImageFile(file);
    return {
        weightKg: 77.6,
        bmi: 25,
        bodyFatPercent: 24.1,
        fatMassKg: 18.7,
        muscleMassKg: 55.3,
        boneMassKg: 3,
        bmrKcal: 1661,
        bodyAge: 37
    };
}
async function parseWorkoutImage(file) {
    assertImageFile(file);
    return {
        type: "WALK",
        distanceKm: 6.21,
        durationSeconds: 3685,
        avgHeartRateBpm: 134,
        activeCaloriesKcal: 404
    };
}
function assertImageFile(file) {
    if (file.size === 0) throw new Error("Ảnh tải lên không được để trống.");
    if (!file.type.startsWith("image/")) throw new Error("File tải lên phải là ảnh.");
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$ocrService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/ocrService.ts [app-route] (ecmascript)");
;
;
;
const runtime = "nodejs";
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const DEMO_USER_EMAIL = "ted.tran@example.com";
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
        if (!file.type.startsWith("image/")) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "FILE_MUST_BE_AN_IMAGE"
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
        const user = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.upsert({
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
            },
            select: {
                id: true
            }
        });
        const fileMetadata = {
            fileName: file.name,
            mimeType: file.type,
            sizeBytes: file.size,
            provider: "vision-api-mock"
        };
        if (uploadType === "inbody") {
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$ocrService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseInbodyImage"])(file);
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].inbodyHistory.create({
                data: {
                    userId: user.id,
                    measuredAt: new Date(),
                    ...result,
                    ocrConfidence: 0.97,
                    rawOcrData: fileMetadata
                }
            });
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                data: result
            });
        }
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$ocrService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseWorkoutImage"])(file);
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].workoutLog.create({
            data: {
                userId: user.id,
                performedAt: new Date(),
                activityType: result.type,
                distanceKm: result.distanceKm,
                durationSeconds: result.durationSeconds,
                avgPaceSecondsPerKm: Math.round(result.durationSeconds / result.distanceKm),
                avgHeartRateBpm: result.avgHeartRateBpm,
                activeCaloriesKcal: result.activeCaloriesKcal,
                sourceProvider: "STRAVA_OCR_MOCK",
                rawOcrData: fileMetadata
            }
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: result
        });
    } catch (error) {
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

//# sourceMappingURL=%5Broot-of-the-server%5D__0xxonbl._.js.map