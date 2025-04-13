import prisma from "@/lib/db";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

const UserAuthCallback = async () => {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/sign-in");
  }

  const user = await (await clerkClient()).users.getUser(userId);
  const isVerified = user.publicMetadata?.verified === true;

  // Update user metadata in Clerk
  const updatedUser = await (
    await clerkClient()
  ).users.updateUser(userId, {
    publicMetadata: {
      role: user.publicMetadata?.role ? user.publicMetadata?.role : "user",
      verified: isVerified ? true : false,
    },
  });

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
        role: UserRole.user,
        isVerified: isVerified ? true : false,
      },
    });
  }

  if (!isVerified) {
    return redirect("/onboarding");
  }

  return redirect("/dashboard");
};

export default UserAuthCallback;
