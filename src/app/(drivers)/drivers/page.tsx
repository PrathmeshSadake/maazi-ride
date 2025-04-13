import { requireRole, getVerificationStatus } from "@/lib/auth";
import { RoleManager } from "@/components/RoleManager";
import { UserProfile } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

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
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold mb-8'>Driver Dashboard</h1>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='md:col-span-2 space-y-6'>
          <div className='bg-white p-6 rounded-lg shadow'>
            <h2 className='text-2xl font-semibold mb-4'>Your Performance</h2>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
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
                <Button>Offer New Ride</Button>
              </Link>
              <Link href='/drivers/trips'>
                <Button variant='outline'>Manage Trips</Button>
              </Link>
              <Link href='/drivers/earnings'>
                <Button variant='outline'>View Earnings</Button>
              </Link>
            </div>
          </div>

          <div className='bg-white p-6 rounded-lg shadow'>
            <h2 className='text-2xl font-semibold mb-4'>Upcoming Trips</h2>
            <div className='text-center py-8 text-gray-500'>
              <p>You have no upcoming trips</p>
              <Link href='/drivers/trips/new'>
                <Button className='mt-4' size='sm'>
                  Offer a Ride
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className='space-y-6'>
          <div className='bg-white p-6 rounded-lg shadow'>
            <h2 className='text-xl font-semibold mb-4'>Account Status</h2>
            <div className='mb-4'>
              <RoleManager />
            </div>
          </div>

          <div className='bg-white p-6 rounded-lg shadow'>
            <h2 className='text-xl font-semibold mb-4'>Profile Settings</h2>
            <UserProfile
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none p-0",
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
