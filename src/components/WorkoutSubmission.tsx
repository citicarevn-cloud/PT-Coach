"use client";

import { Camera, CheckCircle2, Edit3, HeartPulse, LoaderCircle, Timer, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { friendlyApiError } from "@/utils/clientError";

type SubmissionMode = "vision" | "manual";
type ActivityType = "WALK" | "RUN" | "CYCLING" | "STRENGTH" | "HIIT" | "OTHER";

export default function WorkoutSubmission({ suggestedType }: { suggestedType: ActivityType }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<SubmissionMode>("vision");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  async function uploadScreenshot(file: File) {
    setIsSubmitting(true);
    setStatus(null);
    const formData = new FormData();
    formData.set("file", file);
    formData.set("uploadType", "workout");
    try {
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      const payload = await response.json() as { success?: boolean; message?: string; error?: string };
      if (!response.ok || !payload.success) throw new Error(friendlyApiError(payload.error, payload.message));
      setStatus({ type: "success", message: "AI đã đọc và lưu kết quả buổi tập." });
      router.refresh();
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error
          ? error.message
          : "Chưa thể đọc ảnh. Hãy thử ảnh rõ hơn hoặc nhập tay.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submitManual(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setIsSubmitting(true);
    setStatus(null);
    const data = new FormData(form);
    try {
      const response = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activityType: data.get("activityType"),
          durationMinutes: Number(data.get("durationMinutes")),
          activeCaloriesKcal: Number(data.get("activeCaloriesKcal")),
          avgHeartRateBpm: data.get("avgHeartRateBpm") ? Number(data.get("avgHeartRateBpm")) : null,
        }),
      });
      const payload = await response.json() as { success?: boolean };
      if (!response.ok || !payload.success) throw new Error("SAVE_FAILED");
      form.reset();
      setStatus({ type: "success", message: "Đã lưu kết quả tập thủ công." });
      router.refresh();
    } catch {
      setStatus({ type: "error", message: "Thông tin chưa hợp lệ hoặc chưa thể lưu." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-3xl border border-white bg-white p-5 shadow-sm" aria-labelledby="workout-submit-title">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-violet-700 uppercase">Ghi nhận kết quả</p>
          <h2 id="workout-submit-title" className="mt-1 text-lg font-extrabold text-slate-900">Bạn muốn cập nhật thế nào?</h2>
        </div>
        <div className="rounded-2xl bg-violet-100 p-2.5 text-violet-700"><Zap size={20} /></div>
      </div>
      <div className="mt-4 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
        <Tab active={mode === "vision"} onClick={() => setMode("vision")} icon={Camera} label="AI Vision" />
        <Tab active={mode === "manual"} onClick={() => setMode("manual")} icon={Edit3} label="Nhập thủ công" />
      </div>

      {mode === "vision" ? (
        <div className="mt-4">
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" disabled={isSubmitting} onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void uploadScreenshot(file); }} />
          <button type="button" disabled={isSubmitting} onClick={() => fileInputRef.current?.click()} className="flex min-h-24 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/60 text-violet-700 transition hover:border-violet-400 disabled:opacity-60">
            {isSubmitting ? <LoaderCircle className="animate-spin" size={24} /> : <Camera size={24} />}
            <span className="mt-2 text-sm font-extrabold">{isSubmitting ? "AI đang phân tích..." : "Tải ảnh Strava / Garmin"}</span>
            <span className="mt-1 text-xs text-slate-500">AI đọc thời lượng, nhịp tim và active kcal</span>
          </button>
        </div>
      ) : (
        <form onSubmit={submitManual} className="mt-4 space-y-3">
          <select name="activityType" defaultValue={suggestedType} className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-800 outline-none focus:border-teal-500">
            <option value="WALK">Đi bộ</option><option value="RUN">Chạy bộ</option><option value="CYCLING">Đạp xe</option><option value="STRENGTH">Kháng lực</option><option value="HIIT">HIIT</option><option value="OTHER">Khác</option>
          </select>
          <div className="grid grid-cols-3 gap-2">
            <CompactInput name="durationMinutes" label="Phút" min={1} max={600} icon={Timer} />
            <CompactInput name="activeCaloriesKcal" label="Kcal" min={0} max={5000} icon={Zap} />
            <CompactInput name="avgHeartRateBpm" label="BPM" min={30} max={240} icon={HeartPulse} required={false} />
          </div>
          <button type="submit" disabled={isSubmitting} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-extrabold text-white transition hover:bg-slate-800 disabled:opacity-60">{isSubmitting && <LoaderCircle className="animate-spin" size={17} />} Lưu kết quả</button>
        </form>
      )}

      {status && <p role="status" className={`mt-3 flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold ${status.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>{status.type === "success" && <CheckCircle2 size={16} />}{status.message}</p>}
    </section>
  );
}

function Tab({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: typeof Camera; label: string }) {
  return <button type="button" onClick={onClick} className={`flex min-h-10 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold transition ${active ? "bg-white text-violet-700 shadow-sm" : "text-slate-500"}`}><Icon size={16} />{label}</button>;
}

function CompactInput({ name, label, min, max, icon: Icon, required = true }: { name: string; label: string; min: number; max: number; icon: typeof Timer; required?: boolean }) {
  return <label className="relative block"><Icon className="absolute top-1/2 left-2.5 -translate-y-1/2 text-slate-400" size={15} /><input name={name} type="number" min={min} max={max} required={required} placeholder={label} className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pr-2 pl-8 text-sm font-bold text-slate-800 outline-none focus:border-teal-500" /></label>;
}
