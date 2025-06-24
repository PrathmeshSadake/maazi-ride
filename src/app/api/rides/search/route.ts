import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;

    // Parse search parameters
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");
    const dateParam = searchParams.get("date");

    console.log("DEBUG - Search parameters:", {
      fromParam,
      toParam,
      dateParam,
    });

    // Check required parameters
    if (!fromParam || !toParam) {
      return NextResponse.json(
        { message: "From and To locations are required" },
        { status: 400 }
      );
    }

    // Parse location data
    let fromLocation, toLocation;
    try {
      // Decode URI component first to handle URL encoding
      fromLocation = JSON.parse(decodeURIComponent(fromParam));
      toLocation = JSON.parse(decodeURIComponent(toParam));

      console.log("DEBUG - Decoded locations:", {
        fromLocation,
        toLocation,
      });

      // Validate that we have location coordinates
      if (!fromLocation.name || !toLocation.name) {
        throw new Error("Location name is missing");
      }

      // Check if we have coordinates available
      const hasCoordinates =
        fromLocation.lat !== undefined &&
        fromLocation.lng !== undefined &&
        toLocation.lat !== undefined &&
        toLocation.lng !== undefined;

      if (!hasCoordinates) {
        console.warn(
          "Location coordinates are missing, falling back to name-based search"
        );
      }
    } catch (error) {
      console.error("Error parsing location data:", error);
      return NextResponse.json(
        { message: "Invalid location format", error: String(error) },
        { status: 400 }
      );
    }

    // Prepare date filter
    let dateFilter = {};
    if (dateParam) {
      try {
        // The date parameter should already be an ISO string from the client
        console.log("DEBUG - Date parameter:", dateParam);

        // Parse the date, handling potential URL encoding
        const cleanDateParam = decodeURIComponent(dateParam);
        console.log("DEBUG - Decoded date:", cleanDateParam);

        const searchDate = new Date(cleanDateParam);

        // Validate date
        if (isNaN(searchDate.getTime())) {
          console.error("Invalid date value:", cleanDateParam);
          throw new Error(`Invalid date format: ${cleanDateParam}`);
        }

        // Set start of day and end of day for the search date
        // Using local time to match the user's timezone
        const startOfDay = new Date(searchDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(searchDate);
        endOfDay.setHours(23, 59, 59, 999);

        console.log("DEBUG - Valid date range:", {
          date: searchDate.toISOString(),
          startOfDay: startOfDay.toISOString(),
          endOfDay: endOfDay.toISOString(),
        });

        dateFilter = {
          departureDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
        };
      } catch (error) {
        console.error("Error parsing date:", error);
        // Instead of returning an error response, we'll default to future rides
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        dateFilter = {
          departureDate: {
            gte: today,
          },
        };
        console.log("Defaulting to future rides filter due to date error");
      }
    } else {
      // If no date specified, only show future rides
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      dateFilter = {
        departureDate: {
          gte: today,
        },
      };
      console.log("No date provided, showing future rides");
    }

    // Define a threshold for coordinate-based search (in degrees)
    // Approximately ~5-10km depending on latitude
    const COORD_THRESHOLD = 0.1; // Increasing threshold to make search more lenient

    // Build the where clause for the final query
    const whereClause = {
      availableSeats: {
        gt: 0,
      },
      isScheduled: true,
      ...dateFilter, // Always apply date filter
    };

    // Add location filters
    if (fromLocation.lat !== undefined && fromLocation.lng !== undefined) {
      whereClause.fromLatitude = {
        gte: fromLocation.lat - COORD_THRESHOLD,
        lte: fromLocation.lat + COORD_THRESHOLD,
      };
      whereClause.fromLongitude = {
        gte: fromLocation.lng - COORD_THRESHOLD,
        lte: fromLocation.lng + COORD_THRESHOLD,
      };
    } else {
      whereClause.fromLocation = fromLocation.name;
    }

    if (toLocation.lat !== undefined && toLocation.lng !== undefined) {
      whereClause.toLatitude = {
        gte: toLocation.lat - COORD_THRESHOLD,
        lte: toLocation.lat + COORD_THRESHOLD,
      };
      whereClause.toLongitude = {
        gte: toLocation.lng - COORD_THRESHOLD,
        lte: toLocation.lng + COORD_THRESHOLD,
      };
    } else {
      whereClause.toLocation = toLocation.name;
    }

    console.log(
      "DEBUG - Final query where clause:",
      JSON.stringify(whereClause, null, 2)
    );

    // Fetch matching rides with the complete where clause
    const rides = await prisma.ride.findMany({
      where: whereClause,
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            driverRating: true,
            ridesCompleted: true,
          },
        },
        bookings: {
          where: {
            userId: user.id,
          },
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: {
        departureDate: "asc",
      },
    });

    console.log(`DEBUG - Found ${rides.length} matching rides`);

    // Format rides for JSON response
    const formattedRides = rides.map((ride) => {
      // Log each ride's data for debugging
      console.log(`DEBUG - Processing ride ${ride.id}:`, {
        fromLocation: ride.fromLocation,
        toLocation: ride.toLocation,
        fromLatitude: ride.fromLatitude,
        fromLongitude: ride.fromLongitude,
        toLatitude: ride.toLatitude,
        toLongitude: ride.toLongitude,
        departureDate: ride.departureDate,
        departureTime: ride.departureTime,
        availableSeats: ride.availableSeats,
        bookings: ride.bookings.length,
      });

      return {
        ...ride,
        departureDate: ride.departureDate.toISOString(),
        // Add a flag to indicate if the user has already booked this ride
        hasBooking: ride.bookings.length > 0,
        // Don't send bookings array to the client
        bookings: undefined,
      };
    });

    console.log(`DEBUG - Returning ${formattedRides.length} formatted rides`);

    return NextResponse.json(formattedRides);
  } catch (error) {
    console.error("Error searching rides:", error);
    return NextResponse.json(
      { message: "Failed to search rides", error: String(error) },
      { status: 500 }
    );
  }
}
