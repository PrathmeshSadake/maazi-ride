import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// Map to store active clients
const clients = new Map<string, ReadableStreamController<Uint8Array>>();

// Function to send message to a specific user
function sendMessageToUser(userId: string, data: any) {
  const controller = clients.get(userId);
  if (controller) {
    controller.enqueue(
      new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`)
    );
  }
}

export async function GET(req: NextRequest) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Create a new ReadableStream with a controller we can use later
  const stream = new ReadableStream({
    start(controller) {
      clients.set(user.id, controller);

      // Send initial connection message
      controller.enqueue(
        new TextEncoder().encode(
          `data: ${JSON.stringify({ event: "connected" })}\n\n`
        )
      );
    },
    cancel() {
      // Remove client when connection is closed
      clients.delete(user.id);
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
