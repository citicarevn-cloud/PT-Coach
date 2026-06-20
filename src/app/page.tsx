import { Bell, Sparkles } from "lucide-react";
import AICoachMessage from "@/components/AICoachMessage";
import HabitChecklist from "@/components/HabitChecklist";
import ImageUpload from "@/components/ImageUpload";
import MealPlanList from "@/components/MealPlanList";
import ProgressRings from "@/components/ProgressRings";
import WeeklyStreak from "@/components/WeeklyStreak";
import WorkoutCard from "@/components/WorkoutCard";
import {
  calculateCalorieTarget,
  calculateTdee,
  dailyDeficitForWeeklyLoss,
  isLowBoneMass,
} from "@/domain/fitness";
import { generateVietnameseMenu } from "@/domain/menu";
import { getDemoUser } from "@/lib/demoUser";
import {
  addCalendarDays,
  getCurrentWeekDateKeys,
  getLocalDateKey,
  getLocalDayRange,
  localDateKeyToUtc,
} from "@/lib/dates";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const now = new Date();
  const user = await getDemoUser();
  const today = getLocalDayRange(now);
  const weekDateKeys = getCurrentWeekDateKeys(now);
  const weekStart = localDateKeyToUtc(weekDateKeys[0]);
  const weekEnd = localDateKeyToUtc(addCalendarDays(weekDateKeys[6], 1));

  const [latestInbody, todayWorkouts, todayTracker, weeklyTrackers, todayNutrition] = await Promise.all([
    prisma.inbodyHistory.findFirst({
      where: { userId: user.id },
      orderBy: { measuredAt: "desc" },
    }),
    prisma.workoutLog.findMany({
      where: { userId: user.id, performedAt: { gte: today.start, lt: today.end } },
      orderBy: { performedAt: "desc" },
    }),
    prisma.dailyTracker.findUnique({
      where: { userId_date: { userId: user.id, date: today.start } },
    }),
    prisma.dailyTracker.findMany({
      where: { userId: user.id, date: { gte: weekStart, lt: weekEnd } },
      orderBy: { date: "asc" },
    }),
    prisma.dailyNutrition.findUnique({
      where: { userId_date: { userId: user.id, date: today.start } },
    }),
  ]);

  const habitState = {
    waterCompleted: todayTracker?.waterCompleted ?? false,
    dietCompleted: todayTracker?.dietCompleted ?? false,
    workoutCompleted: todayTracker?.workoutCompleted ?? false,
  };
  const activeCalories = todayWorkouts.reduce((sum, workout) => sum + workout.activeCaloriesKcal, 0);
  const bmrKcal = latestInbody?.bmrKcal ?? 1661;
  const tdeeKcal = calculateTdee(bmrKcal, activeCalories);
  const calorieTarget = calculateCalorieTarget(tdeeKcal, dailyDeficitForWeeklyLoss(), user.sex);
  const targetCalories = calorieTarget.targetCaloriesKcal;
  const calciumFocus = isLowBoneMass(latestInbody?.boneMassKg ?? undefined, user.sex);
  const meals = generateVietnameseMenu(targetCalories, calciumFocus, createSeededRandom(today.dateKey));
  const caloriesConsumed = habitState.dietCompleted
    ? targetCalories
    : todayNutrition?.consumedCalories ?? 0;
  const latestWorkout = todayWorkouts[0] ?? null;
  const trackerByDate = new Map(weeklyTrackers.map((tracker) => [getLocalDateKey(tracker.date), tracker]));
  const weeklyDays = weekDateKeys.map((date) => {
    const tracker = trackerByDate.get(date);
    return {
      date,
      waterCompleted: tracker?.waterCompleted ?? false,
      dietCompleted: tracker?.dietCompleted ?? false,
      workoutCompleted: tracker?.workoutCompleted ?? false,
    };
  });

  const workoutData = latestWorkout ? {
    activityType: latestWorkout.activityType,
    durationSeconds: latestWorkout.durationSeconds,
    distanceKm: latestWorkout.distanceKm,
    avgHeartRateBpm: latestWorkout.avgHeartRateBpm,
    activeCaloriesKcal: latestWorkout.activeCaloriesKcal,
  } : null;
  const coachWorkout = latestWorkout ? {
    type: latestWorkout.activityType,
    durationSeconds: latestWorkout.durationSeconds,
    activeCaloriesKcal: latestWorkout.activeCaloriesKcal,
    ...(latestWorkout.distanceKm !== null ? { distanceKm: latestWorkout.distanceKm } : {}),
    ...(latestWorkout.avgHeartRateBpm !== null ? { avgHeartRateBpm: latestWorkout.avgHeartRateBpm } : {}),
  } : undefined;
  const dateLabel = new Intl.DateTimeFormat("vi-VN", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(now);

  return (
    <main className="min-h-screen pb-10">
      <header className="border-b border-white/80 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-5 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-sm">
              <Sparkles size={21} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold tracking-wide text-teal-700 uppercase">Ted Fit Coach</p>
              <h1 className="text-base leading-snug font-extrabold text-slate-900 sm:text-lg">
                Chào Ted, hôm nay bạn cảm thấy thế nào?
              </h1>
            </div>
          </div>
          <button type="button" aria-label="Thông báo" className="ml-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200 focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-none">
            <Bell size={19} />
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-xl space-y-8 px-4 pt-6 sm:px-6">
        <WeeklyStreak days={weeklyDays} todayDateKey={today.dateKey} />
        <ImageUpload />
        <HabitChecklist date={today.start.toISOString()} initialState={habitState} />
        <ProgressRings
          caloriesConsumed={caloriesConsumed}
          targetCalories={targetCalories}
          activeCalories={activeCalories}
          waterCompleted={habitState.waterCompleted}
          dateLabel={dateLabel}
        />
        <AICoachMessage workout={coachWorkout} />
        <WorkoutCard workout={workoutData} />
        <MealPlanList meals={meals} />
      </div>
    </main>
  );
}

function createSeededRandom(seedText: string): () => number {
  let seed = Array.from(seedText).reduce((value, character) => ((value * 31) + character.charCodeAt(0)) >>> 0, 2166136261);
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
