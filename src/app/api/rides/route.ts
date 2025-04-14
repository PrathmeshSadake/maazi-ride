import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a driver
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== "driver") {
      return NextResponse.json(
        { message: "Only drivers can create rides" },
        { status: 403 }
      );
    }

    // Parse request body
    const {
      fromLocation,
      toLocation,
      departureDate,
      departureTime,
      price,
      availableSeats,
      description,
    } = await req.json();

    console.log("API received:", {
      fromLocation,
      toLocation,
      departureDate,
      departureTime,
      price,
    });

    // Validate request fields
    if (!fromLocation || !toLocation) {
      return NextResponse.json(
        { message: "Missing location data" },
        { status: 400 }
      );
    }

    // Validate location objects have required properties
    if (
      !fromLocation.lat ||
      !fromLocation.lng ||
      !toLocation.lat ||
      !toLocation.lng
    ) {
      return NextResponse.json(
        { message: "Invalid location data: missing coordinates" },
        { status: 400 }
      );
    }

    if (!departureDate || !departureTime || !price) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create the ride with properly formatted location data
    const ride = await prisma.ride.create({
      data: {
        driverId: userId,
        fromLocation:
          fromLocation.name || `${fromLocation.lat},${fromLocation.lng}`,
        toLocation: toLocation.name || `${toLocation.lat},${toLocation.lng}`,
        fromLat: fromLocation.lat,
        fromLng: fromLocation.lng,
        toLat: toLocation.lat,
        toLng: toLocation.lng,
        departureDate: new Date(departureDate),
        departureTime,
        price,
        availableSeats: availableSeats || 4,
        description: description || "",
        status: "PENDING_APPROVAL", // Default status
      },
    });

    return NextResponse.json(ride, { status: 201 });
  } catch (error) {
    console.error("Error creating ride:", error);
    return NextResponse.json(
      { message: "Error creating ride" },
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

    let where: any = {};

    if (userId) {
      where.driverId = userId;
    }

    const rides = await prisma.ride.findMany({
      where,
      orderBy: {
        departureDate: "asc",
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

    return NextResponse.json(rides);
  } catch (error) {
    console.error("Error fetching rides:", error);
    return NextResponse.json(
      { message: "Error fetching rides" },
      { status: 500 }
    );
  }
}
