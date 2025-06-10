import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDriverFromDB, getVerificationStatusFromDB } from "@/lib/auth";

export async function GET() {
  try {
    console.log("Verification status API called");

    const session = await auth();
    console.log(
      "Session status:",
      session?.user ? "authenticated" : "unauthenticated"
    );

    if (!session?.user) {
      console.log("Unauthorized: No session or user");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    console.log("User ID:", userId);

    // Check if user is a driver
    if (session.user.role !== "driver") {
      console.log("User role is not driver:", session.user.role);
      return NextResponse.json(
        { error: "User is not a driver" },
        { status: 403 }
      );
    }

    console.log("Fetching verification status for driver:", userId);

    // Get verification status from database
    const isVerified = await getVerificationStatusFromDB(userId);
    console.log("Verification status:", isVerified);

    // Get full driver data
    const driverData = await getDriverFromDB(userId);
    console.log("Driver data exists:", !!driverData);

    // If driver doesn't exist yet, return default data structure
    if (!driverData) {
      console.log("Driver data not found, returning default structure");
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

    const responseData = {
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
    };

    console.log("Returning verification data successfully");
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching driver verification status:", error);

    // Return more specific error information in development
    const isDevelopment = process.env.NODE_ENV === "development";
    const errorMessage =
      isDevelopment && error instanceof Error
        ? error.message
        : "Internal server error";

    return NextResponse.json(
      {
        error: errorMessage,
        ...(isDevelopment && {
          stack: error instanceof Error ? error.stack : undefined,
        }),
      },
      { status: 500 }
    );
  }
}
