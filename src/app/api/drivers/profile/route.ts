import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";

export async function PUT(request: NextRequest) {
  try {
    // Get the current user
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { drivingLicenseUrl, vehicleRegistrationUrl, insuranceUrl, vehicle } =
      data;

    // Update user document URLs
    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        drivingLicenseUrl,
        vehicleRegistrationUrl,
        insuranceUrl,
      },
    });

    // Update or create vehicle information
    let updatedVehicle;
    if (vehicle) {
      updatedVehicle = await prisma.vehicle.upsert({
        where: {
          userId: user.id,
        },
        update: {
          make: vehicle.make,
          model: vehicle.model,
          year: parseInt(vehicle.year),
          color: vehicle.color,
          licensePlate: vehicle.licensePlate,
        },
        create: {
          userId: user.id,
          make: vehicle.make,
          model: vehicle.model,
          year: parseInt(vehicle.year),
          color: vehicle.color,
          licensePlate: vehicle.licensePlate,
        },
      });
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
      vehicle: updatedVehicle,
    });
  } catch (error) {
    console.error("Error updating driver profile:", error);
    return NextResponse.json(
      { error: "Failed to update driver profile" },
      { status: 500 }
    );
  }
}
