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

  // userProfile and isOnboarded are now provided via StreamProvider in layout.jsx
  return <DashboardClient userName={firstName} />;
}
