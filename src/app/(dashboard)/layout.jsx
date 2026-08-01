import { cookies } from "next/headers";
import { verifyToken } from "@/lib/services/auth.service";
import { getUserById } from "@/lib/services/user.service";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { StreamProvider } from "@/components/providers/stream-provider";

export default async function DashboardLayout({ children }) {
  // Fetch the user once here so all child pages share the same stream context
  let userProfile = null;
  let isOnboarded = false;
  let fullUser = null;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (token) {
      const decoded = verifyToken(token);
      if (decoded?.userId) {
        const user = await getUserById(decoded.userId);
        if (user) {
          fullUser = user;
          isOnboarded = user.onboarded ?? false;
          if (user.onboarded && user.latitude) {
            userProfile = {
              birth_date: new Date(user.birth_date).toISOString().split("T")[0],
              birth_time: user.birth_time,
              lat: user.latitude,
              lon: user.longitude,
              goal: "I want to focus on personal growth and build positive daily habits.",
              user_id: user.id,
            };
          }
        }
      }
    }
  } catch {
    // silently fall back — individual pages handle the unauthenticated case
  }

  return (
    <StreamProvider userProfile={userProfile} isOnboarded={isOnboarded} user={fullUser}>
      <div className="h-screen flex flex-col font-sans overflow-hidden">
        <DashboardHeader user={fullUser} />
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar: hidden on mobile, visible from md breakpoint */}
          <DashboardSidebar user={fullUser} />
          <main className="flex-1 overflow-y-auto bg-background" data-lenis-prevent="true">
            {children}
          </main>
        </div>
      </div>
    </StreamProvider>
  );
}
