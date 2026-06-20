import { Apple, Beef, ChevronRight, Coffee, Moon, Salad } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { MealType, MenuMeal } from "@/domain/menu";

const mealIcons: Record<MealType, LucideIcon> = {
  BREAKFAST: Coffee,
  LUNCH: Salad,
  PRE_WORKOUT: Apple,
  DINNER: Moon,
};

const mealAccent: Record<MealType, string> = {
  BREAKFAST: "bg-amber-100 text-amber-700",
  LUNCH: "bg-emerald-100 text-emerald-700",
  PRE_WORKOUT: "bg-rose-100 text-rose-700",
  DINNER: "bg-indigo-100 text-indigo-700",
};

export default function MealPlanList({ meals }: { meals: MenuMeal[] }) {
  const totalKcal = meals.reduce((sum, meal) => sum + meal.totals.kcal, 0);

  return (
    <section aria-labelledby="meal-plan-title">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.18em] text-emerald-700 uppercase">Dinh dưỡng</p>
          <h2 id="meal-plan-title" className="mt-1 text-xl font-bold text-slate-900">
            Thực đơn hôm nay
          </h2>
        </div>
        <div className="text-right">
          <p className="text-sm font-extrabold text-slate-800">{totalKcal.toLocaleString("vi-VN")} kcal</p>
          <p className="text-[11px] font-medium text-slate-400">4 bữa cân bằng</p>
        </div>
      </div>

      <div className="space-y-3">
        {meals.map((meal) => {
          const Icon = mealIcons[meal.type];
          return (
            <article
              key={meal.type}
              className="rounded-2xl border border-white/80 bg-white p-4 shadow-sm transition hover:border-emerald-100"
            >
              <div className="flex items-start gap-3">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${mealAccent[meal.type]}`}>
                  <Icon size={20} strokeWidth={2.25} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-extrabold text-slate-900">{meal.label}</h3>
                    <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                      {meal.totals.kcal} kcal
                    </span>
                  </div>
                  <ul className="mt-2 space-y-1.5">
                    {meal.items.map((item) => (
                      <li key={item.name} className="flex items-center gap-2 text-sm text-slate-500">
                        <ChevronRight size={14} className="shrink-0 text-emerald-500" />
                        <span className="truncate">{item.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800">
        <Beef size={16} className="shrink-0" />
        Thực đơn ưu tiên protein và thực phẩm giàu Canxi/Vitamin D.
      </div>
    </section>
  );
}
