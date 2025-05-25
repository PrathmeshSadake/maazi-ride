import DriverNavigation from "@/components/DriverNavigation";
import { redirect } from "next/navigation";
import React from "react";
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

  // If driver is not verified, redirect based on their status
  if (!driver?.isVerified) {
    console.log("Redirecting to drivers onboarding page");
    // redirect("/drivers/onboarding");
  }

  return (
    <div className="min-h-screen flex flex-col w-full max-w-sm mx-auto">
      <main className="flex-1 pb-16">{children}</main>

      {/* Client-side navigation component */}
      <DriverNavigation isVerified={driver?.isVerified || false} />
    </div>
  );
};

export default layout;
