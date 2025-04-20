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

    // Check if user exists in the database
    const existingUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    let updatedUser;

    if (existingUser) {
      // Update existing user
      updatedUser = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          drivingLicenseUrl,
          vehicleRegistrationUrl,
          insuranceUrl,
        },
      });
    } else {
      // Create user if they don't exist in the database
      updatedUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.emailAddresses[0]?.emailAddress,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumbers[0]?.phoneNumber,
          role: "driver",
          drivingLicenseUrl,
          vehicleRegistrationUrl,
          insuranceUrl,
        },
      });
    }

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
