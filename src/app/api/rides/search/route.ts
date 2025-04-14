import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Authentication is optional for public ride search
    const { userId } = await auth();

    // Get query parameters
    const url = new URL(req.url);
    const fromLat = url.searchParams.get("fromLat");
    const fromLng = url.searchParams.get("fromLng");
    const toLat = url.searchParams.get("toLat");
    const toLng = url.searchParams.get("toLng");
    const dateParam = url.searchParams.get("date");

    // Build where clause
    let where: any = {
      // Only show approved rides
      // status: "APPROVED",
      // Only show rides with available seats
      availableSeats: { gt: 0 },
    };

    // Filter by date if provided
    if (dateParam) {
      // Parse the date and create a date range for that day
      const date = new Date(dateParam);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      where.departureDate = {
        gte: date,
        lt: nextDay,
      };
    }

    // Filter by location coordinates if provided
    // Note: This is a simplified approach - in a real app you might want to use
    // a more sophisticated proximity search or a geospatial database
    if (fromLat && fromLng) {
      // We're doing simple Haversine formula distance calculation directly in our query
      // For a more accurate or efficient solution, consider PostGIS or similar
      const fromLatNum = parseFloat(fromLat);
      const fromLngNum = parseFloat(fromLng);

      // Allow some tolerance for matching from location (approx 3-5 km)
      const latTolerance = 0.03; // roughly 3km
      const lngTolerance = 0.03;

      where.fromLat = {
        gte: fromLatNum - latTolerance,
        lte: fromLatNum + latTolerance,
      };

      where.fromLng = {
        gte: fromLngNum - lngTolerance,
        lte: fromLngNum + lngTolerance,
      };
    }

    if (toLat && toLng) {
      const toLatNum = parseFloat(toLat);
      const toLngNum = parseFloat(toLng);

      // Allow some tolerance for matching to location (approx 3-5 km)
      const latTolerance = 0.03;
      const lngTolerance = 0.03;

      where.toLat = {
        gte: toLatNum - latTolerance,
        lte: toLatNum + latTolerance,
      };

      where.toLng = {
        gte: toLngNum - lngTolerance,
        lte: toLngNum + lngTolerance,
      };
    }

    // Fetch rides
    const rides = await prisma.ride.findMany({
      where,
      orderBy: [{ departureDate: "asc" }, { departureTime: "asc" }],
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
        description: true,
        driver: {
          select: {
            firstName: true,
            lastName: true,
            driverRating: true,
            ridesCompleted: true,
          },
        },
        // Count bookings to calculate real available seats
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

    // Calculate real available seats and format response
    const ridesWithAvailableSeats = rides
      .map((ride) => {
        // Calculate total booked seats
        const bookedSeats = ride.bookings.reduce((total, booking) => {
          return total + booking.numSeats;
        }, 0);

        // Calculate real available seats
        const realAvailableSeats = ride.availableSeats - bookedSeats;

        // Only include rides with available seats
        if (realAvailableSeats <= 0) return null;

        // Format the response without bookings data
        const { bookings, ...rideData } = ride;

        return {
          ...rideData,
          availableSeats: realAvailableSeats,
        };
      })
      .filter(Boolean);

    return NextResponse.json(ridesWithAvailableSeats);
  } catch (error) {
    console.error("Error searching rides:", error);
    return NextResponse.json(
      { message: "Error searching rides" },
      { status: 500 }
    );
  }
}
