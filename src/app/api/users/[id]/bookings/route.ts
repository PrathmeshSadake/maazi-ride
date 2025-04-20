import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Check if user is authenticated and is admin
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!currentUser || currentUser.role !== "admin") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Fetch the user's bookings
    const bookings = await prisma.booking.findMany({
      where: { userId: id },
      select: {
        id: true,
        rideId: true,
        status: true,
        numSeats: true,
        createdAt: true,
        ride: {
          select: {
            fromLocation: true,
            toLocation: true,
            departureDate: true,
            departureTime: true,
            price: true,
            driver: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("[USER_BOOKINGS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
