import { createClerkClient } from "@clerk/backend";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

// GET /api/drivers/[id] - Get a single driver by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const databaseUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    // if (!databaseUser || databaseUser.role !== "admin") {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

    const driver = await prisma.user.findUnique({
      where: {
        id: (await params).id,
        role: "driver",
      },
      include: {
        vehicle: true,
      },
    });

    if (!driver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    return NextResponse.json(driver);
  } catch (error) {
    console.error("[DRIVER_GET]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// PATCH /api/drivers/[id] - Verify a driver
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const databaseUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    // if (!databaseUser || databaseUser.role !== "admin") {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

    const body = await req.json();
    const { verified } = body;

    const driver = await prisma.user.findUnique({
      where: {
        id: (await params).id,
        role: "driver",
      },
    });

    if (!driver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    const updatedDriver = await prisma.user.update({
      where: {
        id: (await params).id,
      },
      data: {
        isVerified: verified,
      },
    });

    clerkClient.users.updateUserMetadata(updatedDriver.id, {
      publicMetadata: {
        isVerified: verified,
      },
    });

    return NextResponse.json(updatedDriver);
  } catch (error) {
    console.error("[DRIVER_VERIFY]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
