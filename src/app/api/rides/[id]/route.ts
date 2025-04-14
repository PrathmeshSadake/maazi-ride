import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const rideId = params.id;

    // Fetch the ride details
    const ride = await prisma.ride.findUnique({
      where: {
        id: rideId,
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
        approvedById: true,
        approvedAt: true,
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            driverRating: true,
            ridesCompleted: true,
            isVerified: true,
          },
        },
        bookings: {
          select: {
            id: true,
            status: true,
            numSeats: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!ride) {
      return NextResponse.json({ message: "Ride not found" }, { status: 404 });
    }

    // Check if the user has permission to view this ride
    // If the user is the driver or has a booking on this ride
    const isDriver = ride.driver.id === userId;

    const isPassenger = ride.bookings.some(
      (booking) => booking.user.id === userId
    );

    const isAdmin = await prisma.user
      .findUnique({
        where: { id: userId },
        select: { role: true },
      })
      .then((user) => user?.role === "admin");

    if (!isDriver && !isPassenger && !isAdmin) {
      return NextResponse.json(
        { message: "You don't have permission to view this ride" },
        { status: 403 }
      );
    }

    return NextResponse.json(ride);
  } catch (error) {
    console.error("Error fetching ride:", error);
    return NextResponse.json(
      { message: "Error fetching ride details" },
      { status: 500 }
    );
  }
}

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
      },
    });

    if (!ride) {
      return NextResponse.json({ message: "Ride not found" }, { status: 404 });
    }

    // Only the driver can update their own ride
    if (ride.driverId !== userId) {
      return NextResponse.json(
        { message: "You don't have permission to update this ride" },
        { status: 403 }
      );
    }

    // Parse the update data from the request
    const updateData = await req.json();

    // Update the ride
    const updatedRide = await prisma.ride.update({
      where: {
        id: rideId,
      },
      data: updateData,
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

    return NextResponse.json(updatedRide);
  } catch (error) {
    console.error("Error updating ride:", error);
    return NextResponse.json(
      { message: "Error updating ride" },
      { status: 500 }
    );
  }
}
