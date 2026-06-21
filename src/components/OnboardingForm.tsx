"use client";

import { Activity, Camera, Check, ChevronRight, Dumbbell, LoaderCircle, Scale, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

type InbodyMode = "photo" | "manual";

export default function OnboardingForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<InbodyMode>("photo");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    if (mode === "photo" && selectedFile) formData.set("inbodyImage", selectedFile);
    if (mode === "photo") {
      formData.delete("bodyFatPercent");
      formData.delete("muscleMassKg");
      formData.delete("boneMassKg");
    }

    try {
      const response = await fetch("/api/onboarding", { method: "POST", body: formData });
      const payload = await response.json() as { success?: boolean; message?: string; error?: string };
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || friendlyError(payload.error));
      }
      router.replace("/dashboard");
      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Chưa thể tạo kế hoạch. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-3xl border border-white bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-100 text-teal-700"><Activity size={21} /></div>
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-teal-700 uppercase">Bước 1</p>
            <h2 className="text-lg font-extrabold text-slate-900">Thông tin nền tảng</h2>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <NumberField name="age" label="Tuổi" min={16} max={100} placeholder="32" suffix="tuổi" />
          <NumberField name="height" label="Chiều cao" min={120} max={230} step="0.1" placeholder="175" suffix="cm" />
          <NumberField name="weight" label="Cân nặng" min={35} max={300} step="0.1" placeholder="77.6" suffix="kg" />
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">Mục tiêu</span>
            <select name="goal" required defaultValue="LOSE_FAT" className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100">
              <option value="LOSE_FAT">Giảm mỡ</option>
              <option value="BUILD_MUSCLE">Tăng cơ</option>
              <option value="MAINTAIN_FITNESS">Duy trì thể lực</option>
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-3xl border border-white bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700"><Scale size={21} /></div>
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-violet-700 uppercase">Bước 2 · Tùy chọn</p>
            <h2 className="text-lg font-extrabold text-slate-900">Bổ sung dữ liệu Inbody</h2>
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-500">Ảnh hoặc số đo thủ công giúp AI điều chỉnh lịch tập tốt hơn. Bạn có thể bỏ qua nếu chưa có.</p>

        <div className="mt-4 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
          <ModeButton active={mode === "photo"} onClick={() => setMode("photo")} icon={Camera} label="Ảnh Inbody" />
          <ModeButton active={mode === "manual"} onClick={() => setMode("manual")} icon={Dumbbell} label="Nhập thủ công" />
        </div>

        {mode === "photo" ? (
          <div className="mt-4">
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)} />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="flex min-h-28 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-teal-200 bg-teal-50/60 px-4 text-center transition hover:border-teal-400 hover:bg-teal-50">
              {selectedFile ? <Check className="text-emerald-600" size={25} /> : <Camera className="text-teal-600" size={25} />}
              <span className="mt-2 text-sm font-bold text-slate-800">{selectedFile?.name ?? "Chọn ảnh Fitdays / cân thông minh"}</span>
              <span className="mt-1 text-xs text-slate-500">PNG, JPG, WEBP · tối đa 10 MB</span>
            </button>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            <NumberField name="bodyFatPercent" label="Mỡ" min={2} max={70} step="0.1" placeholder="24.1" suffix="%" required={false} />
            <NumberField name="muscleMassKg" label="Cơ" min={1} max={200} step="0.1" placeholder="55.3" suffix="kg" required={false} />
            <NumberField name="boneMassKg" label="Xương" min={0.5} max={15} step="0.1" placeholder="3.0" suffix="kg" required={false} />
          </div>
        )}
      </section>

      {error && <p role="alert" className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>}

      <button type="submit" disabled={isSubmitting} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 text-base font-extrabold text-white shadow-lg shadow-teal-600/20 transition hover:bg-teal-500 focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-wait disabled:opacity-70">
        {isSubmitting ? <><LoaderCircle className="animate-spin" size={20} /> AI đang thiết kế lịch 7 ngày...</> : <><Sparkles size={20} /> Tạo kế hoạch cá nhân <ChevronRight size={20} /></>}
      </button>
    </form>
  );
}

function NumberField({ name, label, min, max, step = "1", placeholder, suffix, required = true }: { name: string; label: string; min: number; max: number; step?: string; placeholder: string; suffix: string; required?: boolean }) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      <span className="relative block">
        <input name={name} type="number" required={required} min={min} max={max} step={step} placeholder={placeholder} className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 pr-11 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100" />
        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs font-bold text-slate-400">{suffix}</span>
      </span>
    </label>
  );
}

function ModeButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: typeof Camera; label: string }) {
  return <button type="button" onClick={onClick} className={`flex min-h-10 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold transition ${active ? "bg-white text-teal-700 shadow-sm" : "text-slate-500"}`}><Icon size={16} />{label}</button>;
}

function friendlyError(code?: string): string {
  if (code === "AI_NOT_CONFIGURED") return "OpenAI chưa được cấu hình trên máy chủ.";
  if (code === "INVALID_ONBOARDING_DATA") return "Một vài thông tin chưa hợp lệ. Hãy kiểm tra lại.";
  return "Chưa thể tạo kế hoạch. Vui lòng thử lại.";
}
