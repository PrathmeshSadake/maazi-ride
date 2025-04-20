import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Check if user is authenticated and is admin
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || user.role !== "admin") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Get all drivers
    const drivers = await prisma.user.findMany({
      where: {
        role: "driver",
      },
      select: {
        drivingLicenseUrl: true,
        vehicleRegistrationUrl: true,
        insuranceUrl: true,
        vehicle: {
          select: {
            vehicleImages: true,
          },
        },
      },
    });

    // Calculate verification stats
    const drivingLicense = {
      verified: drivers.filter((d) => !!d.drivingLicenseUrl).length,
      unverified: drivers.filter((d) => !d.drivingLicenseUrl).length,
    };

    const vehicleRegistration = {
      verified: drivers.filter((d) => !!d.vehicleRegistrationUrl).length,
      unverified: drivers.filter((d) => !d.vehicleRegistrationUrl).length,
    };

    const insurance = {
      verified: drivers.filter((d) => !!d.insuranceUrl).length,
      unverified: drivers.filter((d) => !d.insuranceUrl).length,
    };

    const vehicleImages = {
      verified: drivers.filter(
        (d) => d.vehicle && d.vehicle.vehicleImages.length > 0
      ).length,
      unverified: drivers.filter(
        (d) => !d.vehicle || d.vehicle.vehicleImages.length === 0
      ).length,
    };

    return NextResponse.json({
      drivingLicense,
      vehicleRegistration,
      insurance,
      vehicleImages,
    });
  } catch (error) {
    console.error("[DRIVER_VERIFICATION_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
