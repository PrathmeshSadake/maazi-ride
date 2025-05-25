import { auth } from "@/auth";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const driver = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
      include: {
        vehicle: true,
      },
    });

    if (!driver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    // Transform the data to match the client interface
    const responseData = {
      id: driver.id,
      isVerified: driver.isVerified,
      drivingLicenseUrl: driver.drivingLicenseUrl,
      vehicleRegistrationUrl: driver.vehicleRegistrationUrl,
      insuranceUrl: driver.insuranceUrl,
      vehicle: driver.vehicle
        ? {
            id: driver.vehicle.id,
            make: driver.vehicle.make,
            model: driver.vehicle.model,
            year: driver.vehicle.year,
            color: driver.vehicle.color,
            licensePlate: driver.vehicle.licensePlate,
            vehicleImages: driver.vehicle.vehicleImages || [],
          }
        : null,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching driver data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
