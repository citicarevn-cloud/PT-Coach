"use client";

import { CheckCircle2, Eye, EyeOff, KeyRound, LoaderCircle, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SettingsForm({ maskedKey }: { maskedKey: string | null }) {
  const router = useRouter();
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const apiKey = String(new FormData(form).get("geminiApiKey") ?? "").trim();
    setIsSaving(true);
    setStatus(null);
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ geminiApiKey: apiKey }),
      });
      const payload = await response.json() as { success?: boolean; message?: string };
      if (!response.ok || !payload.success) throw new Error(payload.message || "Không thể lưu API key.");
      form.reset();
      setShowKey(false);
      setStatus({ type: "success", message: "Gemini API Key đã được lưu an toàn phía máy chủ." });
      router.refresh();
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "Không thể lưu API key." });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-white bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-teal-700"><KeyRound size={21} /></div>
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Gemini API Key</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">Khóa chỉ được dùng tại server cho AI Coach, OCR và tạo lịch tập.</p>
        </div>
      </div>

      {maskedKey && <div className="mt-5 rounded-xl bg-emerald-50 px-4 py-3"><p className="text-xs font-bold text-emerald-700">Khóa hiện tại</p><code className="mt-1 block text-sm font-extrabold text-emerald-900">{maskedKey}</code></div>}

      <label className="mt-5 block">
        <span className="mb-2 block text-sm font-bold text-slate-700">Nhập khóa mới</span>
        <span className="relative block">
          <input name="geminiApiKey" type={showKey ? "text" : "password"} required minLength={20} maxLength={256} autoComplete="off" spellCheck={false} placeholder="AIzaSy..." className="h-13 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-12 font-mono text-sm text-slate-800 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100" />
          <button type="button" onClick={() => setShowKey((current) => !current)} aria-label={showKey ? "Ẩn API key" : "Hiện API key"} className="absolute top-1/2 right-3 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">{showKey ? <EyeOff size={18} /> : <Eye size={18} />}</button>
        </span>
      </label>

      <button type="submit" disabled={isSaving} className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 text-sm font-extrabold text-white transition hover:bg-teal-500 disabled:cursor-wait disabled:opacity-60">{isSaving ? <LoaderCircle className="animate-spin" size={18} /> : <Save size={18} />} {isSaving ? "Đang lưu..." : "Lưu Gemini API Key"}</button>
      {status && <p role="status" className={`mt-3 flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold ${status.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>{status.type === "success" && <CheckCircle2 size={16} />}{status.message}</p>}
    </form>
  );
}
