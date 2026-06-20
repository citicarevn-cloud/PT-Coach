export type Sex = "MALE" | "FEMALE" | "UNSPECIFIED";

export interface GoalAssessmentInput {
  currentWeightKg: number;
  targetWeightKg: number;
  requestedWeeks?: number;
}

export interface MacroInput {
  weightKg: number;
  targetCaloriesKcal: number;
  proteinGramsPerKg?: number;
}

const KCAL_PER_KG = 7_700;
const MIN_SAFE_WEEKLY_LOSS_KG = 0.5;
const MAX_SAFE_WEEKLY_LOSS_KG = 0.7;

export function calculateTdee(bmrKcal: number, activeCaloriesKcal: number): number {
  // The 20% covers normal daily movement and digestion outside logged exercise.
  return Math.round(bmrKcal * 1.2 + activeCaloriesKcal);
}

export function assessWeightGoal(input: GoalAssessmentInput) {
  const weightToLoseKg = Math.max(0, input.currentWeightKg - input.targetWeightKg);
  const safeMinimumWeeks = weightToLoseKg === 0
    ? 0
    : Math.ceil(weightToLoseKg / MAX_SAFE_WEEKLY_LOSS_KG);
  const comfortableWeeks = weightToLoseKg === 0
    ? 0
    : Math.ceil(weightToLoseKg / MIN_SAFE_WEEKLY_LOSS_KG);
  const requestedWeeklyLossKg = input.requestedWeeks && input.requestedWeeks > 0
    ? weightToLoseKg / input.requestedWeeks
    : null;
  const adjusted = requestedWeeklyLossKg !== null
    && requestedWeeklyLossKg > MAX_SAFE_WEEKLY_LOSS_KG;

  return {
    weightToLoseKg: round(weightToLoseKg, 1),
    safeMinimumWeeks,
    recommendedWeeks: comfortableWeeks,
    recommendedWeeklyLossKg: weightToLoseKg === 0 ? 0 : MIN_SAFE_WEEKLY_LOSS_KG,
    requestedWeeklyLossKg: requestedWeeklyLossKg === null ? null : round(requestedWeeklyLossKg, 2),
    adjusted,
    warning: adjusted
      ? `Mục tiêu yêu cầu giảm ${round(requestedWeeklyLossKg!, 2)} kg/tuần, vượt ngưỡng 0.7 kg/tuần. Lộ trình đã được kéo dài để hạn chế mất cơ.`
      : null,
  };
}

export function dailyDeficitForWeeklyLoss(weeklyLossKg = MIN_SAFE_WEEKLY_LOSS_KG): number {
  const safeLoss = Math.min(Math.max(weeklyLossKg, 0), MAX_SAFE_WEEKLY_LOSS_KG);
  return Math.round((safeLoss * KCAL_PER_KG) / 7);
}

export function calorieFloor(sex: Sex): number {
  if (sex === "MALE") return 1_500;
  if (sex === "FEMALE") return 1_200;
  return 1_400;
}

export function calculateCalorieTarget(tdeeKcal: number, desiredDeficitKcal: number, sex: Sex) {
  const deficit = Math.min(Math.max(desiredDeficitKcal, 0), dailyDeficitForWeeklyLoss(MAX_SAFE_WEEKLY_LOSS_KG));
  const floor = calorieFloor(sex);
  const targetCaloriesKcal = Math.max(floor, tdeeKcal - deficit);

  return {
    targetCaloriesKcal,
    appliedDeficitKcal: tdeeKcal - targetCaloriesKcal,
    calorieFloorKcal: floor,
    floorApplied: targetCaloriesKcal === floor && tdeeKcal - deficit < floor,
  };
}

export function calculateMacros(input: MacroInput) {
  const proteinRate = Math.min(Math.max(input.proteinGramsPerKg ?? 1.9, 1.8), 2);
  const proteinGrams = input.weightKg * proteinRate;
  let fatGrams = input.weightKg * 0.8;
  const minimumCarbGrams = 50;
  const minimumFatGrams = 40;
  const remainingKcal = input.targetCaloriesKcal - (proteinGrams * 4 + fatGrams * 9);
  let carbGrams = remainingKcal / 4;
  let carbFloorApplied = false;

  if (carbGrams < minimumCarbGrams) {
    carbFloorApplied = true;
    const missingCarbKcal = (minimumCarbGrams - carbGrams) * 4;
    carbGrams = minimumCarbGrams;
    fatGrams = Math.max(minimumFatGrams, fatGrams - missingCarbKcal / 9);
  }

  const roundedProteinGrams = Math.round(proteinGrams);
  const roundedFatGrams = Math.round(fatGrams);
  const roundedCarbGrams = carbFloorApplied
    ? minimumCarbGrams
    : Math.max(minimumCarbGrams, Math.round(
      (input.targetCaloriesKcal - roundedProteinGrams * 4 - roundedFatGrams * 9) / 4,
    ));
  const calculatedCaloriesKcal = roundedProteinGrams * 4
    + roundedFatGrams * 9
    + roundedCarbGrams * 4;

  return {
    proteinGrams: roundedProteinGrams,
    fatGrams: roundedFatGrams,
    carbGrams: roundedCarbGrams,
    proteinGramsPerKg: round(roundedProteinGrams / input.weightKg, 2),
    calculatedCaloriesKcal,
    calorieDifferenceKcal: calculatedCaloriesKcal - input.targetCaloriesKcal,
    constraintWarning: calculatedCaloriesKcal > input.targetCaloriesKcal + 10
      ? "Không thể khớp mục tiêu calo mà vẫn giữ tối thiểu 50g carb và 40g fat."
      : null,
  };
}

export function isLowBoneMass(boneMassKg: number | undefined, sex: Sex): boolean {
  if (boneMassKg === undefined) return false;
  const threshold = sex === "MALE" ? 2.5 : sex === "FEMALE" ? 1.8 : 2.1;
  return boneMassKg < threshold;
}

function round(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
