import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const rideId = searchParams.get("rideId");

    if (!rideId) {
      return NextResponse.json(
        { error: "Ride ID is required" },
        { status: 400 }
      );
    }

    // Find the booking for this user and ride
    const booking = await prisma.booking.findFirst({
      where: {
        rideId,
        userId: user.id,
        // Optionally filter by status if you only want to consider certain statuses
        // status: { in: ["pending", "approved"] }
      },
    });

    return NextResponse.json({ booking });
  } catch (error) {
    console.error("[BOOKING_CHECK]", error);
    return NextResponse.json(
      { error: "Failed to check booking" },
      { status: 500 }
    );
  }
}
