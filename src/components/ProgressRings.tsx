import { Droplets, Flame, Utensils } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ProgressRingItem {
  label: string;
  value: number;
  goal: number;
  displayValue: string;
  displayGoal: string;
  unit: string;
  color: string;
  trackColor: string;
  icon: LucideIcon;
}

interface ProgressRingsProps {
  caloriesConsumed: number;
  targetCalories: number;
  activeCalories: number;
  targetActiveCalories?: number;
  waterCompleted: boolean;
  dateLabel: string;
}

export default function ProgressRings({
  caloriesConsumed,
  targetCalories,
  activeCalories,
  targetActiveCalories = 500,
  waterCompleted,
  dateLabel,
}: ProgressRingsProps) {
  const progressItems: ProgressRingItem[] = [
    {
      label: "Dinh dưỡng",
      value: caloriesConsumed,
      goal: targetCalories,
      displayValue: formatNumber(caloriesConsumed),
      displayGoal: formatNumber(targetCalories),
      unit: "kcal",
      color: "#16a34a",
      trackColor: "#dcfce7",
      icon: Utensils,
    },
    {
      label: "Vận động",
      value: activeCalories,
      goal: targetActiveCalories,
      displayValue: formatNumber(activeCalories),
      displayGoal: formatNumber(targetActiveCalories),
      unit: "kcal",
      color: "#f97316",
      trackColor: "#ffedd5",
      icon: Flame,
    },
    {
      label: "Nước",
      value: waterCompleted ? 2 : 0,
      goal: 2,
      displayValue: waterCompleted ? "2,0" : "0",
      displayGoal: "2",
      unit: "lít",
      color: "#3b82f6",
      trackColor: "#dbeafe",
      icon: Droplets,
    },
  ];

  return (
    <section aria-labelledby="daily-overview-title">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.18em] text-teal-700 uppercase">Tổng quan</p>
          <h2 id="daily-overview-title" className="mt-1 text-xl font-bold text-slate-900">Tiến độ hôm nay</h2>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm">{dateLabel}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/80 bg-white p-3 shadow-sm sm:gap-4 sm:p-5">
        {progressItems.map((item) => <ProgressRing key={item.label} item={item} />)}
      </div>
    </section>
  );
}

function ProgressRing({ item }: { item: ProgressRingItem }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const progress = item.goal > 0 ? Math.min(Math.max(item.value / item.goal, 0), 1) : 0;
  const Icon = item.icon;
  return (
    <div className="flex min-w-0 flex-col items-center text-center" aria-label={`${item.label}: ${item.displayValue} trên ${item.displayGoal} ${item.unit}`}>
      <div className="relative aspect-square w-full max-w-28">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r={radius} fill="none" stroke={item.trackColor} strokeWidth="8" />
          <circle cx="50" cy="50" r={radius} fill="none" stroke={item.color} strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress)} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon size={15} strokeWidth={2.25} style={{ color: item.color }} />
          <strong className="mt-1 text-sm leading-none font-extrabold text-slate-900 sm:text-base">{item.displayValue}</strong>
          <span className="mt-1 text-[9px] font-semibold text-slate-400 uppercase sm:text-[10px]">/ {item.displayGoal} {item.unit}</span>
        </div>
      </div>
      <p className="mt-2 truncate text-xs font-bold text-slate-700 sm:text-sm">{item.label}</p>
    </div>
  );
}

function formatNumber(value: number): string {
  return value.toLocaleString("vi-VN", { maximumFractionDigits: 0 });
}
