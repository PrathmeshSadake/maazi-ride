import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const messageId = (await params).id;

    // Find the message and check if user is the receiver
    const message = await prisma.message.findUnique({
      where: {
        id: messageId,
      },
    });

    if (!message) {
      return new NextResponse("Message not found", { status: 404 });
    }

    if (message.receiverId !== session.user.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Mark message as read
    const updatedMessage = await prisma.message.update({
      where: {
        id: messageId,
      },
      data: {
        read: true,
      },
    });

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error("Error marking message as read:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
