import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { auth } from "@/auth";

const rideSchema = z.object({
  fromLocation: z.string(),
  fromLatitude: z.number(),
  fromLongitude: z.number(),
  toLocation: z.string(),
  toLatitude: z.number(),
  toLongitude: z.number(),
  departureDate: z.string().or(z.date()),
  departureTime: z.string(),
  price: z.number().positive(),
  availableSeats: z.number().int().positive(),
  description: z.string().optional(),
  isScheduled: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user || user.role !== "driver") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const validatedData = rideSchema.parse(body);

    // Format date correctly if it's a string
    const departureDate =
      typeof validatedData.departureDate === "string"
        ? new Date(validatedData.departureDate)
        : validatedData.departureDate;

    const createdRide = await prisma.ride.create({
      data: {
        driverId: user.id,
        fromLocation: validatedData.fromLocation,
        fromLatitude: validatedData.fromLatitude,
        fromLongitude: validatedData.fromLongitude,
        toLocation: validatedData.toLocation,
        toLatitude: validatedData.toLatitude,
        toLongitude: validatedData.toLongitude,
        departureDate,
        departureTime: validatedData.departureTime,
        price: validatedData.price,
        availableSeats: validatedData.availableSeats,
        description: validatedData.description,
        isScheduled: validatedData.isScheduled,
      },
    });

    return NextResponse.json(createdRide);
  } catch (error) {
    console.error("Error creating ride:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid data", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Failed to create ride" },
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
    const isScheduled = searchParams.get("isScheduled");

    // Check if the user is a driver or a user
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (dbUser.role === "driver") {
      // Drivers get their own rides
      const rides = await prisma.ride.findMany({
        where: {
          driverId: user.id,
          ...(isScheduled ? { isScheduled: isScheduled === "true" } : {}),
        },
        include: {
          bookings: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                },
              },
            },
          },
        },
        orderBy: {
          departureDate: "asc",
        },
      });

      // Format the dates to ISO strings for consistent handling on the client
      const formattedRides = rides.map((ride) => ({
        ...ride,
        departureDate: ride.departureDate.toISOString(),
      }));

      return NextResponse.json(formattedRides);
    } else {
      // Regular users get available rides they can book
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const rides = await prisma.ride.findMany({
        where: {
          departureDate: {
            gte: today,
          },
          availableSeats: {
            gt: 0,
          },
          isScheduled: true,
        },
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

      // Format the dates to ISO strings for consistent handling on the client
      const formattedRides = rides.map((ride) => ({
        ...ride,
        departureDate: ride.departureDate.toISOString(),
      }));

      return NextResponse.json(formattedRides);
    }
  } catch (error) {
    console.error("Error fetching rides:", error);
    return NextResponse.json(
      { message: "Failed to fetch rides" },
      { status: 500 }
    );
  }
}
