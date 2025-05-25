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
  MapPin,
  User,
  Phone,
  MessageCircle,
  Star,
  Navigation,
} from "lucide-react";
import { format, isPast } from "date-fns";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";

interface Driver {
  id: string;
  name: string;
  driverRating?: number;
  phone?: string;
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
  fromLatitude?: number;
  fromLongitude?: number;
  toLatitude?: number;
  toLongitude?: number;
}

export default function ActivityPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);

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
        return "bg-green-100 text-green-800 border-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      case "PENDING":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="bg-white shadow-sm border-b border-gray-100">
          <div className="max-w-md mx-auto px-4 py-4">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" className="mr-2">
                <ArrowLeft size={20} />
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Activity</h1>
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 py-6">
          <Tabs defaultValue="all" className="w-full mb-6">
            <TabsList className="w-full bg-white/60 backdrop-blur-sm">
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
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          ))}
        </div>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="mr-2"
              >
                <ArrowLeft size={20} />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Activity</h1>
                <p className="text-sm text-gray-600">Your ride history</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        <Tabs defaultValue="all" className="w-full mb-6">
          <TabsList className="w-full bg-white/60 backdrop-blur-sm border border-gray-200">
            <TabsTrigger
              value="all"
              className="flex-1 data-[state=active]:bg-white"
            >
              All ({rides.length})
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="flex-1 data-[state=active]:bg-white"
            >
              Completed ({pastRides.length})
            </TabsTrigger>
            <TabsTrigger
              value="upcoming"
              className="flex-1 data-[state=active]:bg-white"
            >
              Upcoming ({upcomingRides.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {rides.length === 0 ? (
              <EmptyState message="No ride history found" />
            ) : (
              <div className="space-y-4">
                {rides.map((ride) => (
                  <RideCard
                    key={ride.id}
                    ride={ride}
                    onClick={() => setSelectedRide(ride)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            {pastRides.length === 0 ? (
              <EmptyState message="No completed rides" />
            ) : (
              <div className="space-y-4">
                {pastRides.map((ride) => (
                  <RideCard
                    key={ride.id}
                    ride={ride}
                    onClick={() => setSelectedRide(ride)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="mt-6">
            {upcomingRides.length === 0 ? (
              <EmptyState message="No upcoming rides" />
            ) : (
              <div className="space-y-4">
                {upcomingRides.map((ride) => (
                  <RideCard
                    key={ride.id}
                    ride={ride}
                    onClick={() => setSelectedRide(ride)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Ride Details Sheet */}
      <Sheet open={!!selectedRide} onOpenChange={() => setSelectedRide(null)}>
        <SheetContent side="bottom" className="h-auto max-h-[90vh]">
          {selectedRide && (
            <>
              <SheetHeader>
                <SheetTitle>Ride Details</SheetTitle>
              </SheetHeader>

              <div className="py-6 space-y-6">
                {/* Status Badge */}
                <div className="flex justify-center">
                  <Badge
                    className={`${getRideStatusColor(
                      selectedRide.status
                    )} px-4 py-2 text-sm font-medium border`}
                  >
                    {selectedRide.status}
                  </Badge>
                </div>

                {/* Route */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                        <span className="font-semibold text-gray-900">
                          {selectedRide.fromLocation}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                        <span className="font-semibold text-gray-900">
                          {selectedRide.toLocation}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Navigation size={16} />
                    </Button>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar size={16} className="text-gray-600" />
                      <span className="text-sm text-gray-600">Date</span>
                    </div>
                    <p className="font-semibold">
                      {formatDate(selectedRide.departureDate)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock size={16} className="text-gray-600" />
                      <span className="text-sm text-gray-600">Time</span>
                    </div>
                    <p className="font-semibold">
                      {selectedRide.departureTime}
                    </p>
                  </div>
                </div>

                {/* Driver Info */}
                {selectedRide.driver && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Driver</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-blue-600 text-white">
                            {selectedRide.driver.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">
                            {selectedRide.driver.name}
                          </p>
                          {selectedRide.driver.driverRating && (
                            <div className="flex items-center gap-1">
                              <Star
                                size={14}
                                className="text-yellow-500 fill-current"
                              />
                              <span className="text-sm text-gray-600">
                                {selectedRide.driver.driverRating}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Phone size={16} />
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageCircle size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Booking Details */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Booking Details
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Seats</span>
                      <span className="font-semibold">
                        {selectedRide.booking?.numSeats || 1}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount</span>
                      <span className="font-semibold text-lg">
                        ₹{selectedRide.price}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {selectedRide.status === "PENDING" && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      variant="outline"
                      className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                    >
                      Cancel Ride
                    </Button>
                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                      Contact Driver
                    </Button>
                  </div>
                )}

                {selectedRide.status === "COMPLETED" && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button variant="outline" className="flex-1">
                      Rate Driver
                    </Button>
                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                      Book Again
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
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
        return "bg-green-100 text-green-800 border-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      case "PENDING":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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
    <Card
      className="cursor-pointer hover:shadow-lg transition-all duration-200 border-0 bg-white/80 backdrop-blur-sm hover:bg-white/90"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={14} className="text-gray-500" />
              <span className="text-sm text-gray-600">
                {formatDate(ride.departureDate)}
              </span>
              <span className="text-gray-300">•</span>
              <Clock size={14} className="text-gray-500" />
              <span className="text-sm text-gray-600">
                {ride.departureTime}
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="font-semibold text-gray-900 text-sm">
                  {ride.fromLocation}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                <span className="font-semibold text-gray-900 text-sm">
                  {ride.toLocation}
                </span>
              </div>
            </div>
          </div>
          <Badge
            className={`${getRideStatusColor(ride.status)} text-xs border`}
          >
            {ride.status}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                {ride.driver?.name?.charAt(0) || "D"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {ride.driver?.name || "Driver"}
              </p>
              <p className="text-xs text-gray-500">
                {ride.booking?.numSeats && ride.booking.numSeats > 1
                  ? `${ride.booking.numSeats} seats`
                  : "1 seat"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">₹{ride.price}</p>
            <ChevronRight size={16} className="text-gray-400 ml-auto" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card className="border-0 bg-white/60 backdrop-blur-sm">
      <CardContent className="p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Info size={32} className="text-gray-400" />
        </div>
        <p className="text-gray-600 font-medium">{message}</p>
        <p className="text-sm text-gray-500 mt-1">
          Your rides will appear here once you book them
        </p>
      </CardContent>
    </Card>
  );
}
