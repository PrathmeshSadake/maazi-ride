import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDriverFromDB, getVerificationStatusFromDB } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Check if user is a driver
    if (session.user.role !== "driver") {
      return NextResponse.json(
        { error: "User is not a driver" },
        { status: 403 }
      );
    }

    // Get verification status from database
    const isVerified = await getVerificationStatusFromDB(userId);

    // Get full driver data
    const driverData = await getDriverFromDB(userId);

    // If driver doesn't exist yet, return default data structure
    if (!driverData) {
      return NextResponse.json({
        isVerified: false,
        driver: {
          id: userId,
          name: session.user.name,
          email: session.user.email,
          role: "driver",
          isVerified: false,
          ridesCompleted: 0,
          driverRating: null,
          drivingLicenseUrl: null,
          vehicleRegistrationUrl: null,
          insuranceUrl: null,
          upiId: null,
          vehicle: null,
        },
        hasDocuments: {
          drivingLicense: false,
          vehicleRegistration: false,
          insurance: false,
        },
        hasVehicle: false,
        completionStatus: {
          documentsUploaded: false,
          vehicleAdded: false,
          verified: false,
        },
      });
    }

    return NextResponse.json({
      isVerified,
      driver: driverData,
      hasDocuments: {
        drivingLicense: !!driverData.drivingLicenseUrl,
        vehicleRegistration: !!driverData.vehicleRegistrationUrl,
        insurance: !!driverData.insuranceUrl,
      },
      hasVehicle: !!driverData.vehicle,
      completionStatus: {
        documentsUploaded: !!(
          driverData.drivingLicenseUrl &&
          driverData.vehicleRegistrationUrl &&
          driverData.insuranceUrl
        ),
        vehicleAdded: !!driverData.vehicle,
        verified: isVerified,
      },
    });
  } catch (error) {
    console.error("Error fetching driver verification status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
