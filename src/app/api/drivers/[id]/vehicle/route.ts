import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// GET handler - Fetch vehicle info by driver ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<Promise<{ id: string }>> }
) {
  try {
    const session = await auth();
    const id = (await params).id;

    // Check if user is authenticated
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if the authenticated user is requesting their own data
    if (session.user.id !== id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Fetch vehicle data from database
    const vehicle = await prisma.vehicle.findUnique({
      where: { userId: id },
    });

    if (!vehicle) {
      return new NextResponse("Vehicle not found", { status: 404 });
    }

    // Return the vehicle data
    return NextResponse.json({
      id: vehicle.id,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      licensePlate: vehicle.licensePlate,
      vehicleImages: vehicle.vehicleImages,
    });
  } catch (error) {
    console.error("Error fetching vehicle data:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
