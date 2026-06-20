import { z } from "zod";

const sexSchema = z.enum(["MALE", "FEMALE", "UNSPECIFIED"]).default("UNSPECIFIED");

export const tdeeSchema = z.object({
  bmrKcal: z.number().int().min(700).max(4_000),
  activeCaloriesKcal: z.number().int().min(0).max(5_000),
});

export const macrosSchema = z.object({
  weightKg: z.number().positive().max(350),
  targetCaloriesKcal: z.number().int().min(1_000).max(6_000),
  proteinGramsPerKg: z.number().min(1.8).max(2).optional(),
});

export const dailyPlanSchema = z.object({
  currentWeightKg: z.number().positive().max(350),
  targetWeightKg: z.number().positive().max(350),
  requestedWeeks: z.number().positive().max(260).optional(),
  bmrKcal: z.number().int().min(700).max(4_000),
  activeCaloriesKcal: z.number().int().min(0).max(5_000),
  sex: sexSchema,
  boneMassKg: z.number().positive().max(10).optional(),
});
