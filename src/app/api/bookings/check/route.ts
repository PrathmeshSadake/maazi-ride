import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const rideId = searchParams.get("rideId");

    if (!rideId) {
      return new NextResponse("Ride ID is required", { status: 400 });
    }

    // Check if user has an existing booking for this ride
    const booking = await prisma.booking.findFirst({
      where: {
        rideId: rideId,
        userId: session.user.id,
      },
      include: {
        ride: {
          include: {
            driver: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ booking });
  } catch (error) {
    console.error("Error checking booking:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
