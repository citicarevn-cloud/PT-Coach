import { CalendarCheck2, Flame, Gauge, Settings, Sparkles, Timer, Trophy } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import AICoachMessage from "@/components/AICoachMessage";
import ExerciseBreakdown from "@/components/ExerciseBreakdown";
import HabitChecklist from "@/components/HabitChecklist";
import MealPlanList from "@/components/MealPlanList";
import ProgressRings from "@/components/ProgressRings";
import RoadmapOverview from "@/components/RoadmapOverview";
import WeeklyStreak from "@/components/WeeklyStreak";
import WorkoutSubmission from "@/components/WorkoutSubmission";
import { calculateCalorieTarget, dailyDeficitForWeeklyLoss, isLowBoneMass } from "@/domain/fitness";
import { generateVietnameseMenu } from "@/domain/menu";
import { addCalendarDays, getCurrentWeekDateKeys, getLocalDateKey, getLocalDayRange, localDateKeyToUtc } from "@/lib/dates";
import { getDemoUser } from "@/lib/demoUser";
import { prisma } from "@/lib/prisma";
import type { ExerciseDetail, NutritionTargets, RoadmapPhase, WeeklyTemplateDay } from "@/services/onboardingService";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const now = new Date();
  const user = await getDemoUser();
  if (!user.hasCompletedOnboarding || user.targetWeight === null) redirect("/onboarding");

  const today = getLocalDayRange(now);
  const weekDateKeys = getCurrentWeekDateKeys(now);
  const weekStart = localDateKeyToUtc(weekDateKeys[0]);
  const weekEnd = localDateKeyToUtc(addCalendarDays(weekDateKeys[6], 1));
  const [todayPlan, todayWorkouts, latestInbody, todayTracker, weeklyTrackers, todayNutrition, fitnessRoadmap] = await Promise.all([
    prisma.workoutPlan.findUnique({ where: { userId_date: { userId: user.id, date: today.start } } }),
    prisma.workoutLog.findMany({ where: { userId: user.id, performedAt: { gte: today.start, lt: today.end } }, orderBy: { performedAt: "desc" } }),
    prisma.inbodyHistory.findFirst({ where: { userId: user.id }, orderBy: { measuredAt: "desc" } }),
    prisma.dailyTracker.findUnique({ where: { userId_date: { userId: user.id, date: today.start } } }),
    prisma.dailyTracker.findMany({ where: { userId: user.id, date: { gte: weekStart, lt: weekEnd } }, orderBy: { date: "asc" } }),
    prisma.dailyNutrition.findUnique({ where: { userId_date: { userId: user.id, date: today.start } } }),
    prisma.fitnessRoadmap.findUnique({ where: { userId: user.id } }),
  ]);

  const activeCalories = todayWorkouts.reduce((sum, workout) => sum + workout.activeCaloriesKcal, 0);
  const plannedActiveCalories = todayPlan?.targetKcal ?? user.targetActiveKcal ?? 350;
  const tdeeKcal = Math.round(user.tdee ?? latestInbody?.bmrKcal ?? 2_000);
  const calorieTarget = calculateCalorieTarget(tdeeKcal, dailyDeficitForWeeklyLoss(), user.sex);
  const targetCalories = calorieTarget.targetCaloriesKcal;
  const habitState = {
    waterCompleted: todayTracker?.waterCompleted ?? false,
    dietCompleted: todayTracker?.dietCompleted ?? false,
    workoutCompleted: todayTracker?.workoutCompleted ?? false,
  };
  const calciumFocus = isLowBoneMass(latestInbody?.boneMassKg ?? undefined, user.sex);
  const meals = generateVietnameseMenu(targetCalories, calciumFocus, createSeededRandom(today.dateKey));
  const caloriesConsumed = habitState.dietCompleted ? targetCalories : todayNutrition?.consumedCalories ?? 0;
  const weeklyTrackerMap = new Map(weeklyTrackers.map((tracker) => [getLocalDateKey(tracker.date), tracker]));
  const weeklyDays = weekDateKeys.map((date) => ({
    date,
    waterCompleted: weeklyTrackerMap.get(date)?.waterCompleted ?? false,
    dietCompleted: weeklyTrackerMap.get(date)?.dietCompleted ?? false,
    workoutCompleted: weeklyTrackerMap.get(date)?.workoutCompleted ?? false,
  }));
  const latestWorkout = todayWorkouts[0];
  const coachWorkout = latestWorkout ? {
    type: toTrackableActivity(latestWorkout.activityType),
    durationSeconds: latestWorkout.durationSeconds,
    activeCaloriesKcal: latestWorkout.activeCaloriesKcal,
    ...(latestWorkout.distanceKm !== null ? { distanceKm: latestWorkout.distanceKm } : {}),
    ...(latestWorkout.avgHeartRateBpm !== null ? { avgHeartRateBpm: latestWorkout.avgHeartRateBpm } : {}),
  } : undefined;
  const completionPercent = plannedActiveCalories > 0 ? Math.round((activeCalories / plannedActiveCalories) * 100) : 100;
  const name = user.name?.split(" ").at(-1) || "bạn";
  const dateLabel = new Intl.DateTimeFormat("vi-VN", { day: "numeric", month: "short", timeZone: "Asia/Ho_Chi_Minh" }).format(now);

  return (
    <main className="min-h-screen pb-12">
      <header className="border-b border-white/80 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-5 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-sm"><Sparkles size={21} /></div>
            <div className="min-w-0"><p className="text-xs font-bold tracking-wide text-teal-700 uppercase">Ted Fit Coach</p><h1 className="truncate text-lg font-extrabold text-slate-900">Chào {name}, sẵn sàng vận động?</h1></div>
          </div>
          <Link href="/settings" aria-label="Cài đặt Gemini" className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-teal-50 hover:text-teal-700"><Settings size={19} /></Link>
        </div>
      </header>

      <div className="mx-auto max-w-xl space-y-7 px-4 pt-6 sm:px-6">
        <section className="grid grid-cols-2 gap-3" aria-label="Chỉ số năng lượng">
          <MetricCard icon={Gauge} label="TDEE · Tổng tiêu hao" value={`${tdeeKcal.toLocaleString("vi-VN")} kcal`} note="Nền + sinh hoạt + vận động" color="teal" />
          <MetricCard icon={Flame} label="Mục tiêu vận động" value={`${(user.targetActiveKcal ?? 350).toLocaleString("vi-VN")} kcal`} note="Chỉ calories từ bài tập" color="orange" />
        </section>

        {fitnessRoadmap && (
          <RoadmapOverview
            currentWeight={fitnessRoadmap.currentWeight}
            targetWeight={fitnessRoadmap.targetWeight}
            totalChangeKg={fitnessRoadmap.totalChangeKg}
            recommendedWeeklyChangeKg={fitnessRoadmap.recommendedWeeklyChangeKg}
            estimatedWeeks={fitnessRoadmap.estimatedWeeks}
            estimatedMonths={fitnessRoadmap.estimatedMonths}
            phases={Array.isArray(fitnessRoadmap.phases) ? fitnessRoadmap.phases as unknown as RoadmapPhase[] : []}
            weeklyTemplate={Array.isArray(fitnessRoadmap.weeklyTemplate) ? fitnessRoadmap.weeklyTemplate as unknown as WeeklyTemplateDay[] : []}
            nutrition={isJsonObject(fitnessRoadmap.nutritionMacros) ? fitnessRoadmap.nutritionMacros as unknown as Partial<NutritionTargets> : null}
            aiSummary={fitnessRoadmap.aiSummary}
          />
        )}

        <WeeklyStreak days={weeklyDays} todayDateKey={today.dateKey} />

        <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-900/10" aria-labelledby="mission-title">
          <div className="absolute -top-16 -right-12 h-44 w-44 rounded-full bg-orange-500/25 blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between"><p className="text-xs font-extrabold tracking-[0.18em] text-orange-300 uppercase">Nhiệm vụ hôm nay</p><CalendarCheck2 size={21} className="text-orange-400" /></div>
            <h2 id="mission-title" className="mt-3 text-2xl font-black">{todayPlan ? activityLabel(todayPlan.exerciseType) : "Chưa có lịch cho hôm nay"}</h2>
            {todayPlan ? <><div className="mt-4 flex flex-wrap gap-2"><MissionPill icon={Timer} text={`${todayPlan.targetDuration} phút`} /><MissionPill icon={Flame} text={`Mục tiêu ${todayPlan.targetKcal} kcal`} /></div><p className="mt-4 border-l-2 border-teal-400 pl-3 text-sm leading-relaxed text-slate-300">{todayPlan.aiAdvice}</p><ExerciseBreakdown exercises={Array.isArray(todayPlan.exercises) ? todayPlan.exercises as unknown as ExerciseDetail[] : []} /></> : <p className="mt-3 text-sm text-slate-400">Hãy tạo lại kế hoạch khi chu kỳ 7 ngày kết thúc.</p>}
          </div>
        </section>

        {todayPlan?.exerciseType !== "REST" && <WorkoutSubmission suggestedType={toTrackableActivity(todayPlan?.exerciseType)} />}

        <section className="rounded-3xl border border-white bg-white p-5 shadow-sm" aria-labelledby="summary-title">
          <div className="flex items-center justify-between"><div><p className="text-xs font-bold tracking-[0.16em] text-emerald-700 uppercase">Plan vs. Actual</p><h2 id="summary-title" className="mt-1 text-xl font-extrabold text-slate-900">Tổng kết hôm nay</h2></div><Trophy className={completionPercent >= 100 ? "text-amber-500" : "text-slate-300"} size={25} /></div>
          <div className="mt-5 grid grid-cols-2 gap-3"><SummaryValue label="Kế hoạch" value={plannedActiveCalories} /><SummaryValue label="Thực tế" value={activeCalories} highlight /></div>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all" style={{ width: `${Math.min(completionPercent, 100)}%` }} /></div>
          <p className="mt-2 text-right text-xs font-bold text-slate-500">{Math.max(0, completionPercent)}% mục tiêu active kcal</p>
        </section>

        <HabitChecklist date={today.start.toISOString()} initialState={habitState} />
        <ProgressRings caloriesConsumed={caloriesConsumed} targetCalories={targetCalories} activeCalories={activeCalories} targetActiveCalories={plannedActiveCalories} waterCompleted={habitState.waterCompleted} dateLabel={dateLabel} />
        <AICoachMessage workout={coachWorkout ?? null} />
        <MealPlanList meals={meals} />
      </div>
    </main>
  );
}

function MetricCard({ icon: Icon, label, value, note, color }: { icon: typeof Gauge; label: string; value: string; note: string; color: "teal" | "orange" }) {
  const palette = color === "teal" ? "bg-teal-50 text-teal-700" : "bg-orange-50 text-orange-700";
  return <article className="rounded-2xl border border-white bg-white p-4 shadow-sm"><div className={`inline-flex rounded-xl p-2 ${palette}`}><Icon size={18} /></div><p className="mt-3 text-[11px] font-bold tracking-wide text-slate-500 uppercase">{label}</p><strong className="mt-1 block text-lg font-black text-slate-950">{value}</strong><p className="mt-1 text-[10px] leading-relaxed text-slate-400">{note}</p></article>;
}

function MissionPill({ icon: Icon, text }: { icon: typeof Timer; text: string }) {
  return <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-200"><Icon size={14} className="text-orange-400" />{text}</span>;
}

function SummaryValue({ label, value, highlight = false }: { label: string; value: number; highlight?: boolean }) {
  return <div className={`rounded-2xl p-4 ${highlight ? "bg-emerald-50" : "bg-slate-50"}`}><span className="text-xs font-bold text-slate-500">{label}</span><strong className={`mt-1 block text-2xl font-black ${highlight ? "text-emerald-700" : "text-slate-900"}`}>{value.toLocaleString("vi-VN")} <small className="text-xs">kcal</small></strong></div>;
}

function activityLabel(type: string): string {
  return ({ WALK: "Đi bộ", RUN: "Chạy bộ", CYCLING: "Đạp xe", STRENGTH: "Tập thân trên / kháng lực", HIIT: "HIIT", REST: "Ngày phục hồi", OTHER: "Vận động linh hoạt" } as Record<string, string>)[type] ?? "Vận động";
}

function toTrackableActivity(type?: string): "WALK" | "RUN" | "CYCLING" | "STRENGTH" | "HIIT" | "OTHER" {
  return type === "WALK" || type === "RUN" || type === "CYCLING" || type === "STRENGTH" || type === "HIIT" ? type : "OTHER";
}

function createSeededRandom(seedText: string): () => number {
  let seed = Array.from(seedText).reduce((value, character) => ((value * 31) + character.charCodeAt(0)) >>> 0, 2166136261);
  return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
}

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
