import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user) {
      return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const resolvedParams = await params;
    const rideId = resolvedParams.id;

    const ride = await prisma.ride.findUnique({
      where: { id: rideId },
      include: { bookings: true },
    });

    if (!ride) {
      return new NextResponse(JSON.stringify({ message: "Ride not found" }), {
        status: 404,
      });
    }

    // Check if the user is the driver of this ride
    if (ride.driverId !== user.id) {
      return new NextResponse(
        JSON.stringify({
          message: "You are not authorized to cancel this ride",
        }),
        { status: 403 }
      );
    }

    // Update ride status to CANCELLED
    const updatedRide = await prisma.ride.update({
      where: {
        id: rideId,
      },
      data: { status: "CANCELLED" },
      include: {
        driver: {
          select: {
            name: true,
            driverRating: true,
          },
        },
        bookings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    // Cancel all pending bookings
    if (ride.bookings.length > 0) {
      await prisma.booking.updateMany({
        where: {
          rideId: rideId,
          status: { in: ["PENDING", "PENDING_APPROVAL", "CONFIRMED"] },
        },
        data: { status: "CANCELLED" },
      });
    }

    return NextResponse.json(updatedRide);
  } catch (error) {
    console.error("Error cancelling ride:", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
}
