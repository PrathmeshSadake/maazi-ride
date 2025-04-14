import { requireRole, getVerificationStatus } from "@/lib/auth";
import { RoleManager } from "@/components/RoleManager";
import { UserProfile } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { CalendarPlus, Car, CircleDollarSign } from "lucide-react";

export default async function DriverDashboard() {
  // Check if user has the driver role (this function will redirect if not)
  const { userId } = await requireRole("driver", "/");

  // Check if the driver is verified
  const isVerified = await getVerificationStatus();

  const driver = await prisma.user.findUnique({
    where: { id: userId },
  });

  // If driver is not verified, redirect to onboarding
  if (
    !isVerified &&
    !driver?.drivingLicenseUrl &&
    !driver?.vehicleRegistrationUrl &&
    !driver?.insuranceUrl
  ) {
    redirect("/drivers/onboarding");
  }

  return (
    <div className='container mx-auto'>
      <h1 className='text-3xl font-bold mb-8'>Driver Dashboard</h1>

      <div className='grid grid-cols-1'>
        <div className='space-y-6'>
          <div className='bg-white p-6 rounded-lg shadow'>
            <h2 className='text-2xl font-semibold mb-4'>Your Performance</h2>
            <div className='grid grid-cols-2 gap-4'>
              <div className='bg-blue-50 p-4 rounded-md text-center'>
                <p className='text-sm text-blue-700'>Completed Rides</p>
                <p className='text-2xl font-bold text-blue-800'>0</p>
              </div>
              <div className='bg-green-50 p-4 rounded-md text-center'>
                <p className='text-sm text-green-700'>Rating</p>
                <p className='text-2xl font-bold text-green-800'>N/A</p>
              </div>
              <div className='bg-purple-50 p-4 rounded-md text-center'>
                <p className='text-sm text-purple-700'>Total Earnings</p>
                <p className='text-2xl font-bold text-purple-800'>$0.00</p>
              </div>
              <div className='bg-amber-50 p-4 rounded-md text-center'>
                <p className='text-sm text-amber-700'>This Month</p>
                <p className='text-2xl font-bold text-amber-800'>$0.00</p>
              </div>
            </div>
          </div>

          <div className='bg-white p-6 rounded-lg shadow'>
            <h2 className='text-2xl font-semibold mb-4'>Actions</h2>
            <div className='flex flex-wrap gap-4'>
              <Link href='/drivers/trips/new'>
                <Button className='flex items-center gap-2'>
                  <CalendarPlus className='h-4 w-4' />
                  Schedule a Ride
                </Button>
              </Link>
              <Link href='/drivers/trips'>
                <Button variant='outline' className='flex items-center gap-2'>
                  <Car className='h-4 w-4' />
                  Manage Rides
                </Button>
              </Link>
              <Link href='/drivers/earnings'>
                <Button variant='outline' className='flex items-center gap-2'>
                  <CircleDollarSign className='h-4 w-4' />
                  View Earnings
                </Button>
              </Link>
            </div>
          </div>

          <div className='bg-white p-6 rounded-lg shadow'>
            <h2 className='text-2xl font-semibold mb-4'>Upcoming Rides</h2>
            <div className='text-center py-8 text-gray-500'>
              <p>You have no upcoming rides</p>
              <Link href='/drivers/trips/new'>
                <Button className='mt-4' size='sm'>
                  Schedule a Ride
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
