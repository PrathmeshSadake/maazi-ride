import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET /api/drivers - Get all drivers
export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const forMessaging = searchParams.get("forMessaging") === "true";

    // Get database user to check role
    const databaseUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    // For regular users - limit info and only return verified drivers if requesting for messaging
    if (databaseUser?.role !== "admin") {
      const query: any = {
        role: "driver",
      };

      // If requesting for messaging purposes, only return verified active drivers
      if (forMessaging) {
        query.verified = true;
        query.active = true;
      }

      const drivers = await prisma.user.findMany({
        where: query,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          // Only include vehicle info if not for messaging
          ...(forMessaging ? {} : { vehicle: true }),
        },
      });

      return NextResponse.json(drivers);
    }

    // For admin - return full driver information
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
