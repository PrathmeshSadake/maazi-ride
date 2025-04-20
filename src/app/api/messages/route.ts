import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendMessageToUser } from "./sse/route";

// Schema for creating a message
const createMessageSchema = z.object({
  content: z.string().min(1),
  receiverId: z.string().optional(),
  bookingId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { content, receiverId, bookingId } = createMessageSchema.parse(body);

    // If we have a bookingId but no receiverId, find the receiver from the booking
    let actualReceiverId = receiverId;
    if (bookingId && !receiverId) {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { ride: true },
      });

      if (!booking) {
        return NextResponse.json(
          { message: "Booking not found" },
          { status: 404 }
        );
      }

      // Determine receiver based on who sent the message
      actualReceiverId =
        user.id === booking.userId ? booking.ride.driverId : booking.userId;
    }

    if (!actualReceiverId) {
      return NextResponse.json(
        { message: "Receiver ID is required" },
        { status: 400 }
      );
    }

    // Check if receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: actualReceiverId },
    });

    if (!receiver) {
      return NextResponse.json(
        { message: "Receiver not found" },
        { status: 404 }
      );
    }

    // If bookingId is provided, verify that it exists and involves both users
    if (bookingId) {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          ride: true,
        },
      });

      if (!booking) {
        return NextResponse.json(
          { message: "Booking not found" },
          { status: 404 }
        );
      }

      // Check if the users are part of this booking
      const isPartOfBooking =
        (booking.userId === user.id &&
          booking.ride.driverId === actualReceiverId) ||
        (booking.userId === actualReceiverId &&
          booking.ride.driverId === user.id);

      if (!isPartOfBooking) {
        return NextResponse.json(
          {
            message:
              "You don't have permission to send messages for this booking",
          },
          { status: 403 }
        );
      }
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        content,
        senderId: user.id,
        receiverId: actualReceiverId,
        bookingId,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Create a notification for the receiver
    await prisma.notification.create({
      data: {
        userId: actualReceiverId,
        type: "message",
        title: "New Message",
        message: `You have a new message from ${user.firstName || ""} ${
          user.lastName || ""
        }`,
        relatedId: message.id,
      },
    });

    // Send real-time update to receiver
    sendMessageToUser(actualReceiverId, {
      event: "newMessage",
      message,
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid data", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Failed to create message" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const otherUserId = searchParams.get("userId");
    const bookingId = searchParams.get("bookingId");

    if (!otherUserId && !bookingId) {
      // Get all conversations (grouped by the other user)
      const sentMessages = await prisma.message.findMany({
        where: {
          senderId: user.id,
        },
        select: {
          receiverId: true,
        },
        distinct: ["receiverId"],
      });

      const receivedMessages = await prisma.message.findMany({
        where: {
          receiverId: user.id,
        },
        select: {
          senderId: true,
        },
        distinct: ["senderId"],
      });

      // Combine unique user IDs from sent and received messages
      const userIds = new Set([
        ...sentMessages.map((m) => m.receiverId),
        ...receivedMessages.map((m) => m.senderId),
      ]);

      // Get user details for each conversation
      const conversations = await Promise.all(
        Array.from(userIds).map(async (id) => {
          const otherUser = await prisma.user.findUnique({
            where: { id },
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          });

          // Get latest message
          const latestMessage = await prisma.message.findFirst({
            where: {
              OR: [
                { senderId: user.id, receiverId: id },
                { senderId: id, receiverId: user.id },
              ],
            },
            orderBy: {
              createdAt: "desc",
            },
          });

          // Get unread count
          const unreadCount = await prisma.message.count({
            where: {
              senderId: id,
              receiverId: user.id,
              read: false,
            },
          });

          return {
            user: otherUser,
            latestMessage,
            unreadCount,
          };
        })
      );

      return NextResponse.json(conversations);
    } else if (otherUserId) {
      // Get messages between two users
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: user.id, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: user.id },
          ],
          ...(bookingId ? { bookingId } : {}),
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          receiver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      // Mark messages as read
      await prisma.message.updateMany({
        where: {
          senderId: otherUserId,
          receiverId: user.id,
          read: false,
        },
        data: {
          read: true,
        },
      });

      return NextResponse.json(messages);
    } else if (bookingId) {
      // Get messages for a specific booking
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          ride: true,
        },
      });

      if (!booking) {
        return NextResponse.json(
          { message: "Booking not found" },
          { status: 404 }
        );
      }

      // Check if the user is part of this booking
      const isPartOfBooking =
        booking.userId === user.id || booking.ride.driverId === user.id;

      if (!isPartOfBooking) {
        return NextResponse.json(
          {
            message:
              "You don't have permission to view messages for this booking",
          },
          { status: 403 }
        );
      }

      const otherUserId =
        booking.userId === user.id ? booking.ride.driverId : booking.userId;

      // Get messages for this booking
      const messages = await prisma.message.findMany({
        where: {
          bookingId,
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          receiver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      // Mark messages as read
      await prisma.message.updateMany({
        where: {
          bookingId,
          senderId: otherUserId,
          receiverId: user.id,
          read: false,
        },
        data: {
          read: true,
        },
      });

      return NextResponse.json(messages);
    }

    return NextResponse.json(
      { message: "Either userId or bookingId is required" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { message: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
