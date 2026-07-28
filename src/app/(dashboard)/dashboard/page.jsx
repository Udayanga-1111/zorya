import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/services/auth.service";
import { getUserById } from "@/lib/services/user.service";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

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

  let userProfile = null;
  if (user.onboarded && user.latitude) {
    userProfile = {
      birth_date: new Date(user.birth_date).toISOString().split("T")[0],
      birth_time: user.birth_time,
      lat: user.latitude,
      lon: user.longitude,
      goal: "I want to focus on personal growth and build positive daily habits.", // default goal for now
      user_id: user.id,
    };
  }

  return (
    <DashboardClient
      userName={firstName}
      userProfile={userProfile}
      isOnboarded={user.onboarded}
    />
  );
}
