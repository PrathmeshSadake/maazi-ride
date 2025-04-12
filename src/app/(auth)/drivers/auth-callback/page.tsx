import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const DriversAuthCallback = async () => {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/drivers/sign-in");
  }

  const user = await (await clerkClient()).users.getUser(userId);
  const isVerified = user.publicMetadata?.verified === true;

  if (!isVerified) {
    return redirect("/drivers/onboarding");
  }

  return redirect("/drivers/dashboard");
};

export default DriversAuthCallback;
