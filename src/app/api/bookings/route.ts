import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { auth } from "@/auth";

// Schema for creating a booking
const createBookingSchema = z.object({
  rideId: z.string(),
  numSeats: z.number().int().positive(),
});

// Schema for updating a booking status
const updateBookingSchema = z.object({
  status: z.enum(["CONFIRMED", "REJECTED", "CANCELLED"]),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user;

    if (!session || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { rideId, numSeats } = createBookingSchema.parse(body);

    // Get the ride details
    const ride = await prisma.ride.findUnique({
      where: { id: rideId },
      include: {
        bookings: {
          where: {
            userId: user.id,
          },
        },
      },
    });

    if (!ride) {
      return NextResponse.json({ message: "Ride not found" }, { status: 404 });
    }

    // Check if the ride is scheduled
    // if (!ride.isScheduled) {
    //   return NextResponse.json(
    //     { message: "This ride is not available for booking" },
    //     { status: 400 }
    //   );
    // }

    // Check if user is trying to book their own ride
    if (ride.driverId === user.id) {
      return NextResponse.json(
        { message: "You cannot book your own ride" },
        { status: 400 }
      );
    }

    // Check if user already has a booking for this ride
    if (ride.bookings.length > 0) {
      return NextResponse.json(
        { message: "You already have a booking request for this ride" },
        { status: 400 }
      );
    }

    // Check if there are enough seats available
    if (ride.availableSeats < numSeats) {
      return NextResponse.json(
        { message: "Not enough seats available" },
        { status: 400 }
      );
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        rideId,
        userId: user.id,
        status: "PENDING_APPROVAL",
        numSeats,
      },
    });

    // Create a notification for the driver
    await prisma.notification.create({
      data: {
        userId: ride.driverId,
        type: "booking_request",
        title: "New Booking Request",
        message: `You have a new booking request for your ride from ${ride.fromLocation} to ${ride.toLocation}`,
        relatedId: booking.id,
      },
    });

    // Format date for consistent client-side handling
    const formattedBooking = {
      ...booking,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    };

    return NextResponse.json(formattedBooking, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid data", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Failed to create booking" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");

    // Check if the user is a driver or a user
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    let bookings;

    if (dbUser.role === "driver") {
      // Drivers get booking requests for their rides
      bookings = await prisma.booking.findMany({
        where: {
          ride: {
            driverId: user.id,
          },
          ...(status ? { status: status.toUpperCase() as any } : {}),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          ride: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      // Regular users get their own bookings
      bookings = await prisma.booking.findMany({
        where: {
          userId: user.id,
          ...(status ? { status: status.toUpperCase() as any } : {}),
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
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    // Format dates for consistent client-side handling
    const formattedBookings = bookings.map((booking) => ({
      ...booking,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
      ride: {
        ...booking.ride,
        departureDate: booking.ride.departureDate.toISOString(),
        createdAt: booking.ride.createdAt.toISOString(),
        updatedAt: booking.ride.updatedAt.toISOString(),
      },
    }));

    return NextResponse.json(formattedBookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { message: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

// PATCH endpoint to update booking status
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { status } = updateBookingSchema.parse(body);
    const bookingId = req.nextUrl.searchParams.get("id");

    if (!bookingId) {
      return NextResponse.json(
        { message: "Booking ID is required" },
        { status: 400 }
      );
    }

    // Get the booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        ride: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 }
      );
    }

    // Check if user is the driver of the ride
    if (booking.ride.driverId !== user.id) {
      return NextResponse.json(
        { message: "You are not authorized to update this booking" },
        { status: 403 }
      );
    }

    // If confirming, check available seats
    if (status === "CONFIRMED") {
      // Check if the booking is in PENDING_APPROVAL status
      if (booking.status !== "PENDING_APPROVAL") {
        return NextResponse.json(
          {
            message:
              "Only booking requests in PENDING_APPROVAL status can be confirmed",
          },
          { status: 400 }
        );
      }

      if (booking.ride.availableSeats < booking.numSeats) {
        return NextResponse.json(
          { message: "Not enough seats available" },
          { status: 400 }
        );
      }

      // Update the ride's available seats
      await prisma.ride.update({
        where: { id: booking.ride.id },
        data: {
          availableSeats: booking.ride.availableSeats - booking.numSeats,
        },
      });
    }

    // If the booking was already confirmed and now rejected/cancelled,
    // we need to add the seats back
    if (
      booking.status === "CONFIRMED" &&
      (status === "REJECTED" || status === "CANCELLED")
    ) {
      await prisma.ride.update({
        where: { id: booking.ride.id },
        data: {
          availableSeats: booking.ride.availableSeats + booking.numSeats,
        },
      });
    }

    // Update the booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
      include: {
        ride: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Create a notification for the user
    await prisma.notification.create({
      data: {
        userId: booking.userId,
        type: "booking_status",
        title: `Booking ${status.toLowerCase()}`,
        message: `Your booking request for the ride from ${
          booking.ride.fromLocation
        } to ${booking.ride.toLocation} has been ${status.toLowerCase()}`,
        relatedId: booking.id,
      },
    });

    // Format dates for consistent client-side handling
    const formattedBooking = {
      ...updatedBooking,
      createdAt: updatedBooking.createdAt.toISOString(),
      updatedAt: updatedBooking.updatedAt.toISOString(),
      ride: {
        ...updatedBooking.ride,
        departureDate: updatedBooking.ride.departureDate.toISOString(),
        createdAt: updatedBooking.ride.createdAt.toISOString(),
        updatedAt: updatedBooking.ride.updatedAt.toISOString(),
      },
    };

    return NextResponse.json(formattedBooking);
  } catch (error) {
    console.error("Error updating booking:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid data", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Failed to update booking" },
      { status: 500 }
    );
  }
}
