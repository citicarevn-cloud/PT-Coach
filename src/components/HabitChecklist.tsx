"use client";

import { Check, Dumbbell, Droplets, LoaderCircle, Salad } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";

export interface HabitState {
  waterCompleted: boolean;
  dietCompleted: boolean;
  workoutCompleted: boolean;
}

type HabitKey = keyof HabitState;

const habits: Array<{
  key: HabitKey;
  label: string;
  detail: string;
  icon: LucideIcon;
  accent: string;
}> = [
  {
    key: "waterCompleted",
    label: "Uống đủ 2L nước",
    detail: "Giữ cơ thể đủ nước cả ngày",
    icon: Droplets,
    accent: "bg-blue-100 text-blue-600",
  },
  {
    key: "dietCompleted",
    label: "Tuân thủ chế độ ăn",
    detail: "Đúng khẩu phần và mục tiêu macro",
    icon: Salad,
    accent: "bg-emerald-100 text-emerald-600",
  },
  {
    key: "workoutCompleted",
    label: "Hoàn thành lịch tập",
    detail: "Đạt mục tiêu vận động hôm nay",
    icon: Dumbbell,
    accent: "bg-orange-100 text-orange-600",
  },
];

export default function HabitChecklist({ date, initialState }: { date: string; initialState: HabitState }) {
  const router = useRouter();
  const [state, setState] = useState(initialState);
  const [savingKey, setSavingKey] = useState<HabitKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setState(initialState), [initialState]);

  async function toggleHabit(key: HabitKey) {
    if (savingKey) return;
    const previousValue = state[key];
    const nextValue = !previousValue;
    setState((current) => ({ ...current, [key]: nextValue }));
    setSavingKey(key);
    setError(null);

    try {
      const response = await fetch("/api/tracker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, updates: { [key]: nextValue } }),
      });
      const payload = await response.json() as { success?: boolean };
      if (!response.ok || !payload.success) throw new Error("SAVE_FAILED");
      router.refresh();
    } catch {
      setState((current) => ({ ...current, [key]: previousValue }));
      setError("Chưa thể lưu thói quen. Vui lòng thử lại.");
    } finally {
      setSavingKey(null);
    }
  }

  const completedCount = Object.values(state).filter(Boolean).length;

  return (
    <section aria-labelledby="habit-checklist-title">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.18em] text-teal-700 uppercase">Daily Tracker</p>
          <h2 id="habit-checklist-title" className="mt-1 text-xl font-bold text-slate-900">
            Thói quen hôm nay
          </h2>
        </div>
        <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-extrabold text-teal-700">
          {completedCount}/3 hoàn thành
        </span>
      </div>

      <div className="space-y-2 rounded-2xl border border-white/80 bg-white p-3 shadow-sm">
        {habits.map((habit) => {
          const Icon = habit.icon;
          const checked = state[habit.key];
          const saving = savingKey === habit.key;
          return (
            <label
              key={habit.key}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 transition ${
                checked ? "border-emerald-200 bg-emerald-50/70" : "border-slate-100 hover:bg-slate-50"
              } ${savingKey && !saving ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={savingKey !== null}
                onChange={() => void toggleHabit(habit.key)}
                className="sr-only"
              />
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${habit.accent}`}>
                {saving ? <LoaderCircle size={19} className="animate-spin" /> : <Icon size={19} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block text-sm font-extrabold ${checked ? "text-emerald-800" : "text-slate-800"}`}>
                  {habit.label}
                </span>
                <span className="mt-0.5 block truncate text-xs text-slate-400">{habit.detail}</span>
              </span>
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
                  checked ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-200 text-transparent"
                }`}
                aria-hidden="true"
              >
                <Check size={14} strokeWidth={3} />
              </span>
            </label>
          );
        })}
      </div>
      {error && <p role="alert" className="mt-2 text-xs font-semibold text-rose-600">{error}</p>}
    </section>
  );
}
