import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/services/auth.service";
import { getUserById } from "@/lib/services/user.service";

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded?.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const user = await getUserById(decoded.userId);
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Construct the export payload
    const exportData = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
        telemetry: {
          birth_date: user.birth_date,
          birth_time: user.birth_time,
          birth_city: user.birth_city,
          latitude: user.latitude,
          longitude: user.longitude,
          is_approximate_time: user.is_approximate_time
        }
      },
      export_timestamp: new Date().toISOString()
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="zorya_export_${user.id}.json"`
      }
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
