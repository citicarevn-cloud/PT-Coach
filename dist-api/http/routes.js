"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const fitness_js_1 = require("../domain/fitness.js");
const menu_js_1 = require("../domain/menu.js");
const schemas_js_1 = require("./schemas.js");
exports.apiRouter = (0, express_1.Router)();
exports.apiRouter.post("/calculations/tdee", (req, res) => {
    const input = schemas_js_1.tdeeSchema.parse(req.body);
    res.json({
        bmrKcal: input.bmrKcal,
        activeCaloriesKcal: input.activeCaloriesKcal,
        tdeeKcal: (0, fitness_js_1.calculateTdee)(input.bmrKcal, input.activeCaloriesKcal),
        formula: "BMR x 1.2 + active calories",
    });
});
exports.apiRouter.post("/calculations/macros", (req, res) => {
    const input = schemas_js_1.macrosSchema.parse(req.body);
    res.json((0, fitness_js_1.calculateMacros)(input));
});
exports.apiRouter.post("/daily-plan", (req, res) => {
    const input = schemas_js_1.dailyPlanSchema.parse(req.body);
    const goal = (0, fitness_js_1.assessWeightGoal)(input);
    const tdeeKcal = (0, fitness_js_1.calculateTdee)(input.bmrKcal, input.activeCaloriesKcal);
    const desiredDeficitKcal = (0, fitness_js_1.dailyDeficitForWeeklyLoss)(goal.recommendedWeeklyLossKg);
    const calorieTarget = (0, fitness_js_1.calculateCalorieTarget)(tdeeKcal, desiredDeficitKcal, input.sex);
    const macros = (0, fitness_js_1.calculateMacros)({
        weightKg: input.currentWeightKg,
        targetCaloriesKcal: calorieTarget.targetCaloriesKcal,
    });
    const calciumFocus = (0, fitness_js_1.isLowBoneMass)(input.boneMassKg, input.sex);
    res.json({
        goal,
        energy: { tdeeKcal, ...calorieTarget },
        macros,
        calciumFocus,
        menu: (0, menu_js_1.generateVietnameseMenu)(calorieTarget.targetCaloriesKcal, calciumFocus),
        safetyNote: "Kế hoạch mang tính tham khảo, không thay thế tư vấn của bác sĩ hoặc chuyên gia dinh dưỡng.",
    });
});
exports.apiRouter.use((error, _req, res, _next) => {
    if (error instanceof zod_1.ZodError) {
        res.status(400).json({ error: "INVALID_INPUT", details: error.flatten() });
        return;
    }
    throw error;
});
