import { auth } from "@/auth";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

// Function to get the current user's role from Clerk metadata
export async function getUserRole(): Promise<UserRole | null> {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user) return null;

    const role = user.role as UserRole | undefined;
    return role || null;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
}

// Check if the current user is authenticated
export async function requireAuth() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect("/sign-in");
  }

  return user.id;
}

// Check if user has required role and redirect if not
export async function requireRole(
  allowedRoles: UserRole | UserRole[],
  redirectPath = "/"
) {
  const userId = await requireAuth();
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect("/sign-in");
  }

  const userRole = user.role as UserRole | undefined;

  // Check if the user's role is allowed
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  if (!userRole || !roles.includes(userRole)) {
    redirect(redirectPath);
  }

  return { userId, role: userRole };
}

// Get verification status from database
export async function getVerificationStatusFromDB(
  userId: string
): Promise<boolean> {
  try {
    console.log("getVerificationStatusFromDB - userId:", userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isVerified: true, role: true },
    });

    console.log("getVerificationStatusFromDB - user found:", user);

    if (!user || user.role !== "driver") {
      console.log(
        "getVerificationStatusFromDB - no user or not driver, returning false"
      );
      return false;
    }

    console.log("getVerificationStatusFromDB - returning:", user.isVerified);
    return user.isVerified;
  } catch (error) {
    console.error("Error fetching verification status from database:", error);
    return false;
  }
}

// Get driver data from database
export async function getDriverFromDB(userId: string) {
  try {
    const driver = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        ridesCompleted: true,
        driverRating: true,
        drivingLicenseUrl: true,
        vehicleRegistrationUrl: true,
        insuranceUrl: true,
        upiId: true,
        vehicle: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            color: true,
            licensePlate: true,
            vehicleImages: true,
          },
        },
      },
    });

    // Return null only if user doesn't exist at all
    // If user exists but role is not driver, still return null
    if (!driver || driver.role !== "driver") {
      return null;
    }

    return driver;
  } catch (error) {
    console.error("Error fetching driver from database:", error);
    return null;
  }
}

// Check if user's driver account is verified (using database)
export async function requireVerifiedDriver(
  redirectPath = "/drivers/onboarding"
) {
  const { userId } = await requireRole("driver", "/");

  // Fetch verification status from database
  const isVerified = await getVerificationStatusFromDB(userId);

  if (!isVerified) {
    redirect(redirectPath);
  }

  return userId;
}

// Get verification status of current user (from database)
export async function getVerificationStatus(): Promise<boolean> {
  try {
    const session = await auth();
    const user = session?.user;

    console.log("getVerificationStatus - session user:", user);

    if (!user) {
      console.log("getVerificationStatus - no user, returning false");
      return false;
    }

    // Fetch from database instead of session
    const result = await getVerificationStatusFromDB(user.id);
    console.log("getVerificationStatus - database result:", result);
    return result;
  } catch (error) {
    console.error("Error getting verification status:", error);
    return false;
  }
}

// Legacy function - Get verification status from session (deprecated)
export async function getVerificationStatusFromSession(): Promise<boolean> {
  const session = await auth();
  const user = session?.user;

  if (!user) return false;

  return (user as any).isVerified || false;
}

// Check if current user is admin
export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === "admin";
}

// Check if current user is driver
export async function isDriver(): Promise<boolean> {
  const role = await getUserRole();
  return role === "driver";
}

// Check if current user is verified driver (from database)
export async function isVerifiedDriver(): Promise<boolean> {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user || user.role !== "driver") return false;

    return await getVerificationStatusFromDB(user.id);
  } catch (error) {
    console.error("Error checking verified driver status:", error);
    return false;
  }
}
