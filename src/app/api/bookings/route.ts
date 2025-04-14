import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const { rideId, numSeats } = await req.json();

    if (!rideId) {
      return NextResponse.json(
        { message: "Ride ID is required" },
        { status: 400 }
      );
    }

    // Validate number of seats
    const seats = numSeats || 1;
    if (seats < 1) {
      return NextResponse.json(
        { message: "Number of seats must be at least 1" },
        { status: 400 }
      );
    }

    // Check if ride exists and is available
    const ride = await prisma.ride.findUnique({
      where: {
        id: rideId,
        status: "APPROVED", // Only allow booking approved rides
      },
      include: {
        bookings: {
          where: {
            status: { in: ["PENDING", "CONFIRMED"] },
          },
          select: {
            numSeats: true,
          },
        },
      },
    });

    if (!ride) {
      return NextResponse.json(
        { message: "Ride not found or not available" },
        { status: 404 }
      );
    }

    // Calculate available seats
    const bookedSeats = ride.bookings.reduce((total, booking) => {
      return total + booking.numSeats;
    }, 0);

    const availableSeats = ride.availableSeats - bookedSeats;

    if (seats > availableSeats) {
      return NextResponse.json(
        { message: `Only ${availableSeats} seats available` },
        { status: 400 }
      );
    }

    // Check if user already has a pending or confirmed booking
    const existingBooking = await prisma.booking.findFirst({
      where: {
        rideId,
        userId,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        { message: "You already have a booking for this ride" },
        { status: 400 }
      );
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        rideId,
        userId,
        numSeats: seats,
        status: "PENDING", // Default status
      },
    });

    // Create notification for the driver
    await prisma.notification.create({
      data: {
        userId: ride.driverId,
        type: "booking_request",
        title: "New Booking Request",
        message: `You have a new booking request for your ride from ${ride.fromLocation} to ${ride.toLocation}`,
        relatedId: booking.id,
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { message: "Error creating booking" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters
    const url = new URL(req.url);
    const status = url.searchParams.get("status");

    // Build query
    let where: any = {
      userId,
    };

    if (status) {
      where.status = status.toUpperCase();
    }

    // Fetch bookings
    const bookings = await prisma.booking.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        ride: {
          select: {
            id: true,
            fromLocation: true,
            toLocation: true,
            departureDate: true,
            departureTime: true,
            price: true,
            driver: {
              select: {
                firstName: true,
                lastName: true,
                driverRating: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { message: "Error fetching bookings" },
      { status: 500 }
    );
  }
}
