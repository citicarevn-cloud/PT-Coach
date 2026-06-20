"use client";

import { Flame } from "lucide-react";

export interface WeeklyTrackerDay {
  date: string;
  waterCompleted: boolean;
  dietCompleted: boolean;
  workoutCompleted: boolean;
}

const dayLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export default function WeeklyStreak({ days, todayDateKey }: { days: WeeklyTrackerDay[]; todayDateKey: string }) {
  const excellentDays = days.filter(isFullyCompleted).length;

  return (
    <section aria-labelledby="weekly-streak-title" className="rounded-2xl border border-white/80 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-orange-600 uppercase">Chuỗi tuần</p>
          <h2 id="weekly-streak-title" className="mt-0.5 text-lg font-extrabold text-slate-900">
            Nhịp độ 7 ngày
          </h2>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-extrabold text-orange-700">
          <Flame size={14} /> {excellentDays} ngày trọn vẹn
        </span>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const completedCount = countCompleted(day);
          const isToday = day.date === todayDateKey;
          const color = completedCount === 3
            ? "bg-emerald-500 text-white ring-emerald-100"
            : completedCount > 0
              ? "bg-orange-400 text-white ring-orange-100"
              : "bg-slate-100 text-slate-400 ring-slate-50";

          return (
            <div key={day.date} className="flex min-w-0 flex-col items-center">
              <span className={`text-[10px] font-extrabold ${isToday ? "text-teal-700" : "text-slate-400"}`}>
                {dayLabels[index]}
              </span>
              <div
                className={`mt-2 flex aspect-square w-full max-w-9 items-center justify-center rounded-full text-xs font-extrabold ring-4 ${color}`}
                title={`${dayLabels[index]}: ${completedCount}/3 mục tiêu`}
                aria-label={`${dayLabels[index]}: hoàn thành ${completedCount} trên 3 mục tiêu`}
              >
                {completedCount}
              </div>
              {isToday && <span className="mt-2 h-1 w-1 rounded-full bg-teal-600" aria-label="Hôm nay" />}
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-center gap-4 text-[10px] font-semibold text-slate-400">
        <Legend color="bg-emerald-500" label="Đủ 3" />
        <Legend color="bg-orange-400" label="Đang làm" />
        <Legend color="bg-slate-200" label="Chưa có" />
      </div>
    </section>
  );
}

function countCompleted(day: WeeklyTrackerDay): number {
  return [day.waterCompleted, day.dietCompleted, day.workoutCompleted].filter(Boolean).length;
}

function isFullyCompleted(day: WeeklyTrackerDay): boolean {
  return countCompleted(day) === 3;
}

function Legend({ color, label }: { color: string; label: string }) {
  return <span className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${color}`} />{label}</span>;
}
