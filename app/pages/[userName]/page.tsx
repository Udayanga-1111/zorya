import { GreetingBanner } from "@/components/dashboard/greeting-banner";
import { ZoryaNote } from "@/components/dashboard/zorya-note";
import { PlanetaryInfluences } from "@/components/dashboard/planetary-influences";
import { DailyPlan } from "@/components/dashboard/daily-plan";
import { ProfileButton } from "@/components/dashboard/profile-button";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/services/auth.service";
import { getUserById } from "@/lib/services/user.service";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ userName: string }>;
}) {
  const { userName } = await params;
  const decodedUserName = decodeURIComponent(userName);

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/pages/login");
  }

  const decoded = verifyToken(token);
  if (!decoded || !decoded.userId) {
    redirect("/pages/login");
  }

  const user = await getUserById(decoded.userId);
  if (!user || user.name !== decodedUserName) {
    redirect("/pages/login");
  }

  return (
    <div
      className="min-h-full px-8 py-10 relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 80% 0%, oklch(from var(--primary) l c h / 0.06) 0%, transparent 55%), radial-gradient(ellipse at 0% 100%, oklch(0.7 0.15 300 / 0.05) 0%, transparent 50%)",
      }}
    >
      {/* Header with profile button */}
      <div className="absolute top-6 right-8 z-20">
        <ProfileButton userName={userName} />
      </div>

      {/* Ambient decorative stars */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <span className="absolute top-8 right-24 text-primary/20 text-xs animate-twinkle">✦</span>
        <span className="absolute top-20 right-56 text-primary/15 text-[10px] animate-twinkle-delay">✧</span>
        <span className="absolute top-48 right-12 text-primary/10 text-xs animate-twinkle">✦</span>
        <span className="absolute top-6 left-1/2 text-primary/10 text-[8px] animate-twinkle-delay">✧</span>
        <span className="absolute top-36 left-1/3 text-primary/15 text-xs animate-twinkle">✦</span>
      </div>

      <div className="relative mx-auto max-w-4xl">
        <GreetingBanner userName={userName} />
        <ZoryaNote />
        <PlanetaryInfluences />
        <DailyPlan />

        {/* Bottom celestial flourish */}
        <div className="mt-8 text-center text-muted-foreground/30 tracking-[0.3em] text-xs select-none">
          ✦ &nbsp;&nbsp; ✧ &nbsp;&nbsp; ✦
        </div>
      </div>
    </div>
  );
}
