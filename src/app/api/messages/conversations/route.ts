import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;

    // Get all bookings for the user with their associated messages
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
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Transform bookings into conversations
    const conversations = await Promise.all(
      bookings
        .filter((booking) => booking.messages.length > 0) // Only include bookings with messages
        .map(async (booking) => {
          // Count unread messages for this conversation
          const unreadCount = await prisma.message.count({
            where: {
              bookingId: booking.id,
              receiverId: userId,
              read: false,
            },
          });

          return {
            id: `booking-${booking.id}`,
            driverId: booking.ride.driver.id,
            driverName: booking.ride.driver.name || "Driver",
            rideId: booking.ride.id,
            bookingId: booking.id,
            lastMessage: booking.messages[0],
            unreadCount,
            rideDetails: {
              fromLocation: booking.ride.fromLocation,
              toLocation: booking.ride.toLocation,
              departureDate: booking.ride.departureDate.toISOString(),
              status: booking.status,
            },
          };
        })
    );

    // Sort conversations by last message time
    conversations.sort(
      (a, b) =>
        new Date(b.lastMessage.createdAt).getTime() -
        new Date(a.lastMessage.createdAt).getTime()
    );

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
