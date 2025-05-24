import { auth } from "@/auth";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

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

// Check if user's driver account is verified
export async function requireVerifiedDriver(
  redirectPath = "/drivers/onboarding"
) {
  const { userId } = await requireRole("driver", "/");
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect("/sign-in");
  }

  const isVerified = (user as any).isVerified;

  if (!isVerified) {
    redirect(redirectPath);
  }

  return userId;
}

// Get verification status of current user
export async function getVerificationStatus(): Promise<boolean> {
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
