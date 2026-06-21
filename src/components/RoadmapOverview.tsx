import { CalendarRange, ChevronRight, Dumbbell, Flag, Target, Utensils } from "lucide-react";
import type { NutritionTargets, RoadmapPhase, WeeklyTemplateDay } from "@/services/onboardingService";

interface RoadmapOverviewProps {
  currentWeight: number;
  targetWeight: number;
  totalChangeKg: number;
  recommendedWeeklyChangeKg: number;
  estimatedWeeks: number;
  estimatedMonths: number;
  phases?: RoadmapPhase[] | null;
  weeklyTemplate?: WeeklyTemplateDay[] | null;
  nutrition?: Partial<NutritionTargets> | null;
  aiSummary: string;
}

export default function RoadmapOverview(props: RoadmapOverviewProps) {
  return (
    <section className="space-y-4" aria-labelledby="roadmap-title">
      <div className="rounded-3xl border border-teal-100 bg-gradient-to-br from-teal-600 to-emerald-600 p-5 text-white shadow-lg shadow-teal-600/15">
        <div className="flex items-center justify-between">
          <div><p className="text-xs font-extrabold tracking-[0.16em] text-teal-100 uppercase">Lộ trình dài hạn</p><h2 id="roadmap-title" className="mt-1 text-2xl font-black">Từ {formatKg(props.currentWeight)} đến {formatKg(props.targetWeight)}</h2></div>
          <Target size={28} className="text-teal-100" />
        </div>
        <p className="mt-3 text-sm leading-relaxed text-teal-50">{props.aiSummary}</p>
        <div className="mt-5 grid grid-cols-3 gap-2">
          <RoadmapStat label="Thay đổi" value={`${formatNumber(props.totalChangeKg)} kg`} />
          <RoadmapStat label="Dự kiến" value={`${props.estimatedWeeks} tuần`} />
          <RoadmapStat label="Tốc độ" value={`${formatNumber(props.recommendedWeeklyChangeKg)} kg/tuần`} />
        </div>
        <p className="mt-3 text-right text-xs font-bold text-teal-100">Khoảng {formatNumber(props.estimatedMonths)} tháng</p>
      </div>

      <div className="rounded-3xl border border-white bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2"><Utensils size={19} className="text-orange-500" /><h3 className="text-lg font-extrabold text-slate-900">Macro mỗi ngày</h3></div>
        <div className="mt-4 grid grid-cols-4 gap-2">
          <Macro label="Calories" value={props.nutrition?.targetCaloriesKcal ?? 0} unit="kcal" />
          <Macro label="Protein" value={props.nutrition?.proteinGrams ?? 0} unit="g" />
          <Macro label="Carbs" value={props.nutrition?.carbGrams ?? 0} unit="g" />
          <Macro label="Fat" value={props.nutrition?.fatGrams ?? 0} unit="g" />
        </div>
        <p className="mt-3 text-xs font-semibold text-slate-400">TDEE tham chiếu: {(props.nutrition?.tdeeKcal ?? 0).toLocaleString("vi-VN")} kcal/ngày</p>
      </div>

      <div className="rounded-3xl border border-white bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2"><Flag size={19} className="text-violet-600" /><h3 className="text-lg font-extrabold text-slate-900">Các giai đoạn</h3></div>
        <div className="mt-4 space-y-3">
          {props.phases?.map((phase) => (
            <article key={phase.phaseNumber} className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-xs font-black text-white">{phase.phaseNumber}</span>
                <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h4 className="font-extrabold text-slate-900">{phase.name}</h4><span className="rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-bold text-violet-700">Tuần {phase.startWeek}-{phase.endWeek}</span></div><p className="mt-2 text-xs leading-relaxed text-slate-600">{phase.focus}</p><p className="mt-2 text-xs font-bold text-teal-700">Mốc cân nặng: {formatKg(phase.targetWeightEnd)}</p></div>
              </div>
            </article>
          ))}
          {!props.phases?.length && <p className="rounded-xl bg-slate-50 px-3 py-4 text-center text-xs font-semibold text-slate-500">Roadmap chưa có dữ liệu giai đoạn.</p>}
        </div>
      </div>

      <details className="group rounded-3xl border border-white bg-white p-5 shadow-sm">
        <summary className="flex cursor-pointer list-none items-center justify-between"><span className="flex items-center gap-2 text-lg font-extrabold text-slate-900"><CalendarRange size={19} className="text-teal-600" /> Mẫu lịch tập một tuần</span><ChevronRight size={19} className="text-slate-400 transition group-open:rotate-90" /></summary>
        <div className="mt-4 space-y-2">
          {props.weeklyTemplate?.map((day) => <div key={day.dayNumber} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5"><div className="flex min-w-0 items-center gap-2"><Dumbbell size={15} className="shrink-0 text-teal-600" /><span className="truncate text-xs font-bold text-slate-700">{day.dayLabel}: {activityLabel(day.exerciseType)}</span></div><span className="shrink-0 text-[10px] font-bold text-slate-400">{day.targetDuration} phút · {day.targetKcal} kcal</span></div>)}
          {!props.weeklyTemplate?.length && <p className="rounded-xl bg-slate-50 px-3 py-4 text-center text-xs font-semibold text-slate-500">Weekly template chưa sẵn sàng.</p>}
        </div>
      </details>
    </section>
  );
}

function RoadmapStat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-white/12 px-2 py-3 text-center"><span className="block text-[9px] font-bold text-teal-100 uppercase">{label}</span><strong className="mt-1 block text-sm font-black">{value}</strong></div>;
}

function Macro({ label, value, unit }: { label: string; value: number; unit: string }) {
  return <div className="rounded-xl bg-orange-50 px-1 py-3 text-center"><span className="block text-[9px] font-bold text-orange-600 uppercase">{label}</span><strong className="mt-1 block text-sm font-black text-slate-900">{value}<small className="ml-0.5 text-[9px] text-slate-400">{unit}</small></strong></div>;
}

function activityLabel(type: WeeklyTemplateDay["exerciseType"]): string {
  return ({ WALK: "Đi bộ", RUN: "Chạy", CYCLING: "Đạp xe", STRENGTH: "Kháng lực", HIIT: "HIIT", REST: "Phục hồi", OTHER: "Linh hoạt" })[type];
}

function formatKg(value: number): string { return `${formatNumber(value)} kg`; }
function formatNumber(value: number): string { return value.toLocaleString("vi-VN", { maximumFractionDigits: 1 }); }
