import { redirect } from "next/navigation";
import { getDriverVerificationStatus } from "@/lib/actions/driver-verification";
import prisma from "@/lib/db";
import { auth } from "@/auth";

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
    console.log("Redirecting to drivers main page");
    redirect("/drivers");
  }

  return <div>{children}</div>;
};

export default layout;
