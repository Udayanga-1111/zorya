import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/services/auth.service";
import { getUserById } from "@/lib/services/user.service";
import Link from "next/link";
import { ChatClient } from "@/components/chat/chat-client";

export default async function ChatPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  const decoded = verifyToken(token);
  if (!decoded || !decoded.userId) {
    redirect("/login");
  }

  const user = await getUserById(decoded.userId);
  if (!user) {
    redirect("/login");
  }

  const decodedUserName = decodeURIComponent(user.name);
  const firstName = decodedUserName.split(" ")[0];

  return (
    <div className="flex flex-col h-full relative"
      style={{
        background:
          "radial-gradient(ellipse at 80% 0%, oklch(from var(--primary) l c h / 0.06) 0%, transparent 55%), radial-gradient(ellipse at 0% 100%, oklch(0.7 0.15 300 / 0.05) 0%, transparent 50%)",
      }}
    >
      {!user.onboarded && (
        <div className="bg-primary/10 border-b border-primary/20 px-6 py-3 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-2 text-sm text-foreground">
            <span className="text-primary animate-pulse">✧</span>
            <span>Using default transit telemetry. Complete setup for personal accuracy.</span>
          </div>
          <Link
            href="/onboarding"
            className="text-xs font-medium text-primary hover:underline"
          >
            Complete Setup
          </Link>
        </div>
      )}

      <ChatClient firstName={firstName} userProfile={{
        birth_date: user.birth_date ? new Date(user.birth_date).toISOString().split("T")[0] : "",
        birth_time: user.birth_time,
        lat: user.latitude,
        lon: user.longitude,
        goal: "I want to focus on personal growth and build positive daily habits.", // default goal
        user_id: user.id,
      }} />
    </div>
  );
}
