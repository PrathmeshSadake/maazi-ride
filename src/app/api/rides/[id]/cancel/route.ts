import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const rideId = params.id;

    // Fetch the ride to check permissions
    const ride = await prisma.ride.findUnique({
      where: {
        id: rideId,
      },
      select: {
        id: true,
        driverId: true,
        status: true,
        departureDate: true,
        bookings: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (!ride) {
      return NextResponse.json({ message: "Ride not found" }, { status: 404 });
    }

    // Only the driver can cancel their own ride
    if (ride.driverId !== userId) {
      return NextResponse.json(
        { message: "You don't have permission to cancel this ride" },
        { status: 403 }
      );
    }

    // Can't cancel a ride that's already completed or cancelled
    if (ride.status === "COMPLETED" || ride.status === "CANCELLED") {
      return NextResponse.json(
        {
          message: `Cannot cancel a ride that is already ${ride.status.toLowerCase()}`,
        },
        { status: 400 }
      );
    }

    // Update ride status to CANCELLED
    const updatedRide = await prisma.ride.update({
      where: {
        id: rideId,
      },
      data: {
        status: "CANCELLED",
      },
      select: {
        id: true,
        fromLocation: true,
        toLocation: true,
        fromLat: true,
        fromLng: true,
        toLat: true,
        toLng: true,
        departureDate: true,
        departureTime: true,
        price: true,
        availableSeats: true,
        status: true,
        description: true,
        createdAt: true,
        driver: {
          select: {
            firstName: true,
            lastName: true,
            driverRating: true,
          },
        },
        bookings: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    // Update all associated bookings to CANCELLED
    if (ride.bookings.length > 0) {
      await prisma.booking.updateMany({
        where: {
          rideId: rideId,
          status: {
            in: ["PENDING", "CONFIRMED"],
          },
        },
        data: {
          status: "CANCELLED",
        },
      });

      // Create notifications for users with bookings
      const bookingUsers = await prisma.booking.findMany({
        where: {
          rideId: rideId,
        },
        select: {
          userId: true,
        },
      });

      // Create a notification for each user with a booking
      for (const booking of bookingUsers) {
        await prisma.notification.create({
          data: {
            userId: booking.userId,
            type: "ride_cancelled",
            title: "Ride Cancelled",
            message: `Your ride from ${updatedRide.fromLocation} to ${updatedRide.toLocation} has been cancelled by the driver.`,
            relatedId: rideId,
          },
        });
      }
    }

    return NextResponse.json(updatedRide);
  } catch (error) {
    console.error("Error cancelling ride:", error);
    return NextResponse.json(
      { message: "Error cancelling ride" },
      { status: 500 }
    );
  }
}
