import prisma from "@/lib/db";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

const AuthCallback = async () => {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/sign-in");
  }

  const user = await (await clerkClient()).users.getUser(userId);
  const isDriver = user.publicMetadata?.role === "driver";
  const isAdmin = user.publicMetadata?.role === "admin";

  if (isDriver) {
    return redirect("/drivers/auth-callback");
  }

  if (isAdmin) {
    return redirect("/admin");
  }

  const isVerified = user.publicMetadata?.verified === true;

  const updatedUser = await (
    await clerkClient()
  ).users.updateUser(userId, {
    publicMetadata: {
      role: "user",
      verified: isVerified ? true : false,
    },
  });

  const existingUser = await prisma.user.findUnique({
    where: {
      email: updatedUser.emailAddresses[0].emailAddress,
    },
  });

  if (!existingUser) {
    await prisma.user.create({
      data: {
        email: updatedUser.emailAddresses[0].emailAddress,
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phoneNumber: updatedUser.phoneNumbers[0].phoneNumber,
        role: UserRole.user,
        isVerified: isVerified ? true : false,
      },
    });
  }

  return redirect("/");
};

export default AuthCallback;
