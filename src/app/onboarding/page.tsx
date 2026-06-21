import { ArrowRight, BrainCircuit, ShieldCheck, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import OnboardingForm from "@/components/OnboardingForm";
import { getDemoUser } from "@/lib/demoUser";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const user = await getDemoUser();
  if (user.hasCompletedOnboarding) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#ccfbf1_0,_#f8fafc_42%)] px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-xl">
        <header className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/20"><Sparkles size={26} /></div>
          <p className="mt-5 text-xs font-extrabold tracking-[0.2em] text-teal-700 uppercase">Ted Fit Coach</p>
          <h1 className="mt-2 text-3xl leading-tight font-black tracking-tight text-slate-950 sm:text-4xl">Một kế hoạch thực sự dành cho bạn</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600">Cho AI vài chỉ số cơ bản. Bạn sẽ nhận mục tiêu active calories hợp lý và lịch tập 7 ngày có ngày phục hồi.</p>
        </header>

        <div className="mb-6 grid grid-cols-3 gap-2">
          <Benefit icon={BrainCircuit} label="AI cá nhân hóa" />
          <Benefit icon={ShieldCheck} label="Ngưỡng an toàn" />
          <Benefit icon={ArrowRight} label="Lịch 7 ngày" />
        </div>

        <OnboardingForm />
        <p className="mt-5 text-center text-xs leading-relaxed text-slate-400">Kế hoạch chỉ nhằm hỗ trợ luyện tập, không thay thế tư vấn y khoa.</p>
      </div>
    </main>
  );
}

function Benefit({ icon: Icon, label }: { icon: typeof BrainCircuit; label: string }) {
  return <div className="flex min-h-20 flex-col items-center justify-center rounded-2xl border border-white bg-white/75 px-2 text-center shadow-sm backdrop-blur"><Icon size={19} className="text-teal-600" /><span className="mt-2 text-[11px] font-extrabold text-slate-700 sm:text-xs">{label}</span></div>;
}
