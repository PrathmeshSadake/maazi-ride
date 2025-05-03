import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET handler - Fetch vehicle info by driver ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();

    // Check if the user is authenticated
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the user is accessing their own vehicle info or is an admin
    if (userId !== params.id) {
      // Add admin check logic here if needed
      return NextResponse.json(
        {
          error: "Forbidden: You can only access your own vehicle information",
        },
        { status: 403 }
      );
    }

    // Fetch the vehicle info
    const vehicle = await prisma.vehicle.findUnique({
      where: { userId: params.id },
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    return NextResponse.json(
      { error: "Error fetching vehicle information" },
      { status: 500 }
    );
  }
}
