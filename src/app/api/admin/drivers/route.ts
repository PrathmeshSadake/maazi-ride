import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const drivers = await prisma.user.findMany({
      where: {
        role: "driver",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        isVerified: true,
        ridesCompleted: true,
        driverRating: true,
        upiId: true,
        drivingLicenseUrl: true,
        vehicleRegistrationUrl: true,
        insuranceUrl: true,
        vehicle: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            color: true,
            licensePlate: true,
            vehicleImages: true,
          },
        },
        offeredRides: {
          select: {
            id: true,
            fromLocation: true,
            toLocation: true,
            status: true,
            price: true,
            departureDate: true,
            availableSeats: true,
            bookings: {
              select: {
                id: true,
                status: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10, // Limit to recent rides
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            author: {
              select: {
                name: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10, // Limit to recent reviews
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(drivers);
  } catch (error) {
    console.error("Drivers API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch drivers" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
