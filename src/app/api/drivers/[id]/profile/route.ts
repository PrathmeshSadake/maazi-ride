import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<Promise<{ id: string }>> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const driverId = (await params).id;

    // Get driver profile information
    const driver = await prisma.user.findUnique({
      where: {
        id: driverId,
        role: "driver",
      },
      select: {
        id: true,
        name: true,
        phone: true,
        driverRating: true,
        ridesCompleted: true,
        isVerified: true,
        vehicle: {
          select: {
            make: true,
            model: true,
            year: true,
            color: true,
            licensePlate: true,
          },
        },
      },
    });

    if (!driver) {
      return new NextResponse("Driver not found", { status: 404 });
    }

    return NextResponse.json(driver);
  } catch (error) {
    console.error("Error fetching driver profile:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
