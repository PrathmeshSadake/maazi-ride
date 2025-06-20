import { requireRole, getVerificationStatus } from "@/lib/auth";
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
  Activity,
  BadgeDollarSign,
  BookOpen,
  Wallet,
  Menu,
  Bell,
} from "lucide-react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
    <div className="min-h-screen bg-gray-50">
      {/* Driver Info */}
      <div className="bg-white border-b mb-4">
        <div className="px-4 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Driver Dashboard
              </h2>
              <p className="text-sm text-gray-500">
                Welcome back,{" "}
                <span className="font-medium text-gray-700">
                  {driver?.name || "Driver"}
                </span>
              </p>
            </div>
            <Link href="/drivers/trips/new">
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-1.5"
              >
                <CalendarPlus className="h-3.5 w-3.5" />
                <span className="text-sm">Schedule</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-0">
        <div className="space-y-4">
          {/* Performance Overview Card */}
          {/* <Card className="overflow-hidden border-gray-200">
            <CardHeader className="bg-white border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base font-semibold">
                  <span className="flex items-center">
                    <Activity className="h-4 w-4 mr-2 text-blue-600" />
                    Performance Overview
                  </span>
                </CardTitle>
                <Badge
                  variant="outline"
                  className="text-xs text-blue-600 border-blue-200 bg-blue-50"
                >
                  Current Month
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-gray-500">
                    Completed Rides
                  </span>
                  <span className="text-2xl font-bold mt-1">0</span>
                  <span className="text-[10px] text-green-600 mt-1">
                    +0% from last month
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-xs font-medium text-gray-500">
                    Rating
                  </span>
                  <div className="flex items-center mt-1">
                    <span className="text-2xl font-bold">N/A</span>
                    <Star className="h-4 w-4 text-amber-400 ml-1" />
                  </div>
                  <span className="text-[10px] text-gray-500 mt-1">
                    No ratings yet
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-xs font-medium text-gray-500">
                    Total Earnings
                  </span>
                  <span className="text-2xl font-bold mt-1">₹0</span>
                  <span className="text-[10px] text-green-600 mt-1">
                    Lifetime earnings
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-xs font-medium text-gray-500">
                    This Month
                  </span>
                  <span className="text-2xl font-bold mt-1">₹0</span>
                  <span className="text-[10px] text-gray-500 mt-1">
                    May 2024
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-medium text-gray-500">
                    Monthly Goal
                  </span>
                  <span className="text-xs font-medium text-gray-700">
                    ₹0/₹10,000
                  </span>
                </div>
                <Progress value={0} className="h-2" />
              </div>
            </CardContent>
          </Card> */}

          {/* Quick Actions Card */}
          <Card className="border-gray-200">
            <CardHeader className="">
              <CardTitle className="text-base font-semibold">
                Quick Actions
              </CardTitle>
              <CardDescription className="text-xs">
                Manage your driver account
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-2">
              <Link href="/drivers/trips/new" className="w-full">
                <Button className="w-full h-12 justify-start gap-3 bg-blue-600 hover:bg-blue-700 text-sm">
                  <CalendarPlus className="h-4 w-4" />
                  <span>Schedule New Ride</span>
                </Button>
              </Link>

              <Link href="/drivers/trips" className="w-full">
                <Button
                  variant="outline"
                  className="w-full h-12 justify-start gap-3 border-gray-200 text-gray-800 hover:bg-gray-50 text-sm"
                >
                  <Car className="h-4 w-4 text-gray-500" />
                  <span>Manage Rides</span>
                </Button>
              </Link>

              <Link href="/drivers/earnings" className="w-full">
                <Button
                  variant="outline"
                  className="w-full h-12 justify-start gap-3 border-gray-200 text-gray-800 hover:bg-gray-50 text-sm"
                >
                  <Wallet className="h-4 w-4 text-gray-500" />
                  <span>View Earnings</span>
                </Button>
              </Link>

              <Link href="/drivers/bookings" className="w-full">
                <Button
                  variant="outline"
                  className="w-full h-12 justify-start gap-3 border-gray-200 text-gray-800 hover:bg-gray-50 text-sm"
                >
                  <BookOpen className="h-4 w-4 text-gray-500" />
                  <span>Manage Bookings</span>
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Booking Requests Card */}
          <Card className="border-gray-200">
            <CardHeader className="">
              <CardTitle className="text-base font-semibold flex items-center">
                <BadgeDollarSign className="h-4 w-4 mr-2 text-blue-600" />
                Booking Requests
              </CardTitle>
            </CardHeader>
            <CardContent className="">
              <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-1">
                    Manage Passenger Requests
                  </h3>
                  <p className="text-xs text-gray-600 mb-3">
                    Review and respond to booking requests from passengers
                  </p>
                  <Link href="/drivers/bookings">
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 w-full text-sm"
                    >
                      View Requests
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Rides Card */}
          <Card className="border-gray-200">
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="text-base font-semibold flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                Upcoming Rides
              </CardTitle>
              <Link href="/drivers/trips">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 h-8"
                >
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="">
              {rides.length > 0 ? (
                <div className="space-y-3">
                  {rides.map((ride) => (
                    <div
                      key={ride.id}
                      className="bg-white rounded-lg border border-gray-100 overflow-hidden"
                    >
                      <div className="p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start space-x-2">
                            <div className="bg-blue-100 p-1.5 rounded-full mt-1">
                              <Car className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-gray-900">
                                {ride.fromLocation.split(",")[0]}
                                <ArrowRight className="inline h-3 w-3 mx-1 text-gray-400" />
                                {ride.toLocation.split(",")[0]}
                              </h3>
                              <div className="flex items-center text-xs text-gray-500 mt-1">
                                <Calendar className="h-3 w-3 mr-1" />
                                {format(ride.departureDate, "MMM d, yyyy")}
                                <span className="mx-1">•</span>
                                <Clock className="h-3 w-3 mr-1" />
                                {ride.departureTime}
                              </div>
                            </div>
                          </div>
                          <Badge className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-800 hover:bg-green-200 border-0">
                            Active
                          </Badge>
                        </div>

                        <Separator className="my-2" />

                        <div className="grid grid-cols-3 gap-2 my-2">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500">
                              Price
                            </span>
                            <span className="text-xs font-medium text-gray-900 flex items-center mt-0.5">
                              <IndianRupee className="h-3 w-3 mr-0.5" />
                              {ride.price.toLocaleString("en-IN")}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500">
                              Distance
                            </span>
                            <span className="text-xs font-medium text-gray-900 mt-0.5">
                              N/A
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500">
                              Seats
                            </span>
                            <span className="text-xs font-medium text-gray-900 flex items-center mt-0.5">
                              <Users className="h-3 w-3 mr-0.5" />
                              {ride.availableSeats}
                            </span>
                          </div>
                        </div>

                        <div className="mt-2">
                          <Link
                            href={`/drivers/trips/${ride.id}`}
                            className="w-full"
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-blue-200 text-blue-600 hover:bg-blue-50 w-full text-xs"
                            >
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  <Car className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                  <h3 className="text-sm font-medium text-gray-900 mb-1">
                    No upcoming rides
                  </h3>
                  <p className="text-xs text-gray-500 mb-4 max-w-xs mx-auto">
                    Schedule your first ride to start earning
                  </p>
                  <Link href="/drivers/trips/new">
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-sm"
                    >
                      Schedule a Ride
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card className="border-gray-200">
            <CardHeader className="">
              <CardTitle className="text-base font-semibold">
                Tips & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="bg-amber-100 p-1.5 rounded-full flex-shrink-0">
                    <Star className="h-3 w-3 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Complete your profile
                    </h3>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      Riders are more likely to book with drivers who have
                      complete profiles
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="bg-green-100 p-1.5 rounded-full flex-shrink-0">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Schedule regular rides
                    </h3>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      Consistent scheduling helps you build a reliable customer
                      base
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="bg-purple-100 p-1.5 rounded-full flex-shrink-0">
                    <Users className="h-3 w-3 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Respond quickly
                    </h3>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      Fast responses to booking requests improve your acceptance
                      rate
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-2 py-1.5 z-10">
        <div className="flex justify-around items-center">
          <Link
            href="/drivers"
            className="flex flex-col items-center py-1 px-3 text-blue-600"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <Calendar className="h-5 w-5" />
            </div>
            <span className="text-[10px] mt-0.5 font-medium">Dashboard</span>
          </Link>

          <Link
            href="/drivers/trips"
            className="flex flex-col items-center py-1 px-3 text-gray-500"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <Car className="h-5 w-5" />
            </div>
            <span className="text-[10px] mt-0.5">Rides</span>
          </Link>

          <Link
            href="/drivers/messages"
            className="flex flex-col items-center py-1 px-3 text-gray-500 relative"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <BadgeDollarSign className="h-5 w-5" />
            </div>
            <span className="text-[10px] mt-0.5">Messages</span>
            <span className="absolute top-0 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-[8px] font-bold text-white">2</span>
            </span>
          </Link>

          <Link
            href="/drivers/account"
            className="flex flex-col items-center py-1 px-3 text-gray-500"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-[10px] mt-0.5">Account</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
