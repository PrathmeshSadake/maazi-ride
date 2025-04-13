import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import prisma from "@/lib/db";

import { createClerkClient } from "@clerk/backend";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Ensure the current user is an admin (this will redirect if not)
    await requireRole("admin");

    // Get the userId from the request
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if user exists and is a driver
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    if (user.role !== "driver") {
      return NextResponse.json(
        { success: false, error: "User is not a driver" },
        { status: 400 }
      );
    }

    // Update the user's verification status in both Clerk and DB
    // 1. Update in Clerk metadata
    await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        role: "driver",
        isVerified: true,
      },
    });

    // 2. Update in database
    await prisma.user.update({
      where: { id: userId },
      data: { isVerified: true },
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Driver verified successfully",
    });
  } catch (error) {
    console.error("Error verifying driver:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify driver" },
      { status: 500 }
    );
  }
}

// For checking verification status
export async function GET(request: NextRequest) {
  try {
    // Get the userId from the request
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check user verification status
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        isVerified: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Error checking driver verification:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check verification status" },
      { status: 500 }
    );
  }
}
