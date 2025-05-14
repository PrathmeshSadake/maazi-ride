import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    const notificationId = params.id;

    // Check if notification exists and belongs to the user
    const notification = await prisma.notification.findUnique({
      where: {
        id: notificationId,
        userId: userId,
      },
    });

    if (!notification) {
      return new NextResponse("Notification not found", { status: 404 });
    }

    // Mark notification as read
    const updatedNotification = await prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        read: true,
      },
    });

    return NextResponse.json(updatedNotification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
