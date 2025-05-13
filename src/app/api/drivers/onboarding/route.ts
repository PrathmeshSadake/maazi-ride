import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";

export async function POST(req: Request) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;
    const data = await req.json();
    const {
      vehicleMake,
      vehicleModel,
      vehicleYear,
      licensePlate,
      documents,
      vehicleImages,
    } = data;

    // Validate required fields
    if (
      !vehicleMake ||
      !vehicleModel ||
      !vehicleYear ||
      !licensePlate ||
      !documents ||
      !vehicleImages
    ) {
      return NextResponse.json(
        { error: "All fields including vehicle images are required" },
        { status: 400 }
      );
    }

    // Validate vehicle images
    if (!Array.isArray(vehicleImages) || vehicleImages.length === 0) {
      return NextResponse.json(
        { error: "Vehicle images are required" },
        { status: 400 }
      );
    }

    // Check if the user exists in the database
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create or update the vehicle
    const vehicle = await prisma.vehicle.upsert({
      where: { userId },
      update: {
        make: vehicleMake,
        model: vehicleModel,
        year: parseInt(vehicleYear),
        licensePlate,
        vehicleImages,
      },
      create: {
        userId,
        make: vehicleMake,
        model: vehicleModel,
        year: parseInt(vehicleYear),
        licensePlate,
        vehicleImages,
      },
    });

    // Update the user with document URLs
    await prisma.user.update({
      where: { id: userId },
      data: {
        drivingLicenseUrl: documents.drivingLicense,
        vehicleRegistrationUrl: documents.vehicleRegistration,
        insuranceUrl: documents.insurance,
        // Set isVerified to false, will be reviewed by admin
        isVerified: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Driver onboarding information saved successfully",
      vehicle,
    });
  } catch (error) {
    console.error("Error in driver onboarding API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
