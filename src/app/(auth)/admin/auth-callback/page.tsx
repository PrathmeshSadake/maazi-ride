import prisma from "@/lib/db";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

const AdminAuthCallback = async () => {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/admin/sign-in");
  }

  const user = await (await clerkClient()).users.getUser(userId);
  const isVerified = user.publicMetadata?.verified === true;
  const isAdmin = user.publicMetadata?.role === "admin";

  // Update user metadata in Clerk
  const updatedUser = await (
    await clerkClient()
  ).users.updateUser(userId, {
    publicMetadata: {
      role: isAdmin ? "admin" : "user",
      verified: isVerified ? true : false,
    },
  });

  // Only proceed if user has admin role
  if (!isAdmin) {
    return redirect("/"); // Redirect non-admin users to home
  }

  // Check if user exists in Prisma DB
  const existingUser = await prisma.user.findUnique({
    where: {
      phoneNumber: updatedUser.phoneNumbers[0].phoneNumber,
    },
  });

  // Create user in Prisma DB if not exists
  if (!existingUser) {
    await prisma.user.create({
      data: {
        email:
          updatedUser.emailAddresses.length > 0
            ? updatedUser.emailAddresses[0].emailAddress
            : null,
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phoneNumber: updatedUser.phoneNumbers[0].phoneNumber,
        role: UserRole.admin,
        isVerified: isVerified ? true : false,
      },
    });
  } else {
    // Update existing user to ensure role is admin
    await prisma.user.update({
      where: { id: updatedUser.id },
      data: {
        role: UserRole.admin,
        isVerified: isVerified ? true : false,
      },
    });
  }

  if (!isVerified) {
    return redirect("/admin/onboarding");
  }

  return redirect("/admin/dashboard");
};

export default AdminAuthCallback;
