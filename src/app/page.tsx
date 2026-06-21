import { redirect } from "next/navigation";
import { getDemoUser } from "@/lib/demoUser";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getDemoUser();
  redirect(user.hasCompletedOnboarding ? "/dashboard" : "/onboarding");
}
