import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Check if user is authenticated and is admin
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || user.role !== "admin") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Get count of each booking status
    const [pending, confirmed, completed, cancelled, rejected] =
      await Promise.all([
        prisma.booking.count({
          where: { status: "PENDING" },
        }),
        prisma.booking.count({
          where: { status: "CONFIRMED" },
        }),
        prisma.booking.count({
          where: { status: "COMPLETED" },
        }),
        prisma.booking.count({
          where: { status: "CANCELLED" },
        }),
        prisma.booking.count({
          where: { status: "REJECTED" },
        }),
      ]);

    return NextResponse.json({
      pending,
      confirmed,
      completed,
      cancelled,
      rejected,
    });
  } catch (error) {
    console.error("[BOOKING_STATUS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
