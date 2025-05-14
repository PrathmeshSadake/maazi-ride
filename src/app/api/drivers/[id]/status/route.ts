import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    // Check if user is authenticated
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if the authenticated user is requesting their own data
    if (session.user.id !== params.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Fetch user data from database
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        isVerified: true,
        drivingLicenseUrl: true,
        vehicle: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Check if all required documents are uploaded
    const hasAllDocuments = Boolean(
      user.isVerified && user.drivingLicenseUrl && user.vehicle
    );

    // Return the user status data
    return NextResponse.json({
      isVerified: user.isVerified,
      hasAllDocuments: hasAllDocuments,
      missingDocuments: !hasAllDocuments
        ? {
            drivingLicense: !user.drivingLicenseUrl,
            vehicle: !user.vehicle,
          }
        : null,
    });
  } catch (error) {
    console.error("Error fetching driver status:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
