import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// GET handler - Fetch driver's document information
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<Promise<{ id: string }>> }
) {
  try {
    const id = (await params).id;
    const session = await auth();

    // Check if user is authenticated
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if the authenticated user is requesting their own data
    if (session.user.id !== id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Fetch user data from database
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        isVerified: true,
        drivingLicenseUrl: true,
        vehicleRegistrationUrl: true,
        insuranceUrl: true,
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Return the document data
    return NextResponse.json({
      drivingLicenseUrl: user.drivingLicenseUrl,
      vehicleRegistrationUrl: user.vehicleRegistrationUrl,
      insuranceUrl: user.insuranceUrl,
      isVerified: user.isVerified,
    });
  } catch (error) {
    console.error("Error fetching driver documents:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
