"use client";

import { Bot, CheckCircle2, Eye, EyeOff, KeyRound, LoaderCircle, Save, Sparkles, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ComponentType } from "react";
import { useState } from "react";

type Provider = "gemini" | "openai" | "groq";

type SettingsFormProps = {
  maskedKeys: Record<Provider, string | null>;
  preferredAi: string | null;
};

const providers: Array<{
  id: Provider;
  label: string;
  helper: string;
  placeholder: string;
  icon: ComponentType<{ size?: number; className?: string }>;
}> = [
  {
    id: "gemini",
    label: "Gemini",
    helper: "Tốt cho OCR ảnh và tạo kế hoạch nhanh.",
    placeholder: "AIzaSy...",
    icon: Sparkles,
  },
  {
    id: "openai",
    label: "ChatGPT / OpenAI",
    helper: "Fallback ổn định cho JSON và phân tích dài.",
    placeholder: "sk-proj-...",
    icon: Bot,
  },
  {
    id: "groq",
    label: "Groq",
    helper: "Fallback rất nhanh khi cần tạo JSON.",
    placeholder: "gsk_...",
    icon: Zap,
  },
];

export default function SettingsForm({ maskedKeys, preferredAi }: SettingsFormProps) {
  const router = useRouter();
  const [visibleKeys, setVisibleKeys] = useState<Record<Provider, boolean>>({
    gemini: false,
    openai: false,
    groq: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setIsSaving(true);
    setStatus(null);

    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          geminiApiKey: String(formData.get("geminiApiKey") ?? "").trim(),
          openaiApiKey: String(formData.get("openaiApiKey") ?? "").trim(),
          groqApiKey: String(formData.get("groqApiKey") ?? "").trim(),
          preferredAi: String(formData.get("preferredAi") ?? "gemini"),
        }),
      });
      const payload = await response.json() as { success?: boolean; message?: string };
      if (!response.ok || !payload.success) throw new Error(payload.message || "Không thể lưu cài đặt AI.");
      form.reset();
      setVisibleKeys({ gemini: false, openai: false, groq: false });
      setStatus({ type: "success", message: "Đã lưu cài đặt Multi-AI. App sẽ tự fallback khi provider ưu tiên gặp lỗi." });
      router.refresh();
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "Không thể lưu cài đặt AI." });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-white bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-teal-700"><KeyRound size={21} /></div>
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">API Keys & Fallback</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">Bạn có thể nhập một hoặc nhiều khóa. Ô để trống sẽ giữ nguyên khóa đang có.</p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {providers.map((provider) => {
          const Icon = provider.icon;
          return (
            <div key={provider.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-teal-700 shadow-sm"><Icon size={19} /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">{provider.label}</h3>
                      <p className="mt-0.5 text-xs text-slate-500">{provider.helper}</p>
                    </div>
                    {maskedKeys[provider.id] && <code className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-extrabold text-emerald-800">{maskedKeys[provider.id]}</code>}
                  </div>
                  <label className="mt-3 block">
                    <span className="sr-only">Nhập {provider.label} API Key</span>
                    <span className="relative block">
                      <input
                        name={`${provider.id}ApiKey`}
                        type={visibleKeys[provider.id] ? "text" : "password"}
                        minLength={provider.id === "groq" ? 10 : 20}
                        maxLength={512}
                        autoComplete="off"
                        spellCheck={false}
                        placeholder={maskedKeys[provider.id] ? "Để trống nếu muốn giữ khóa hiện tại" : provider.placeholder}
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 pr-12 font-mono text-sm text-slate-800 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                      />
                      <button
                        type="button"
                        onClick={() => setVisibleKeys((current) => ({ ...current, [provider.id]: !current[provider.id] }))}
                        aria-label={visibleKeys[provider.id] ? `Ẩn ${provider.label} API key` : `Hiện ${provider.label} API key`}
                        className="absolute top-1/2 right-3 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      >
                        {visibleKeys[provider.id] ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </span>
                  </label>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <fieldset className="mt-5">
        <legend className="mb-2 text-sm font-bold text-slate-700">Provider ưu tiên</legend>
        <div className="grid grid-cols-3 gap-2">
          {providers.map((provider) => (
            <label key={provider.id} className="cursor-pointer">
              <input
                type="radio"
                name="preferredAi"
                value={provider.id}
                defaultChecked={(preferredAi || "gemini") === provider.id}
                className="peer sr-only"
              />
              <span className="flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-2 text-center text-xs font-extrabold text-slate-600 transition peer-checked:border-teal-500 peer-checked:bg-teal-50 peer-checked:text-teal-800">
                {provider.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <button type="submit" disabled={isSaving} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 text-sm font-extrabold text-white transition hover:bg-teal-500 disabled:cursor-wait disabled:opacity-60">
        {isSaving ? <LoaderCircle className="animate-spin" size={18} /> : <Save size={18} />} {isSaving ? "Đang lưu..." : "Lưu cài đặt AI"}
      </button>
      {status && <p role="status" className={`mt-3 flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold ${status.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>{status.type === "success" && <CheckCircle2 size={16} />}{status.message}</p>}
    </form>
  );
}
