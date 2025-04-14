import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Parse the request body
    const { content, bookingId } = await req.json();

    if (!content) {
      return NextResponse.json(
        { message: "Message content is required" },
        { status: 400 }
      );
    }

    if (!bookingId) {
      return NextResponse.json(
        { message: "Booking ID is required" },
        { status: 400 }
      );
    }

    // Get the booking to determine sender and receiver
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        ride: {
          select: {
            driverId: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 }
      );
    }

    // Determine if the user is the passenger or driver
    const isPassenger = booking.userId === userId;
    const isDriver = booking.ride.driverId === userId;

    if (!isPassenger && !isDriver) {
      return NextResponse.json(
        { message: "You are not authorized to send messages for this booking" },
        { status: 403 }
      );
    }

    // Set sender and receiver IDs
    const senderId = userId;
    const receiverId = isPassenger ? booking.ride.driverId : booking.userId;

    // Create the message
    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        receiverId,
        bookingId,
        read: false,
      },
      include: {
        sender: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        receiver: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Create a notification for the receiver
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: "message",
        title: "New Message",
        message: `You have a new message from ${message.sender.firstName}`,
        relatedId: message.id,
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { message: "Error sending message" },
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

    // Parse query parameters
    const url = new URL(req.url);
    const bookingId = url.searchParams.get("bookingId");

    if (!bookingId) {
      return NextResponse.json(
        { message: "Booking ID is required" },
        { status: 400 }
      );
    }

    // Get the booking to verify access
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        ride: {
          select: {
            driverId: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 }
      );
    }

    // Check if user is the passenger or driver
    const isUserInvolved =
      booking.userId === userId || booking.ride.driverId === userId;

    if (!isUserInvolved) {
      return NextResponse.json(
        { message: "You are not authorized to view these messages" },
        { status: 403 }
      );
    }

    // Fetch messages for this booking
    const messages = await prisma.message.findMany({
      where: {
        bookingId,
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        sender: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        receiver: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Mark messages as read if user is the receiver
    const unreadMessages = messages.filter(
      (message) => !message.read && message.receiverId === userId
    );

    if (unreadMessages.length > 0) {
      await prisma.message.updateMany({
        where: {
          id: {
            in: unreadMessages.map((message) => message.id),
          },
        },
        data: {
          read: true,
        },
      });
    }

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { message: "Error fetching messages" },
      { status: 500 }
    );
  }
}
