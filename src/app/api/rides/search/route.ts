import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();

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

      if (!fromLocation.name || !toLocation.name) {
        throw new Error("Location name is missing");
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
        // Using UTC methods to avoid timezone issues
        const startOfDay = new Date(
          Date.UTC(
            searchDate.getUTCFullYear(),
            searchDate.getUTCMonth(),
            searchDate.getUTCDate(),
            0,
            0,
            0,
            0
          )
        );

        const endOfDay = new Date(
          Date.UTC(
            searchDate.getUTCFullYear(),
            searchDate.getUTCMonth(),
            searchDate.getUTCDate(),
            23,
            59,
            59,
            999
          )
        );

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

    // Prepare the where clause for the query
    const whereClause = {
      fromLocation: fromLocation.name,
      toLocation: toLocation.name,
      ...dateFilter,
      availableSeats: {
        gt: 0,
      },
      isScheduled: true,
    };

    console.log(
      "DEBUG - Query where clause:",
      JSON.stringify(whereClause, null, 2)
    );

    // Fetch matching rides
    const rides = await prisma.ride.findMany({
      where: whereClause,
      include: {
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
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
