import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    const { id } = params;

    // Fetch the ride details
    const ride = await prisma.ride.findUnique({
      where: { id },
      include: {
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            driverRating: true,
            ridesCompleted: true,
            // Don't include sensitive info
          },
        },
        bookings: {
          where: {
            status: { in: ["PENDING", "CONFIRMED"] },
          },
          select: {
            id: true,
            status: true,
            numSeats: true,
            userId: true,
          },
        },
      },
    });

    if (!ride) {
      return NextResponse.json({ message: "Ride not found" }, { status: 404 });
    }

    // Calculate real available seats by subtracting booked seats
    const bookedSeats = ride.bookings.reduce((total, booking) => {
      return total + booking.numSeats;
    }, 0);

    const realAvailableSeats = ride.availableSeats - bookedSeats;

    // Check if the current user has already booked this ride
    let userBooking = null;
    if (userId) {
      userBooking = ride.bookings.find((booking) => booking.userId === userId);
    }

    // Return formatted response without sensitive data
    const response = {
      id: ride.id,
      fromLocation: ride.fromLocation,
      toLocation: ride.toLocation,
      fromLat: ride.fromLat,
      fromLng: ride.fromLng,
      toLat: ride.toLat,
      toLng: ride.toLng,
      departureDate: ride.departureDate,
      departureTime: ride.departureTime,
      price: ride.price,
      availableSeats: realAvailableSeats,
      description: ride.description,
      status: ride.status,
      createdAt: ride.createdAt,
      driver: {
        id: ride.driver.id,
        firstName: ride.driver.firstName,
        lastName: ride.driver.lastName,
        driverRating: ride.driver.driverRating,
        ridesCompleted: ride.driver.ridesCompleted,
      },
      userHasBooked: userBooking !== null,
      userBookingId: userBooking?.id || null,
      userBookingStatus: userBooking?.status || null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching ride details:", error);
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
