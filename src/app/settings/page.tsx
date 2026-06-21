import { ArrowLeft, KeyRound, ShieldCheck } from "lucide-react";
import Link from "next/link";
import SettingsForm from "@/components/SettingsForm";
import { getDemoUser } from "@/lib/demoUser";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getDemoUser();
  const returnPath = user.hasCompletedOnboarding && user.targetWeight !== null ? "/dashboard" : "/onboarding";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#ccfbf1_0,_#f8fafc_42%)] px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-xl">
        <Link href={returnPath} className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-bold text-slate-600 shadow-sm transition hover:text-teal-700"><ArrowLeft size={17} /> Quay lại</Link>
        <header className="py-8">
          <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/20"><KeyRound size={24} /></div>
          <p className="mt-5 text-xs font-extrabold tracking-[0.18em] text-teal-700 uppercase">Cài đặt AI</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Kết nối Google Gemini</h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600">Cập nhật khóa dùng riêng cho tài khoản của bạn. Giá trị đầy đủ không bao giờ được hiển thị lại trên giao diện.</p>
        </header>
        <SettingsForm maskedKey={maskApiKey(user.geminiApiKey)} />
        <div className="mt-4 flex items-start gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800"><ShieldCheck size={17} className="mt-0.5 shrink-0" /><p>Khóa hiện được lưu trong database để đáp ứng cấu hình tài khoản. Hãy giới hạn quota và API restrictions trong Google AI Studio.</p></div>
      </div>
    </main>
  );
}

function maskApiKey(apiKey: string | null): string | null {
  if (!apiKey) return null;
  if (apiKey.length <= 10) return `${apiKey.slice(0, 3)}••••`;
  return `${apiKey.slice(0, 6)}••••••••${apiKey.slice(-4)}`;
}
