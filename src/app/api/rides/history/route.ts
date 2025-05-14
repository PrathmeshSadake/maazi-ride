import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;

    // Get rides where the user is a passenger
    const bookings = await prisma.booking.findMany({
      where: {
        userId: userId,
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

    // Extract and format rides from bookings
    const passengerRides = bookings.map((booking) => ({
      id: booking.ride.id,
      fromLocation: booking.ride.fromLocation,
      toLocation: booking.ride.toLocation,
      fromLatitude: booking.ride.fromLatitude,
      fromLongitude: booking.ride.fromLongitude,
      toLatitude: booking.ride.toLatitude,
      toLongitude: booking.ride.toLongitude,
      departureDate: booking.ride.departureDate,
      departureTime: booking.ride.departureTime,
      price: booking.ride.price,
      status: booking.ride.status,
      driver: booking.ride.driver,
      booking: {
        id: booking.id,
        status: booking.status,
        numSeats: booking.numSeats,
      },
      role: "passenger",
    }));

    // Get rides where the user is the driver
    const driverRides = await prisma.ride.findMany({
      where: {
        driverId: userId,
      },
      include: {
        bookings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Format driver rides
    const formattedDriverRides = driverRides.map((ride) => ({
      id: ride.id,
      fromLocation: ride.fromLocation,
      toLocation: ride.toLocation,
      fromLatitude: ride.fromLatitude,
      fromLongitude: ride.fromLongitude,
      toLatitude: ride.toLatitude,
      toLongitude: ride.toLongitude,
      departureDate: ride.departureDate,
      departureTime: ride.departureTime,
      price: ride.price,
      status: ride.status,
      passengers: ride.bookings.map((booking) => ({
        id: booking.user.id,
        name: booking.user.name,
        bookingId: booking.id,
        status: booking.status,
        numSeats: booking.numSeats,
      })),
      role: "driver",
    }));

    // Combine both types of rides and sort by departure date (newest first)
    const allRides = [...passengerRides, ...formattedDriverRides].sort(
      (a, b) =>
        new Date(b.departureDate).getTime() -
        new Date(a.departureDate).getTime()
    );

    return NextResponse.json(allRides);
  } catch (error) {
    console.error("Error fetching ride history:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
