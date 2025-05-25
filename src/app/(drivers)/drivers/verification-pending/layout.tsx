import { redirect } from "next/navigation";
import { getDriverVerificationStatus } from "@/lib/actions/driver-verification";
import { auth } from "@/auth";
import prisma from "@/lib/db";

const layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();
  const user = session?.user;
  const driver = await prisma.user.findUnique({
    where: {
      id: user!.id,
    },
  });

  // If driver is already verified, redirect to main drivers page
  if (driver?.isVerified) {
    redirect("/drivers");
  }

  // If driver still needs onboarding, redirect to onboarding
  // if (driver?.needsOnboarding) {
  //   redirect("/drivers/onboarding");
  // }

  // Only allow access if driver has completed onboarding but is not verified
  return <div>{children}</div>;
};

export default layout;
