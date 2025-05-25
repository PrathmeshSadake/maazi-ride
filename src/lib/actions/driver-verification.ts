import { auth } from "@/auth";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";

export interface DriverVerificationStatus {
  id: string;
  isVerified: boolean;
  hasDocuments: boolean;
  hasVehicleInfo: boolean;
  needsOnboarding: boolean;
  needsVerification: boolean;
}

export async function getDriverVerificationStatus(): Promise<DriverVerificationStatus> {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect("/sign-in");
  }

  const driver = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
    include: {
      vehicle: true,
    },
  });

  if (!driver) {
    redirect("/sign-in");
  }

  const hasDocuments = !!(
    driver.drivingLicenseUrl &&
    driver.vehicleRegistrationUrl &&
    driver.insuranceUrl
  );

  const hasVehicleInfo = !!(
    driver.vehicle?.make &&
    driver.vehicle?.model &&
    driver.vehicle?.year &&
    driver.vehicle?.color &&
    driver.vehicle?.licensePlate
  );

  const needsOnboarding = !hasDocuments || !hasVehicleInfo;
  const needsVerification =
    hasDocuments && hasVehicleInfo && !driver.isVerified;

  return {
    id: driver.id,
    isVerified: driver.isVerified,
    hasDocuments,
    hasVehicleInfo,
    needsOnboarding,
    needsVerification,
  };
}

export async function getDriverData() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return null;
  }

  const driver = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
    include: {
      vehicle: true,
    },
  });

  return driver;
}
