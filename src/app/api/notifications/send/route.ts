import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { userId, type, title, message, relatedId } = await req.json();

    // Create notification in database
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        relatedId,
      },
    });

    // Send real-time notification via Pusher
    try {
      await pusherServer.trigger(`user-${userId}`, "new-notification", {
        notification,
      });
    } catch (error) {
      console.error("Error sending Pusher notification:", error);
    }

    return NextResponse.json(notification);
  } catch (error) {
    console.error("Error sending notification:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
