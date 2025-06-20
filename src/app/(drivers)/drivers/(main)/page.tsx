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
  MessageCircle,
  User,
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
      {/* Header */}
      <div className="bg-white">
        <div className="px-4 pt-8 pb-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Welcome back, {driver?.name || "Driver"}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Link href="/drivers/account/notifications">
                <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <Bell className="w-4 h-4 text-gray-600" />
                </button>
              </Link>
              <Link href="/drivers/trips/new">
                <button className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium">
                  Schedule
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-20 space-y-4">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              Quick Actions
            </h2>
          </div>
          <div className="p-4 gap-3 grid">
            <Link href="/drivers/trips/new">
              <button className="w-full flex items-center p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                  <CalendarPlus className="w-4 h-4" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-sm">Schedule New Ride</div>
                  <div className="text-xs text-blue-100 mt-0.5">
                    Create your next trip
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-white/60" />
              </button>
            </Link>

            <div className="grid grid-cols-2 gap-3">
              <Link href="/drivers/trips" className="w-full">
                <button className="flex flex-col items-center w-full py-2.5 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors">
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mb-1.5">
                    <Car className="w-3.5 h-3.5 text-gray-600" />
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    My Rides
                  </div>
                  <div className="text-xs text-gray-500">Manage trips</div>
                </button>
              </Link>

              <Link href="/drivers/bookings" className="w-full">
                <button className="flex flex-col items-center w-full py-2.5 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors">
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mb-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-gray-600" />
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    Bookings
                  </div>
                  <div className="text-xs text-gray-500">View requests</div>
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Booking Requests */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
          <div className="flex items-start">
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
              <BadgeDollarSign className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-amber-800 text-sm mb-1">
                New Booking Requests
              </h3>
              <p className="text-amber-600 text-xs mb-3">
                You have pending requests from passengers. Review and respond
                quickly to maintain your rating.
              </p>
              <Link href="/drivers/bookings">
                <button className="px-3 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 active:bg-amber-700 transition-colors">
                  View Requests
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Upcoming Rides */}
        <div className="bg-white rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-base font-semibold text-gray-900">
              Upcoming Rides
            </h2>
            <Link href="/drivers/trips">
              <button className="text-blue-600 text-sm font-medium">
                View All
              </button>
            </Link>
          </div>
          <div className="p-4">
            {rides.length > 0 ? (
              <div className="space-y-3">
                {rides.map((ride) => (
                  <div
                    key={ride.id}
                    className="border border-gray-100 rounded-lg p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                          <Car className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">
                            {ride.fromLocation.split(",")[0]} →{" "}
                            {ride.toLocation.split(",")[0]}
                          </div>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Calendar className="w-3 h-3 mr-1" />
                            {format(ride.departureDate, "MMM d, yyyy")}
                            <span className="mx-2">•</span>
                            <Clock className="w-3 h-3 mr-1" />
                            {ride.departureTime}
                          </div>
                        </div>
                      </div>
                      <div className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        Active
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-gray-100">
                      <div>
                        <div className="text-xs text-gray-500">Price</div>
                        <div className="text-sm font-medium text-gray-900 mt-0.5">
                          ₹{ride.price.toLocaleString("en-IN")}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Seats</div>
                        <div className="text-sm font-medium text-gray-900 mt-0.5">
                          {ride.availableSeats} available
                        </div>
                      </div>
                      <div>
                        <Link href={`/drivers/trips/${ride.id}`}>
                          <button className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 active:bg-blue-200 transition-colors">
                            View
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Car className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  No upcoming rides
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  Schedule your first ride to start earning
                </p>
                <Link href="/drivers/trips/new">
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium">
                    Schedule a Ride
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Tips & Recommendations */}
        <div className="bg-white rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              Tips for Success
            </h2>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-start">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <Star className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900 text-sm">
                  Complete your profile
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Riders prefer drivers with complete profiles and photos
                </div>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900 text-sm">
                  Schedule regular rides
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Consistent scheduling helps build a reliable customer base
                </div>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <MessageCircle className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900 text-sm">
                  Respond quickly to requests
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Fast responses improve your acceptance rate and earnings
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex justify-around items-center px-2 py-2">
          <Link
            href="/drivers"
            className="flex flex-col items-center py-1 px-3"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-blue-600 mt-0.5">
              Dashboard
            </span>
          </Link>

          <Link
            href="/drivers/trips"
            className="flex flex-col items-center py-1 px-3"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <Car className="w-5 h-5 text-gray-400" />
            </div>
            <span className="text-xs text-gray-400 mt-0.5">Rides</span>
          </Link>

          <Link
            href="/drivers/messages"
            className="flex flex-col items-center py-1 px-3 relative"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-gray-400" />
            </div>
            <span className="text-xs text-gray-400 mt-0.5">Messages</span>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">2</span>
            </div>
          </Link>

          <Link
            href="/drivers/account"
            className="flex flex-col items-center py-1 px-3"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <User className="w-5 h-5 text-gray-400" />
            </div>
            <span className="text-xs text-gray-400 mt-0.5">Account</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
