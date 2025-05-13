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
  IndianRupee,
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-8">Driver Dashboard</h1>

      <div className="grid grid-cols-1">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">Your Performance</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-md text-center">
                <p className="text-sm text-blue-700">Completed Rides</p>
                <p className="text-2xl font-bold text-blue-800">0</p>
              </div>
              <div className="bg-green-50 p-4 rounded-md text-center">
                <p className="text-sm text-green-700">Rating</p>
                <p className="text-2xl font-bold text-green-800">N/A</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-md text-center">
                <p className="text-sm text-purple-700">Total Earnings</p>
                <p className="text-2xl font-bold text-purple-800">₹0.00</p>
              </div>
              <div className="bg-amber-50 p-4 rounded-md text-center">
                <p className="text-sm text-amber-700">This Month</p>
                <p className="text-2xl font-bold text-amber-800">₹0.00</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">Actions</h2>
            <div className="flex flex-wrap gap-4">
              <Link href="/drivers/trips/new">
                <Button className="flex items-center gap-2">
                  <CalendarPlus className="h-4 w-4" />
                  Schedule a Ride
                </Button>
              </Link>
              <Link href="/drivers/trips">
                <Button variant="outline" className="flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Manage Rides
                </Button>
              </Link>
              <Link href="/drivers/earnings">
                <Button variant="outline" className="flex items-center gap-2">
                  <IndianRupee className="h-4 w-4" />
                  View Earnings
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">Booking Requests</h2>

            {/* Fetch pending booking requests to display count */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Manage your ride booking requests
                </p>
                <p className="font-semibold text-blue-600">
                  Accept or reject passenger requests
                </p>
              </div>
              <Link href="/drivers/bookings">
                <Button className="flex items-center gap-2">
                  Manage Bookings
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-white">
            <h2 className="text-2xl font-semibold mb-4">Upcoming Rides</h2>
            {rides.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {rides.map((ride) => (
                  <Card className="h-full flex flex-col overflow-hidden transition-shadow hover:shadow-md">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg font-semibold line-clamp-1">
                          {ride.fromLocation.split(",")[0]}
                          <ArrowRight className="inline h-4 w-4 mx-1" />
                          {ride.toLocation.split(",")[0]}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-0 flex-1">
                      <div className="flex flex-wrap gap-3 mb-3">
                        <div className="flex items-center gap-1 text-gray-600 text-sm">
                          <Calendar className="h-4 w-4 flex-shrink-0" />
                          <span className="whitespace-nowrap">
                            {format(ride.departureDate, "MMM d, yyyy")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600 text-sm">
                          <Clock className="h-4 w-4 flex-shrink-0" />
                          <span className="whitespace-nowrap">
                            {ride.departureTime}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-start gap-1 text-gray-600">
                          <MapPin className="h-4 w-4 mt-1 flex-shrink-0 text-gray-500" />
                          <div className="text-sm">
                            <p className="line-clamp-1 font-medium">
                              {ride.fromLocation}
                            </p>
                            <p className="line-clamp-1 text-gray-500">
                              {ride.toLocation}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between mt-4">
                        <div className="flex items-center gap-1">
                          <IndianRupee className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <span className="font-semibold">
                            ₹{ride.price.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <span>{ride.availableSeats} seats</span>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="pt-4 mt-auto">
                      <Link
                        href={`/drivers/trips/${ride.id}`}
                        className="w-full"
                      >
                        <Button variant="outline" className="w-full">
                          View Details
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}

                <div className="text-center mt-4">
                  <Link href="/drivers/trips">
                    <Button variant="link">View all rides</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>You have no upcoming rides</p>
                <Link href="/drivers/trips/new">
                  <Button className="mt-4" size="sm">
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
