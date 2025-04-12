import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { vehicleMake, vehicleModel, vehicleYear, licensePlate, documents } =
      await request.json();

    // Update user profile
    await prisma.user.create({
      data: {
        id: userId,
        drivingLicenseUrl: documents.drivingLicense,
        vehicleRegistrationUrl: documents.vehicleRegistration,
        insuranceUrl: documents.insurance,
        vehicle: {
          create: {
            make: vehicleMake,
            model: vehicleModel,
            year: parseInt(vehicleYear),
            licensePlate,
          },
        },
      },
    });

    // Update Clerk metadata
    (await clerkClient()).users.updateUser(userId, {
      publicMetadata: {
        role: "driver",
        verified: false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating driver profile:", error);
    return NextResponse.json(
      { error: "Failed to update driver profile" },
      { status: 500 }
    );
  }
}
