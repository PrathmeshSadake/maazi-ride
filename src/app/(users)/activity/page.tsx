"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Clock,
  X,
  Calendar,
  ChevronRight,
  ArrowLeft,
  Info,
} from "lucide-react";
import { format, isPast } from "date-fns";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Driver {
  id: string;
  name: string;
}

interface Booking {
  id: string;
  numSeats: number;
}

interface Ride {
  id: string;
  fromLocation: string;
  toLocation: string;
  departureDate: string;
  departureTime: string;
  price: number;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  driver?: Driver;
  booking?: Booking;
}

export default function ActivityPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    } else if (status === "authenticated") {
      fetchRides();
    }
  }, [status, router]);

  const fetchRides = async () => {
    try {
      const response = await fetch("/api/rides/history");
      if (!response.ok) throw new Error("Failed to fetch ride history");
      const data = await response.json();
      setRides(data);
    } catch (error) {
      console.error("Error fetching ride history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRideStatusColor = (status: string): string => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  if (status === "loading" || loading) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <div className="flex items-center mb-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mr-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-xl font-bold">Activity</h1>
        </div>

        <Tabs defaultValue="all" className="w-full mb-6">
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">
              All
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex-1">
              Completed
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="flex-1">
              Upcoming
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {[1, 2, 3].map((_, i) => (
          <div key={i} className="mb-4">
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  // Separate rides into past and upcoming
  const now = new Date();
  const pastRides = rides.filter((ride) => new Date(ride.departureDate) < now);
  const upcomingRides = rides.filter(
    (ride) => new Date(ride.departureDate) >= now
  );

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="flex items-center mb-4">
        <Button variant="ghost" onClick={() => router.back()} className="mr-2">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-xl font-bold">Activity</h1>
      </div>

      <Tabs defaultValue="all" className="w-full mb-6">
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1">
            All
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex-1">
            Completed
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex-1">
            Upcoming
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          {rides.length === 0 ? (
            <div className="p-6 text-center bg-white rounded-lg shadow-sm border">
              <Info size={40} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500">No ride history found</p>
            </div>
          ) : (
            rides.map((ride) => (
              <RideCard
                key={ride.id}
                ride={ride}
                onClick={() => router.push(`/rides/${ride.id}`)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          {pastRides.length === 0 ? (
            <div className="p-6 text-center bg-white rounded-lg shadow-sm border">
              <Info size={40} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500">No completed rides</p>
            </div>
          ) : (
            pastRides.map((ride) => (
              <RideCard
                key={ride.id}
                ride={ride}
                onClick={() => router.push(`/rides/${ride.id}`)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="mt-4">
          {upcomingRides.length === 0 ? (
            <div className="p-6 text-center bg-white rounded-lg shadow-sm border">
              <Info size={40} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500">No upcoming rides</p>
            </div>
          ) : (
            upcomingRides.map((ride) => (
              <RideCard
                key={ride.id}
                ride={ride}
                onClick={() => router.push(`/rides/${ride.id}`)}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface RideCardProps {
  ride: Ride;
  onClick: () => void;
}

function RideCard({ ride, onClick }: RideCardProps) {
  const getRideStatusColor = (status: string): string => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center mb-1">
            <Calendar size={16} className="text-gray-500 mr-1" />
            <span className="text-sm text-gray-600">
              {formatDate(ride.departureDate)}
            </span>
            <span className="mx-2 text-gray-300">•</span>
            <Clock size={16} className="text-gray-500 mr-1" />
            <span className="text-sm text-gray-600">{ride.departureTime}</span>
          </div>
          <h3 className="font-medium">
            {ride.fromLocation} → {ride.toLocation}
          </h3>
        </div>
        <Badge className={getRideStatusColor(ride.status)}>{ride.status}</Badge>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Avatar className="w-8 h-8 mr-2">
            <AvatarFallback>{ride.driver?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{ride.driver?.name}</p>
            <p className="text-xs text-gray-500">Driver</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold">₹{ride.price}</p>
          {ride.booking && ride.booking.numSeats > 1 && (
            <p className="text-xs text-gray-500">
              {ride.booking.numSeats} seats
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
