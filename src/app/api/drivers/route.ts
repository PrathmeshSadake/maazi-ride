import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

// GET /api/drivers - Get all drivers
export async function GET() {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const databaseUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!databaseUser || databaseUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const drivers = await prisma.user.findMany({
      where: {
        role: "driver",
      },
      include: {
        vehicle: true,
      },
    });

    return NextResponse.json(drivers);
  } catch (error) {
    console.error("[DRIVERS_GET]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
