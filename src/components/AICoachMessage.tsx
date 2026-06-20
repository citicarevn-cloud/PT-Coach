"use client";

import { Bot, RefreshCw, Sparkles } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export interface CoachWorkoutData {
  type: "WALK" | "RUN" | "CYCLING" | "STRENGTH" | "HIIT" | "OTHER";
  distanceKm?: number;
  durationSeconds: number;
  avgHeartRateBpm?: number;
  activeCaloriesKcal: number;
  heartRateZone?: 1 | 2 | 3 | 4 | 5;
}

const fallbackWorkout: CoachWorkoutData = {
  type: "WALK",
  distanceKm: 6.21,
  durationSeconds: 3685,
  avgHeartRateBpm: 134,
  activeCaloriesKcal: 404,
  heartRateZone: 2,
} as const;

export default function AICoachMessage({ workout = fallbackWorkout }: { workout?: CoachWorkoutData }) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadAnalysis = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setError(false);

    try {
      const response = await fetch("/api/coach/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workout),
        signal,
      });
      if (!response.ok) throw new Error("Không thể tải phân tích");

      const data = await response.json() as { message?: string };
      if (!data.message) throw new Error("Phản hồi không có nội dung");
      setMessage(data.message);
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === "AbortError") return;
      setError(true);
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, [workout]);

  useEffect(() => {
    const controller = new AbortController();
    void loadAnalysis(controller.signal);
    return () => controller.abort();
  }, [loadAnalysis]);

  return (
    <section aria-labelledby="ai-coach-title">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-bold tracking-[0.18em] text-violet-700 uppercase">
            <Sparkles size={14} /> Phân tích thông minh
          </p>
          <h2 id="ai-coach-title" className="mt-1 text-xl font-bold text-slate-900">
            AI Coach Message
          </h2>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Online
        </span>
      </div>

      <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-teal-50 p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-sm">
            <Bot size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2">
              <p className="text-sm font-extrabold text-slate-900">Ted Fit AI</p>
              <span className="text-[11px] font-semibold text-slate-400">vừa xong</span>
            </div>

            {isLoading && (
              <div className="space-y-2" aria-label="AI Coach đang phân tích">
                <div className="h-3 w-full animate-pulse rounded-full bg-violet-100" />
                <div className="h-3 w-11/12 animate-pulse rounded-full bg-violet-100" />
                <div className="h-3 w-3/4 animate-pulse rounded-full bg-violet-100" />
              </div>
            )}

            {!isLoading && !error && (
              <p className="text-sm leading-6 font-medium text-slate-600">{message}</p>
            )}

            {!isLoading && error && (
              <div>
                <p className="text-sm text-rose-700">Coach chưa thể gửi phân tích. Hãy thử lại sau một chút.</p>
                <button
                  type="button"
                  onClick={() => void loadAnalysis()}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-violet-500 focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:outline-none"
                >
                  <RefreshCw size={14} /> Thử lại
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
