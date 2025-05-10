import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const rideId = (await params).id;

    if (!rideId) {
      return NextResponse.json(
        { message: "Ride ID is required" },
        { status: 400 }
      );
    }

    // Check if the user is a driver or a regular user
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Find the ride with appropriate data based on user role
    const ride = await prisma.ride.findUnique({
      where: { id: rideId },
      include: {
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            driverRating: true,
            ridesCompleted: true,
            vehicle: true,
          },
        },
        bookings:
          dbUser.role === "driver"
            ? {
                include: {
                  user: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              }
            : {
                where: {
                  userId: user.id,
                },
                select: {
                  id: true,
                  status: true,
                  numSeats: true,
                  createdAt: true,
                },
              },
      },
    });

    if (!ride) {
      return NextResponse.json({ message: "Ride not found" }, { status: 404 });
    }

    // If the user is neither the driver nor has a booking, and the ride is not scheduled
    if (
      dbUser.role !== "driver" &&
      ride.driverId !== user.id &&
      ride.bookings.length === 0 &&
      !ride.isScheduled
    ) {
      return NextResponse.json(
        { message: "You don't have access to this ride" },
        { status: 403 }
      );
    }

    // Format dates to ISO strings for consistent client-side handling
    const formattedRide = {
      ...ride,
      departureDate: ride.departureDate.toISOString(),
      bookings: ride.bookings.map((booking: any) => ({
        ...booking,
        createdAt: booking.createdAt ? booking.createdAt.toISOString() : null,
      })),
    };

    return NextResponse.json(formattedRide);
  } catch (error) {
    console.error("Error fetching ride details:", error);
    return NextResponse.json(
      { message: "Failed to fetch ride details" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const rideId = (await params).id;

    // Fetch the ride to check permissions
    const ride = await prisma.ride.findUnique({
      where: {
        id: rideId,
      },
      select: {
        id: true,
        driverId: true,
        departureDate: true,
      },
    });

    if (!ride) {
      return NextResponse.json({ message: "Ride not found" }, { status: 404 });
    }

    // Only the driver can update their own ride
    if (ride.driverId !== userId) {
      return NextResponse.json({
        message: "You don't have permission to update this ride",
      });
    }

    // Parse the update data from the request
    const updateData = await req.json();

    // Format date if provided
    if (
      updateData.departureDate &&
      typeof updateData.departureDate === "string"
    ) {
      updateData.departureDate = new Date(updateData.departureDate);
    }

    // Update the ride
    const updatedRide = await prisma.ride.update({
      where: {
        id: rideId,
      },
      data: updateData,
      include: {
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            driverRating: true,
            vehicle: true,
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

    // Format the date for consistent client-side handling
    const formattedRide = {
      ...updatedRide,
      departureDate: updatedRide.departureDate.toISOString(),
      createdAt: updatedRide.createdAt.toISOString(),
    };

    return NextResponse.json(formattedRide);
  } catch (error) {
    console.error("Error updating ride:", error);
    return NextResponse.json(
      { message: "Error updating ride" },
      { status: 500 }
    );
  }
}
