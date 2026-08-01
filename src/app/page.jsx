import { cookies } from "next/headers";
import { verifyToken } from "@/lib/services/auth.service";
import { LandingClient } from "@/components/landing-client";

export default async function LandingPage() {
  let isLoggedIn = false;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    
    if (token) {
      const decoded = verifyToken(token);
      if (decoded?.userId) {
        isLoggedIn = true;
      }
    }
  } catch (err) {
    // silently fail
  }

  return <LandingClient isLoggedIn={isLoggedIn} />;
}
