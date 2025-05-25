import { requireRole, getVerificationStatus } from "@/lib/auth";
import { RoleManager } from "@/components/RoleManager";
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
  Star,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/auth";

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

  // Check if the driver is verified from database
  // const isVerified = await getVerificationStatus();

  const driver = await prisma.user.findUnique({
    where: { id: userId },
  });

  // If driver is not verified, redirect to onboarding
  if (!driver?.isVerified) {
    // redirect("/drivers/onboarding");
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
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      {/* Page Header */}
      <div className="p-4 pb-2">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">
            Welcome back, {driver?.name || "Driver"}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-6">
        {/* Performance Stats */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
              Your Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-xl text-white">
                <p className="text-sm opacity-90">Completed Rides</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-xl text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Rating</p>
                    <p className="text-2xl font-bold">N/A</p>
                  </div>
                  <Star className="h-6 w-6 opacity-80" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-xl text-white">
                <p className="text-sm opacity-90">Total Earnings</p>
                <p className="text-2xl font-bold">₹0.00</p>
              </div>
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 rounded-xl text-white">
                <p className="text-sm opacity-90">This Month</p>
                <p className="text-2xl font-bold">₹0.00</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/drivers/trips/new">
                <Button className="w-full h-16 flex flex-col items-center justify-center space-y-1 bg-blue-600 hover:bg-blue-700">
                  <CalendarPlus className="h-6 w-6" />
                  <span className="text-sm font-medium">Schedule Ride</span>
                </Button>
              </Link>

              <Link href="/drivers/trips">
                <Button
                  variant="outline"
                  className="w-full h-16 flex flex-col items-center justify-center space-y-1 border-2 hover:bg-gray-50"
                >
                  <Car className="h-6 w-6" />
                  <span className="text-sm font-medium">Manage Rides</span>
                </Button>
              </Link>

              <Link href="/drivers/earnings">
                <Button
                  variant="outline"
                  className="w-full h-16 flex flex-col items-center justify-center space-y-1 border-2 hover:bg-gray-50"
                >
                  <IndianRupee className="h-6 w-6" />
                  <span className="text-sm font-medium">View Earnings</span>
                </Button>
              </Link>

              <Link href="/drivers/bookings">
                <Button
                  variant="outline"
                  className="w-full h-16 flex flex-col items-center justify-center space-y-1 border-2 hover:bg-gray-50"
                >
                  <Users className="h-6 w-6" />
                  <span className="text-sm font-medium">Bookings</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Booking Requests */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">
              Booking Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">
                  Manage your ride booking requests
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  Accept or reject passenger requests
                </p>
              </div>
              <Link href="/drivers/bookings">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Manage
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Rides */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">
              Upcoming Rides
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rides.length > 0 ? (
              <div className="space-y-4">
                {rides.map((ride) => (
                  <Card
                    key={ride.id}
                    className="border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base font-semibold line-clamp-1">
                          {ride.fromLocation.split(",")[0]}
                          <ArrowRight className="inline h-4 w-4 mx-1" />
                          {ride.toLocation.split(",")[0]}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
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

                    <CardFooter className="pt-2">
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
                    <Button variant="link" className="text-blue-600">
                      View all rides
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Car className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">No upcoming rides</p>
                <p className="text-sm mb-4">
                  Start by scheduling your first ride
                </p>
                <Link href="/drivers/trips/new">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Schedule a Ride
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
