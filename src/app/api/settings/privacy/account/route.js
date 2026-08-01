import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/services/auth.service";
import prisma from "@/lib/db/prisma";

export async function DELETE(request) {
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

    if (decoded.userId === "hardcoded-admin") {
      return NextResponse.json({ message: "Cannot delete hardcoded admin user" }, { status: 400 });
    }

    // Delete the user and cascade messages based on prisma schema
    await prisma.user.delete({
      where: { id: decoded.userId }
    });

    // Clear the auth cookie to force logout
    cookieStore.delete("token");

    return NextResponse.json({ success: true, message: "Account erased per PDPA requirements." });
  } catch (error) {
    console.error("Account erasure error:", error);
    return NextResponse.json({ error: "Failed to erase account" }, { status: 500 });
  }
}
