import { Router } from "express";
import { ZodError } from "zod";
import {
  assessWeightGoal,
  calculateCalorieTarget,
  calculateMacros,
  calculateTdee,
  dailyDeficitForWeeklyLoss,
  isLowBoneMass,
} from "../domain/fitness.js";
import { generateVietnameseMenu } from "../domain/menu.js";
import { dailyPlanSchema, macrosSchema, tdeeSchema } from "./schemas.js";

export const apiRouter = Router();

apiRouter.post("/calculations/tdee", (req, res) => {
  const input = tdeeSchema.parse(req.body);
  res.json({
    bmrKcal: input.bmrKcal,
    activeCaloriesKcal: input.activeCaloriesKcal,
    tdeeKcal: calculateTdee(input.bmrKcal, input.activeCaloriesKcal),
    formula: "BMR x 1.2 + active calories",
  });
});

apiRouter.post("/calculations/macros", (req, res) => {
  const input = macrosSchema.parse(req.body);
  res.json(calculateMacros(input));
});

apiRouter.post("/daily-plan", (req, res) => {
  const input = dailyPlanSchema.parse(req.body);
  const goal = assessWeightGoal(input);
  const tdeeKcal = calculateTdee(input.bmrKcal, input.activeCaloriesKcal);
  const desiredDeficitKcal = dailyDeficitForWeeklyLoss(goal.recommendedWeeklyLossKg);
  const calorieTarget = calculateCalorieTarget(tdeeKcal, desiredDeficitKcal, input.sex);
  const macros = calculateMacros({
    weightKg: input.currentWeightKg,
    targetCaloriesKcal: calorieTarget.targetCaloriesKcal,
  });
  const calciumFocus = isLowBoneMass(input.boneMassKg, input.sex);

  res.json({
    goal,
    energy: { tdeeKcal, ...calorieTarget },
    macros,
    calciumFocus,
    menu: generateVietnameseMenu(calorieTarget.targetCaloriesKcal, calciumFocus),
    safetyNote: "Kế hoạch mang tính tham khảo, không thay thế tư vấn của bác sĩ hoặc chuyên gia dinh dưỡng.",
  });
});

apiRouter.use((error: unknown, _req: unknown, res: any, _next: unknown) => {
  if (error instanceof ZodError) {
    res.status(400).json({ error: "INVALID_INPUT", details: error.flatten() });
    return;
  }
  throw error;
});
