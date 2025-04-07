import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const DriversAuthCallback = async () => {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/drivers/sign-in");
  }

  (await clerkClient()).users.updateUser(userId, {
    publicMetadata: {
      role: "driver",
    },
  });

  return redirect("/drivers/onboarding");
};

export default DriversAuthCallback;
