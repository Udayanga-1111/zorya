import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/services/auth.service";
import { getUserById } from "@/lib/services/user.service";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

/**
 * Default Sri Lankan user profile used as a fallback until the full
 * user onboarding data is stored in the database.
 */
const DEFAULT_PROFILE = {
  birth_date: "2000-01-01",
  birth_time: "06:00",
  lat: 7.2906,
  lon: 80.6337,
  goal: "I want to focus on personal growth and build positive daily habits.",
};

export default async function DashboardPage() {
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

  // Merge stored user profile with defaults for fields not yet in the DB
  const userProfile = {
    ...DEFAULT_PROFILE,
    user_id: user.id,
  };

  return (
    <DashboardClient
      userName={firstName}
      userProfile={userProfile}
    />
  );
}
