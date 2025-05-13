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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

type Ride = {
  id: string;
  fromLocation: string;
  toLocation: string;
  departureDate: string;
  departureTime: string;
  price: number;
  availableSeats: number;
  status: string;
  bookings: Array<{ id: string; status: string }>;
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
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 whitespace-nowrap"
          >
            Pending Approval
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 whitespace-nowrap"
          >
            Approved
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 whitespace-nowrap"
          >
            Rejected
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 whitespace-nowrap"
          >
            Completed
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-700 whitespace-nowrap"
          >
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="whitespace-nowrap">
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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">My Scheduled Rides</h1>
        <Link href="/drivers/trips/new">
          <Button className="whitespace-nowrap">
            <CalendarPlus className="mr-2 h-4 w-4" />
            Schedule New Ride
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-6 w-full sm:w-auto">
          <TabsTrigger value="upcoming" className="flex-1 sm:flex-initial">
            Upcoming ({upcomingRides.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex-1 sm:flex-initial">
            Completed ({completedRides.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6">
              {[1, 2, 3].map((i) => (
                <RideSkeleton key={i} />
              ))}
            </div>
          ) : upcomingRides.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <RideSkeleton key={i} />
              ))}
            </div>
          ) : completedRides.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
  );
}

function RideCard({ ride, status }: { ride: Ride; status: React.ReactNode }) {
  return (
    <Card className="h-full flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold line-clamp-1">
            {ride.fromLocation.split(",")[0]}
            <ArrowRight className="inline h-4 w-4 mx-1" />
            {ride.toLocation.split(",")[0]}
          </CardTitle>
          {status}
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
            <span className="whitespace-nowrap">{ride.departureTime}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-start gap-1 text-gray-600">
            <MapPin className="h-4 w-4 mt-1 flex-shrink-0 text-gray-500" />
            <div className="text-sm">
              <p className="line-clamp-1 font-medium">{ride.fromLocation}</p>
              <p className="line-clamp-1 text-gray-500">{ride.toLocation}</p>
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
        <Link href={`/drivers/trips/${ride.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

function RideSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-5 w-24" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="flex justify-between pt-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="pt-2">
          <Skeleton className="h-9 w-full" />
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
    <div className="text-center py-10 px-4 border border-dashed rounded-lg">
      <Car className="h-12 w-12 mx-auto text-gray-300 mb-3" />
      <p className="text-gray-500 mb-4">{message}</p>
      {buttonText && buttonLink && (
        <Link href={buttonLink}>
          <Button>{buttonText}</Button>
        </Link>
      )}
    </div>
  );
}
