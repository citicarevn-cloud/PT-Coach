import { ArrowRight, BrainCircuit, Settings, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import OnboardingForm from "@/components/OnboardingForm";
import { getDemoUser } from "@/lib/demoUser";

export const dynamic = "force-dynamic";

interface OnboardingPageProps {
  searchParams: Promise<{ edit?: string | string[] }>;
}

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const params = await searchParams;
  const isEditMode = params.edit === "true";
  const user = await getDemoUser();
  if (user.hasCompletedOnboarding && user.targetWeight !== null && !isEditMode) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#ccfbf1_0,_#f8fafc_42%)] px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-xl">
        <header className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/20"><Sparkles size={26} /></div>
          <p className="mt-5 text-xs font-extrabold tracking-[0.2em] text-teal-700 uppercase">Ted Fit Coach</p>
          <h1 className="mt-2 text-3xl leading-tight font-black tracking-tight text-slate-950 sm:text-4xl">{isEditMode ? "Cập nhật lộ trình của bạn" : "Một kế hoạch thực sự dành cho bạn"}</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600">{isEditMode ? "Điều chỉnh thông tin bên dưới để Gemini tạo lại roadmap, macro và chi tiết bài tập Hubert Cù." : "Cho AI vài chỉ số cơ bản. Bạn sẽ nhận mục tiêu active calories hợp lý và lịch tập có ngày phục hồi."}</p>
          <Link href="/settings" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-extrabold text-teal-700 shadow-sm"><Settings size={15} /> Cài đặt Gemini API Key</Link>
        </header>

        <div className="mb-6 grid grid-cols-3 gap-2">
          <Benefit icon={BrainCircuit} label="AI cá nhân hóa" />
          <Benefit icon={ShieldCheck} label="Ngưỡng an toàn" />
          <Benefit icon={ArrowRight} label="Lịch 7 ngày" />
        </div>

        <OnboardingForm initialValues={isEditMode ? {
          age: user.age,
          height: user.height,
          weight: user.weight,
          targetWeight: user.targetWeight,
          goal: user.goal,
        } : undefined} />
        <p className="mt-5 text-center text-xs leading-relaxed text-slate-400">Kế hoạch chỉ nhằm hỗ trợ luyện tập, không thay thế tư vấn y khoa.</p>
      </div>
    </main>
  );
}

function Benefit({ icon: Icon, label }: { icon: typeof BrainCircuit; label: string }) {
  return <div className="flex min-h-20 flex-col items-center justify-center rounded-2xl border border-white bg-white/75 px-2 text-center shadow-sm backdrop-blur"><Icon size={19} className="text-teal-600" /><span className="mt-2 text-[11px] font-extrabold text-slate-700 sm:text-xs">{label}</span></div>;
}
