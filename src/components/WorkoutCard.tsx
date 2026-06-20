import { ArrowUpRight, CheckCircle2, Clock3, Dumbbell, ShieldAlert } from "lucide-react";

export interface WorkoutCardData {
  activityType: "WALK" | "RUN" | "CYCLING" | "STRENGTH" | "HIIT" | "OTHER";
  durationSeconds: number;
  distanceKm?: number | null;
  avgHeartRateBpm?: number | null;
  activeCaloriesKcal: number;
}

const plannedWorkout = {
  name: "30 phút CARDIO HIIT ĐỐT MỠ tại nhà",
  activityType: "HIIT",
  durationMinutes: 32,
  injuryWarning: "Tránh tiếp đất bằng gót chân.",
  youtubeUrl: "https://www.youtube.com/watch?v=AMKKNs9cZZM",
};

export default function WorkoutCard({ workout }: { workout: WorkoutCardData | null }) {
  const durationMinutes = workout ? Math.max(1, Math.round(workout.durationSeconds / 60)) : plannedWorkout.durationMinutes;
  const title = workout
    ? `${activityLabel(workout.activityType)}${workout.distanceKm ? ` ${workout.distanceKm.toLocaleString("vi-VN")} km` : ""}`
    : plannedWorkout.name;

  return (
    <section aria-labelledby="workout-title">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.18em] text-orange-600 uppercase">Lịch tập</p>
          <h2 id="workout-title" className="mt-1 text-xl font-bold text-slate-900">Tập luyện hôm nay</h2>
        </div>
        <div className="rounded-xl bg-orange-100 p-2 text-orange-600" aria-hidden="true"><Dumbbell size={20} /></div>
      </div>

      <article className="relative overflow-hidden rounded-2xl bg-slate-900 p-5 text-white shadow-sm">
        <div className="absolute -top-16 -right-12 h-40 w-40 rounded-full bg-orange-500/25 blur-2xl" />
        <div className="absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-teal-400/15 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-extrabold tracking-wide">{workout?.activityType ?? plannedWorkout.activityType}</span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-300"><Clock3 size={14} /> {durationMinutes} phút</span>
          </div>
          <h3 className="mt-4 max-w-sm text-xl leading-snug font-extrabold">{title}</h3>
          <p className="mt-2 text-sm text-slate-400">
            {workout
              ? `${workout.activeCaloriesKcal} kcal${workout.avgHeartRateBpm ? ` · Nhịp tim TB ${workout.avgHeartRateBpm} bpm` : ""}`
              : "Toàn thân · Cardio cường độ cao · Không cần dụng cụ"}
          </p>
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-xs leading-relaxed text-slate-300">
            {workout ? <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-400" size={17} /> : <ShieldAlert className="mt-0.5 shrink-0 text-amber-400" size={17} />}
            <p>
              <strong className={`font-bold ${workout ? "text-emerald-300" : "text-amber-300"}`}>
                {workout ? "Đã ghi nhận:" : "Lưu ý chấn thương:"}
              </strong>{" "}
              {workout ? "Kết quả tập mới nhất hôm nay đã được đồng bộ." : plannedWorkout.injuryWarning}
            </p>
          </div>
          {workout ? (
            <div className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500/15 px-4 py-3 text-sm font-extrabold text-emerald-300">
              <CheckCircle2 size={18} /> Buổi tập đã hoàn thành
            </div>
          ) : (
            <a href={plannedWorkout.youtubeUrl} target="_blank" rel="noreferrer" className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-orange-400 focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:outline-none">
              Bắt đầu tập (Mở YouTube)<ArrowUpRight size={18} />
            </a>
          )}
        </div>
      </article>
    </section>
  );
}

function activityLabel(type: WorkoutCardData["activityType"]): string {
  return ({ WALK: "Đi bộ", RUN: "Chạy bộ", CYCLING: "Đạp xe", STRENGTH: "Tập kháng lực", HIIT: "HIIT", OTHER: "Vận động" })[type];
}
