"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import {
  CalendarPlus,
  Car,
  Clock,
  MapPin,
  Calendar,
  IndianRupee,
  Users,
  ArrowRight,
  ChevronLeft,
  Phone,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

type Ride = {
  id: string;
  fromLocation: string;
  toLocation: string;
  departureDate: string;
  departureTime: string;
  price: number;
  availableSeats: number;
  status: string;
  bookings: Array<{
    id: string;
    status: string;
    phoneNumber?: string;
    user: {
      id: string;
      name: string;
      phone?: string;
    };
  }>;
};

export default function TripsPage() {
  const router = useRouter();
  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const response = await fetch("/api/rides");
        if (response.ok) {
          const data = await response.json();
          setRides(data);
        } else {
          toast.error("Failed to load rides");
        }
      } catch (error) {
        console.error("Error fetching rides:", error);
        toast.error("An error occurred while loading rides");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRides();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING_APPROVAL":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-0 text-xs px-2 py-0.5">
            Pending
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge className="bg-green-100 text-green-800 border-0 text-xs px-2 py-0.5">
            Approved
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-red-100 text-red-800 border-0 text-xs px-2 py-0.5">
            Rejected
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-0 text-xs px-2 py-0.5">
            Completed
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge className="bg-gray-100 text-gray-800 border-0 text-xs px-2 py-0.5">
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-0 text-xs px-2 py-0.5">
            {status}
          </Badge>
        );
    }
  };

  // Filter rides by status
  const upcomingRides = rides.filter(
    (ride) => !["COMPLETED", "CANCELLED"].includes(ride.status)
  );

  const completedRides = rides.filter((ride) =>
    ["COMPLETED", "CANCELLED"].includes(ride.status)
  );

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Page Header */}
      <div className="bg-white border-b mb-4">
        <div className="px-4 py-4">
          <div className="flex items-center mb-4">
            <button onClick={() => router.back()} className="mr-2">
              <ChevronLeft className="h-5 w-5 text-gray-500" />
            </button>
            <h1 className="text-xl font-bold">My Rides</h1>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Manage your scheduled rides
            </div>
            <Link href="/drivers/trips/new">
              <Button
                size="sm"
                className="text-xs h-8 flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
              >
                <CalendarPlus className="h-3.5 w-3.5" />
                Schedule
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="px-4">
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="mb-4 w-full grid grid-cols-2 h-10">
            <TabsTrigger value="upcoming" className="text-sm">
              Upcoming ({upcomingRides.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-sm">
              Completed ({completedRides.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <RideSkeleton key={i} />
                ))}
              </div>
            ) : upcomingRides.length > 0 ? (
              <div className="space-y-3">
                {upcomingRides.map((ride) => (
                  <RideCard
                    key={ride.id}
                    ride={ride}
                    status={getStatusBadge(ride.status)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                message="You don't have any upcoming rides"
                buttonText="Schedule a ride"
                buttonLink="/drivers/trips/new"
              />
            )}
          </TabsContent>

          <TabsContent value="completed">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <RideSkeleton key={i} />
                ))}
              </div>
            ) : completedRides.length > 0 ? (
              <div className="space-y-3">
                {completedRides.map((ride) => (
                  <RideCard
                    key={ride.id}
                    ride={ride}
                    status={getStatusBadge(ride.status)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState message="No completed rides" />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function RideCard({ ride, status }: { ride: Ride; status: React.ReactNode }) {
  return (
    <Card className="border-gray-200 hover:border-gray-300 transition-all overflow-hidden">
      <CardContent className="p-3">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-start space-x-2">
            <div className="bg-blue-100 p-1.5 rounded-full mt-0.5">
              <Car className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                {ride.fromLocation.split(",")[0]}
                <ArrowRight className="inline h-3 w-3 mx-1 text-gray-400" />
                {ride.toLocation.split(",")[0]}
              </h3>
              <div className="flex items-center text-xs text-gray-500 mt-0.5">
                <Calendar className="h-3 w-3 mr-1" />
                {format(new Date(ride.departureDate), "MMM d, yyyy")}
                <span className="mx-1">•</span>
                <Clock className="h-3 w-3 mr-1" />
                {ride.departureTime}
              </div>
            </div>
          </div>
          {status}
        </div>

        <Separator className="my-2" />

        <div className="grid grid-cols-3 gap-2 my-2">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500">Price</span>
            <span className="text-xs font-medium text-gray-900 flex items-center mt-0.5">
              <IndianRupee className="h-3 w-3 mr-0.5" />
              {ride.price.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500">Bookings</span>
            <span className="text-xs font-medium text-gray-900 mt-0.5">
              {ride.bookings?.length || 0}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500">Seats</span>
            <span className="text-xs font-medium text-gray-900 flex items-center mt-0.5">
              <Users className="h-3 w-3 mr-0.5" />
              {ride.availableSeats}
            </span>
          </div>
        </div>

        {/* Show passenger details for confirmed bookings */}
        {ride.bookings &&
          ride.bookings.some((booking) => booking.status === "CONFIRMED") && (
            <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="text-xs font-medium text-green-800 mb-2">
                Confirmed Passengers
              </h4>
              <div className="space-y-2">
                {ride.bookings
                  .filter((booking) => booking.status === "CONFIRMED")
                  .map((booking, index) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center text-green-700">
                        <User size={12} className="mr-1" />
                        <span className="font-medium">{booking.user.name}</span>
                      </div>
                      <div className="flex items-center text-green-700">
                        <Phone size={12} className="mr-1" />
                        <span>
                          {booking.phoneNumber ||
                            booking.user.phone ||
                            "Not provided"}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

        <div className="flex gap-2 mt-3">
          <Link href={`/drivers/trips/${ride.id}`} className="flex-1">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              View Details
            </Button>
          </Link>
          {ride.status === "PENDING_APPROVAL" && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs border-red-200 text-red-600 hover:bg-red-50"
            >
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function RideSkeleton() {
  return (
    <Card className="border-gray-200 overflow-hidden">
      <CardContent className="p-3">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-start space-x-2">
            <Skeleton className="h-7 w-7 rounded-full" />
            <div>
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>

        <Separator className="my-2" />

        <div className="grid grid-cols-3 gap-2 my-2">
          <div>
            <Skeleton className="h-3 w-10 mb-1" />
            <Skeleton className="h-4 w-14" />
          </div>
          <div>
            <Skeleton className="h-3 w-10 mb-1" />
            <Skeleton className="h-4 w-8" />
          </div>
          <div>
            <Skeleton className="h-3 w-10 mb-1" />
            <Skeleton className="h-4 w-8" />
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <Skeleton className="h-8 w-full rounded" />
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({
  message,
  buttonText,
  buttonLink,
}: {
  message: string;
  buttonText?: string;
  buttonLink?: string;
}) {
  return (
    <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-200">
      <Car className="h-10 w-10 mx-auto mb-3 text-gray-300" />
      <h3 className="text-sm font-medium text-gray-900 mb-1">{message}</h3>
      {buttonText && buttonLink && (
        <div className="mt-4">
          <Link href={buttonLink}>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-sm">
              {buttonText}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
