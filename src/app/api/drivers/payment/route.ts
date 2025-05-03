import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET handler - Fetch driver's payment info
export async function GET() {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { upiId: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ upiId: user.upiId });
  } catch (error) {
    console.error("Error fetching UPI ID:", error);
    return NextResponse.json(
      { error: "Error fetching payment information" },
      { status: 500 }
    );
  }
}

// POST handler - Update driver's UPI ID
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { upiId } = await request.json();

    if (!upiId || typeof upiId !== "string") {
      return NextResponse.json({ error: "Invalid UPI ID" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { upiId },
      select: { upiId: true },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating UPI ID:", error);
    return NextResponse.json(
      { error: "Error updating payment information" },
      { status: 500 }
    );
  }
}

// DELETE handler - Remove driver's UPI ID
export async function DELETE() {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { upiId: null },
      select: { upiId: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting UPI ID:", error);
    return NextResponse.json(
      { error: "Error removing payment information" },
      { status: 500 }
    );
  }
}
