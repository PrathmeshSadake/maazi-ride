import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest) {
  try {
    // Get the current user
    const session = await auth();
    const user = session?.user;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    console.log("data", data);
    const { drivingLicenseUrl, vehicleRegistrationUrl, insuranceUrl, vehicle } =
      data;

    // Validate required fields
    if (
      !drivingLicenseUrl ||
      !vehicleRegistrationUrl ||
      !insuranceUrl ||
      !vehicle
    ) {
      return NextResponse.json(
        { error: "All documents and vehicle information are required" },
        { status: 400 }
      );
    }

    // Validate vehicle fields
    const requiredVehicleFields = [
      "make",
      "model",
      "year",
      "color",
      "licensePlate",
    ];
    const missingFields = requiredVehicleFields.filter(
      (field) => !vehicle[field]
    );

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: `Missing required vehicle fields: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate vehicle images
    if (
      !vehicle.images ||
      !Array.isArray(vehicle.images) ||
      vehicle.images.length === 0
    ) {
      return NextResponse.json(
        { error: "Vehicle images are required" },
        { status: 400 }
      );
    }

    // Use transaction to update both user and vehicle
    const result = await prisma.$transaction(async (tx) => {
      // Update user documents
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          drivingLicenseUrl,
          vehicleRegistrationUrl,
          insuranceUrl,
        },
      });

      // Update or create vehicle information
      const updatedVehicle = await tx.vehicle.upsert({
        where: { userId: user.id },
        update: {
          make: vehicle.make,
          model: vehicle.model,
          year: parseInt(vehicle.year),
          color: vehicle.color,
          licensePlate: vehicle.licensePlate,
          vehicleImages: vehicle.images,
        },
        create: {
          userId: user.id,
          make: vehicle.make,
          model: vehicle.model,
          year: parseInt(vehicle.year),
          color: vehicle.color,
          licensePlate: vehicle.licensePlate,
          vehicleImages: vehicle.images,
        },
      });

      return { user: updatedUser, vehicle: updatedVehicle };
    });

    return NextResponse.json({
      success: true,
      user: result.user,
      vehicle: result.vehicle,
    });
  } catch (error) {
    console.error("Error updating driver profile:", error);
    return NextResponse.json(
      { error: "Failed to update driver profile" },
      { status: 500 }
    );
  }
}
