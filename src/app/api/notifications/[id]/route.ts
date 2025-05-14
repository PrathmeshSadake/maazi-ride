import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function DELETE(
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

    // Delete the notification
    await prisma.notification.delete({
      where: {
        id: notificationId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
