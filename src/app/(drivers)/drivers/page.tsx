import { requireRole, getVerificationStatus } from "@/lib/auth";
import { RoleManager } from "@/components/RoleManager";
import { UserProfile } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import {
  CalendarPlus,
  Car,
  CircleDollarSign,
  Calendar,
  Clock,
  MapPin,
} from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Helper function to format dates
function formatDate(dateString: string) {
  try {
    return format(new Date(dateString), "MMM d, yyyy");
  } catch (e) {
    return dateString;
  }
}

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

  // Fetch the driver's rides from the database
  const rides = await prisma.ride.findMany({
    where: {
      driverId: userId,
      status: {
        in: ["APPROVED", "PENDING_APPROVAL"],
      },
      departureDate: {
        gte: new Date(),
      },
    },
    orderBy: {
      departureDate: "asc",
    },
    take: 3, // Limit to 3 upcoming rides for the dashboard
  });

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

          <div className='bg-white'>
            <h2 className='text-2xl font-semibold mb-4'>Upcoming Rides</h2>
            {rides.length > 0 ? (
              <div className='grid grid-cols-1 gap-4'>
                {rides.map((ride) => (
                  <Card key={ride.id} className='h-full'>
                    <CardHeader className='pb-2'>
                      <div className='flex justify-between items-start'>
                        <CardTitle className='text-xl'>
                          {ride.fromLocation.split(",")[0]} to{" "}
                          {ride.toLocation.split(",")[0]}
                        </CardTitle>
                        <div
                          className={
                            ride.status === "PENDING_APPROVAL"
                              ? "text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded"
                              : "text-xs bg-green-50 text-green-700 px-2 py-1 rounded"
                          }
                        >
                          {ride.status === "PENDING_APPROVAL"
                            ? "Pending Approval"
                            : "Approved"}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      <div className='flex gap-4'>
                        <div className='flex items-center gap-2 text-gray-600'>
                          <Calendar className='h-4 w-4' />
                          <span>
                            {formatDate(ride.departureDate.toString())}
                          </span>
                        </div>
                        <div className='flex items-center gap-2 text-gray-600'>
                          <Clock className='h-4 w-4' />
                          <span>{ride.departureTime}</span>
                        </div>
                      </div>

                      <div className='flex items-center gap-2 text-gray-600'>
                        <MapPin className='h-4 w-4 text-gray-500' />
                        <div className='text-sm'>
                          <p className='truncate'>{ride.fromLocation}</p>
                          <p className='truncate'>{ride.toLocation}</p>
                        </div>
                      </div>

                      <div className='flex justify-between pt-2'>
                        <div className='flex items-center gap-2'>
                          <CircleDollarSign className='h-4 w-4 text-gray-500' />
                          <span className='font-semibold'>
                            ${ride.price.toFixed(2)}
                          </span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Car className='h-4 w-4 text-gray-500' />
                          <span>{ride.availableSeats} seats</span>
                        </div>
                      </div>

                      <div className='pt-2'>
                        <Link href={`/drivers/trips/${ride.id}`}>
                          <Button variant='outline' className='w-full'>
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <div className='text-center mt-4'>
                  <Link href='/drivers/trips'>
                    <Button variant='link'>View all rides</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className='text-center py-8 text-gray-500'>
                <p>You have no upcoming rides</p>
                <Link href='/drivers/trips/new'>
                  <Button className='mt-4' size='sm'>
                    Schedule a Ride
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
