import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET handler - Fetch driver's document information
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

    // Check if the user is accessing their own documents or is an admin
    if (userId !== params.id) {
      // Add admin check logic here if needed
      return NextResponse.json(
        { error: "Forbidden: You can only access your own documents" },
        { status: 403 }
      );
    }

    // Fetch the document info
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        drivingLicenseUrl: true,
        vehicleRegistrationUrl: true,
        insuranceUrl: true,
        isVerified: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching document information:", error);
    return NextResponse.json(
      { error: "Error fetching document information" },
      { status: 500 }
    );
  }
}
