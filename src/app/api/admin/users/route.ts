import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        isVerified: true,
        ridesCompleted: true,
        driverRating: true,
        bookings: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            numSeats: true,
            ride: {
              select: {
                fromLocation: true,
                toLocation: true,
                price: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10, // Limit to recent bookings
        },
        offeredRides: {
          select: {
            id: true,
            fromLocation: true,
            toLocation: true,
            status: true,
            price: true,
            departureDate: true,
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

    return NextResponse.json(users);
  } catch (error) {
    console.error("Users API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
