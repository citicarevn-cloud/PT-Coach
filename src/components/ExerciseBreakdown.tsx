import { Clock3, ExternalLink, Layers3, ListChecks, PlayCircle } from "lucide-react";
import type { ExerciseDetail } from "@/services/onboardingService";

export default function ExerciseBreakdown({ exercises }: { exercises?: ExerciseDetail[] | null }) {
  if (!exercises?.length) {
    return (
      <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-400">
        Chi tiết bài tập chưa sẵn sàng cho lịch cũ. Hãy tạo lại roadmap để nhận breakdown mới.
      </div>
    );
  }

  return (
    <div className="mt-5 border-t border-white/10 pt-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-extrabold text-white"><ListChecks size={17} className="text-orange-400" /> Chi tiết bài tập</h3>
        <span className="text-[10px] font-bold text-slate-400">Tổng {exercises.reduce((sum, exercise) => sum + exercise.durationMinutes, 0)} phút</span>
      </div>
      <ol className="mt-3 space-y-2.5">
        {exercises?.map((exercise, index) => (
          <li key={`${exercise.name}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.06] p-3.5">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-xs font-black text-white">{index + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h4 className="text-sm leading-snug font-extrabold text-white">{exercise.name}</h4>
                  <span className={`rounded-full px-2 py-1 text-[9px] font-black uppercase ${exercise.type === "video_hubert" ? "bg-red-500/15 text-red-300" : "bg-teal-500/15 text-teal-300"}`}>{exercise.type === "video_hubert" ? "Hubert Cù" : "Tự tập"}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-bold text-slate-300">
                  <span className="flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1"><Clock3 size={12} /> {exercise.durationMinutes} phút</span>
                  {exercise.sets && <span className="flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1"><Layers3 size={12} /> {exercise.sets} hiệp</span>}
                  {exercise.reps && <span className="rounded-lg bg-white/5 px-2 py-1">{exercise.reps} reps</span>}
                </div>
                {isSafeHttpUrl(exercise.illustrationUrl) && (
                  <a href={exercise.illustrationUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-2 text-[11px] font-extrabold text-white transition hover:bg-red-500 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none">
                    <PlayCircle size={15} /> Xem Clip Minh Họa <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function isSafeHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}
