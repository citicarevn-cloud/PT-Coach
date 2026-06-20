"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dailyPlanSchema = exports.macrosSchema = exports.tdeeSchema = void 0;
const zod_1 = require("zod");
const sexSchema = zod_1.z.enum(["MALE", "FEMALE", "UNSPECIFIED"]).default("UNSPECIFIED");
exports.tdeeSchema = zod_1.z.object({
    bmrKcal: zod_1.z.number().int().min(700).max(4_000),
    activeCaloriesKcal: zod_1.z.number().int().min(0).max(5_000),
});
exports.macrosSchema = zod_1.z.object({
    weightKg: zod_1.z.number().positive().max(350),
    targetCaloriesKcal: zod_1.z.number().int().min(1_000).max(6_000),
    proteinGramsPerKg: zod_1.z.number().min(1.8).max(2).optional(),
});
exports.dailyPlanSchema = zod_1.z.object({
    currentWeightKg: zod_1.z.number().positive().max(350),
    targetWeightKg: zod_1.z.number().positive().max(350),
    requestedWeeks: zod_1.z.number().positive().max(260).optional(),
    bmrKcal: zod_1.z.number().int().min(700).max(4_000),
    activeCaloriesKcal: zod_1.z.number().int().min(0).max(5_000),
    sex: sexSchema,
    boneMassKg: zod_1.z.number().positive().max(10).optional(),
});
