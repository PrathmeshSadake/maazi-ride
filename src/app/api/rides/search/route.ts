import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

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

    // Define a threshold for coordinate-based search (in degrees)
    // Approximately ~5-10km depending on latitude
    const COORD_THRESHOLD = 0.1; // Increasing threshold to make search more lenient

    // Prepare the where clause for the query
    // Use coordinates if available, otherwise fall back to location names
    const locationFilter: {
      fromLatitude?: { gte: number; lte: number };
      fromLongitude?: { gte: number; lte: number };
      fromLocation?: string;
      toLatitude?: { gte: number; lte: number };
      toLongitude?: { gte: number; lte: number };
      toLocation?: string;
    } = {};

    // Check if we have coordinates to use for search
    if (fromLocation.lat !== undefined && fromLocation.lng !== undefined) {
      locationFilter.fromLatitude = {
        gte: fromLocation.lat - COORD_THRESHOLD,
        lte: fromLocation.lat + COORD_THRESHOLD,
      };
      locationFilter.fromLongitude = {
        gte: fromLocation.lng - COORD_THRESHOLD,
        lte: fromLocation.lng + COORD_THRESHOLD,
      };
    } else {
      locationFilter.fromLocation = fromLocation.name;
    }

    if (toLocation.lat !== undefined && toLocation.lng !== undefined) {
      locationFilter.toLatitude = {
        gte: toLocation.lat - COORD_THRESHOLD,
        lte: toLocation.lat + COORD_THRESHOLD,
      };
      locationFilter.toLongitude = {
        gte: toLocation.lng - COORD_THRESHOLD,
        lte: toLocation.lng + COORD_THRESHOLD,
      };
    } else {
      locationFilter.toLocation = toLocation.name;
    }

    // First try to get some data to debug the issue
    console.log("DEBUG - All available rides in the system:");
    const allRides = await prisma.ride.findMany({
      where: {
        availableSeats: { gt: 0 },
        isScheduled: true,
      },
      take: 5, // Limit to 5 results for debugging
    });

    console.log(`Found ${allRides.length} total rides in the system`);
    if (allRides.length > 0) {
      console.log("Sample ride data:", {
        firstRide: {
          fromLocation: allRides[0].fromLocation,
          fromLatitude: allRides[0].fromLatitude,
          fromLongitude: allRides[0].fromLongitude,
          toLocation: allRides[0].toLocation,
          toLatitude: allRides[0].toLatitude,
          toLongitude: allRides[0].toLongitude,
        },
      });
    }

    // Build the where clause step by step to diagnose the issue
    const whereClauseBase = {
      availableSeats: {
        gt: 0,
      },
      isScheduled: true,
    };

    // Start with basic filter, then add more specific filters
    console.log(
      "DEBUG - Query where clause (basic):",
      JSON.stringify(whereClauseBase, null, 2)
    );

    // First try with just the date filter
    const whereClauseWithDate = {
      ...whereClauseBase,
      ...dateFilter,
    };

    console.log(
      "DEBUG - Query where clause (with date):",
      JSON.stringify(whereClauseWithDate, null, 2)
    );

    // Finally add location filter
    const whereClauseFull = {
      ...whereClauseWithDate,
      ...locationFilter,
    };

    console.log(
      "DEBUG - Query where clause (full):",
      JSON.stringify(whereClauseFull, null, 2)
    );

    // Fetch matching rides with the simplified where clause first
    console.log("Trying simplified query first...");
    const rides = await prisma.ride.findMany({
      // where: whereClauseBase, // Start with basic query that should return results
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

    console.log(
      `DEBUG - Returning ${formattedRides.length} formatted rides with basic query`
    );

    // If we got no results with the basic query, there's something more fundamentally wrong
    if (formattedRides.length === 0) {
      console.log(
        "No rides found with the basic query. Returning empty results."
      );
      return NextResponse.json([]);
    }

    // Now try with date filter
    console.log("Trying with date filter...");
    const ridesWithDate = await prisma.ride.findMany({
      where: whereClauseWithDate,
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

    console.log(`Found ${ridesWithDate.length} rides with date filter`);

    // If we got results with date, try name-based search first as a more reliable fallback
    if (ridesWithDate.length > 0) {
      // Create a name-based query (more likely to work than coordinates)
      const nameBasedQuery: any = {
        ...whereClauseWithDate,
        fromLocation: fromLocation.name,
        toLocation: toLocation.name,
      };

      console.log(
        "Trying with name-based query:",
        JSON.stringify(nameBasedQuery, null, 2)
      );

      try {
        const nameBasedResults = await prisma.ride.findMany({
          where: nameBasedQuery,
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

        console.log(
          `Found ${nameBasedResults.length} rides with name-based query`
        );

        if (nameBasedResults.length > 0) {
          // Name-based search worked, return these results
          const formattedNameResults = nameBasedResults.map((ride) => ({
            ...ride,
            departureDate: ride.departureDate.toISOString(),
            hasBooking: ride.bookings.length > 0,
            bookings: undefined,
          }));

          console.log("Returning name-based search results");
          return NextResponse.json(formattedNameResults);
        }
      } catch (error) {
        console.error("Error with name-based query:", error);
        // Continue with other approaches if name-based search fails
      }

      // Now try with coordinate-based search
      console.log("Trying with coordinate-based search...");
      try {
        // Try with a much more lenient coordinate threshold
        const WIDE_THRESHOLD = 0.5; // Very wide area

        const coordinateQuery: any = {
          ...whereClauseWithDate,
        };

        if (fromLocation.lat !== undefined && fromLocation.lng !== undefined) {
          coordinateQuery.fromLatitude = {
            gte: fromLocation.lat - WIDE_THRESHOLD,
            lte: fromLocation.lat + WIDE_THRESHOLD,
          };
          coordinateQuery.fromLongitude = {
            gte: fromLocation.lng - WIDE_THRESHOLD,
            lte: fromLocation.lng + WIDE_THRESHOLD,
          };
        }

        if (toLocation.lat !== undefined && toLocation.lng !== undefined) {
          coordinateQuery.toLatitude = {
            gte: toLocation.lat - WIDE_THRESHOLD,
            lte: toLocation.lat + WIDE_THRESHOLD,
          };
          coordinateQuery.toLongitude = {
            gte: toLocation.lng - WIDE_THRESHOLD,
            lte: toLocation.lng + WIDE_THRESHOLD,
          };
        }

        console.log(
          "Trying with wide coordinate query:",
          JSON.stringify(coordinateQuery, null, 2)
        );

        const coordinateResults = await prisma.ride.findMany({
          where: coordinateQuery,
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

        console.log(
          `Found ${coordinateResults.length} rides with coordinate query`
        );

        if (coordinateResults.length > 0) {
          // Coordinate-based search worked, return these results
          const formattedCoordinateResults = coordinateResults.map((ride) => ({
            ...ride,
            departureDate: ride.departureDate.toISOString(),
            hasBooking: ride.bookings.length > 0,
            bookings: undefined,
          }));

          console.log("Returning coordinate-based search results");
          return NextResponse.json(formattedCoordinateResults);
        }
      } catch (error) {
        console.error("Error with coordinate-based query:", error);
      }
    }

    // If all else fails, just return the rides with the date filter
    const formattedDateRides = ridesWithDate.map((ride) => ({
      ...ride,
      departureDate: ride.departureDate.toISOString(),
      hasBooking: ride.bookings.length > 0,
      bookings: undefined,
    }));

    if (ridesWithDate.length > 0) {
      console.log("Returning date-filtered results as final fallback");
      return NextResponse.json(formattedDateRides);
    }

    // Return the basic results if nothing else worked
    console.log("Returning basic results as last resort");
    return NextResponse.json(formattedRides);
  } catch (error) {
    console.error("Error searching rides:", error);
    return NextResponse.json(
      { message: "Failed to search rides", error: String(error) },
      { status: 500 }
    );
  }
}
