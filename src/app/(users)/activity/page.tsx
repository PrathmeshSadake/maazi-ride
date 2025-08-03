"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  Clock,
  Info,
  MessageCircle,
  Navigation,
  Phone,
  Star,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Driver {
  id: string;
  name: string;
  driverRating?: number;
  phone?: string;
  upiId?: string;
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

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  let color, text;

  switch (status) {
    case "COMPLETED":
      color =
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900";
      text = "Completed";
      break;
    case "PENDING":
      color =
        "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900";
      text = "Pending";
      break;
    case "CANCELLED":
      color =
        "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900";
      text = "Cancelled";
      break;
    default:
      color = "bg-gray-50 text-gray-700 border-gray-200";
      text = status;
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${color}`}
    >
      {text}
    </div>
  );
}

// Ride Card Component
function RideCard({ ride, onClick }: { ride: Ride; onClick: () => void }) {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className="mb-4 py-0 overflow-hidden border-border hover:shadow-md transition-all cursor-pointer"
        onClick={onClick}
      >
        <CardContent className="p-0">
          <div className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-gray-500" />
                  <h3 className="font-medium text-foreground">
                    {formatDate(ride.departureDate)}
                  </h3>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Clock size={14} className="text-gray-500" />
                  <p className="text-sm text-muted-foreground">
                    {ride.departureTime}
                  </p>
                </div>
              </div>
              <StatusBadge status={ride.status} />
            </div>

            <div className="space-y-3 mt-4">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <div className="size-2 rounded-full bg-blue-500"></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {ride.fromLocation}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <div className="size-2 rounded-full bg-red-500"></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {ride.toLocation}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 p-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="font-medium">₹{ride.price}</span>
            </div>
            <div className="flex items-center">
              {ride.driver && (
                <div className="flex items-center mr-3">
                  <div className="size-6 rounded-full bg-gray-200 mr-2 flex items-center justify-center text-xs font-medium">
                    {ride.driver.name.charAt(0)}
                  </div>
                  <span className="text-sm">
                    {ride.booking?.numSeats || 1} seat
                    {(ride.booking?.numSeats || 1) > 1 ? "s" : ""}
                  </span>
                </div>
              )}
              <Button variant="ghost" size="sm" className="text-primary">
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Empty State Component
function EmptyState({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center h-[calc(100vh-220px)] text-center"
    >
      <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Info className="size-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-1">{message}</h3>
      <p className="text-sm text-muted-foreground">
        Your rides will appear here once you book them
      </p>
      <Button className="mt-6">Book a Ride</Button>
    </motion.div>
  );
}

export default function ActivityPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

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

  const handleRideClick = (ride: Ride) => {
    setSelectedRide(ride);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 mb-6 animate-pulse">
            <div className="flex gap-2 mb-4">
              <div className="h-10 bg-gray-200 rounded flex-1"></div>
              <div className="h-10 bg-gray-200 rounded flex-1"></div>
              <div className="h-10 bg-gray-200 rounded flex-1"></div>
            </div>
          </div>

          {[1, 2, 3].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-sm p-4 mb-4 animate-pulse"
            >
              <div className="flex justify-between mb-4">
                <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                <div className="h-5 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="space-y-3 mb-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
              <div className="h-12 bg-gray-200 rounded w-full"></div>
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
            <AnimatePresence>
              {rides.length === 0 ? (
                <EmptyState message="No ride history found" />
              ) : (
                <ScrollArea className="h-[calc(100vh-220px)]">
                  {rides.map((ride) => (
                    <RideCard
                      key={ride.id}
                      ride={ride}
                      onClick={() => handleRideClick(ride)}
                    />
                  ))}
                </ScrollArea>
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <AnimatePresence>
              {pastRides.length === 0 ? (
                <EmptyState message="No completed rides" />
              ) : (
                <ScrollArea className="h-[calc(100vh-220px)]">
                  {pastRides.map((ride) => (
                    <RideCard
                      key={ride.id}
                      ride={ride}
                      onClick={() => handleRideClick(ride)}
                    />
                  ))}
                </ScrollArea>
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="upcoming" className="mt-6">
            <AnimatePresence>
              {upcomingRides.length === 0 ? (
                <EmptyState message="No upcoming rides" />
              ) : (
                <ScrollArea className="h-[calc(100vh-220px)]">
                  {upcomingRides.map((ride) => (
                    <RideCard
                      key={ride.id}
                      ride={ride}
                      onClick={() => handleRideClick(ride)}
                    />
                  ))}
                </ScrollArea>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </div>

      {/* Ride Details Drawer */}
      <Drawer open={isDetailOpen} onOpenChange={handleCloseDetail}>
        <DrawerContent className="max-h-[90vh]">
          {selectedRide && (
            <>
              <DrawerHeader>
                <DrawerTitle className="text-xl">Ride Details</DrawerTitle>
                <DrawerDescription>
                  {formatDate(selectedRide.departureDate)} •{" "}
                  {selectedRide.departureTime}
                </DrawerDescription>
              </DrawerHeader>

              <div className="py-6 px-4 space-y-6 overflow-y-auto">
                {/* Status Badge */}
                <div className="flex justify-center">
                  <StatusBadge status={selectedRide.status} />
                </div>

                {/* Route */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="space-y-6 relative">
                    <div className="absolute left-[11px] top-[28px] bottom-[28px] w-[2px] bg-gray-200"></div>

                    <div className="flex items-start gap-3">
                      <div className="relative z-10 mt-1 bg-white p-1 rounded-full border border-blue-500">
                        <div className="size-2 rounded-full bg-blue-500"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Pickup
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedRide.fromLocation}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="relative z-10 mt-1 bg-white p-1 rounded-full border border-red-500">
                        <div className="size-2 rounded-full bg-red-500"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Dropoff
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedRide.toLocation}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button variant="outline" size="sm">
                      <Navigation size={16} className="mr-1" /> View Map
                    </Button>
                  </div>
                </div>

                {/* Driver Info */}
                {selectedRide.driver && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Driver</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="size-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-lg font-medium">
                            {selectedRide.driver.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold">
                            {selectedRide.driver.name}
                          </p>
                          {selectedRide.driver.driverRating && (
                            <div className="flex items-center gap-1 text-yellow-500">
                              <Star size={14} className="fill-current" />
                              <span className="text-sm">
                                {selectedRide.driver.driverRating}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {selectedRide.driver?.phone && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.open(
                                `tel:${selectedRide.driver?.phone?.replace(/\D/g, "")}`,
                                "_self"
                              )
                            }
                          >
                            <Phone size={16} />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/messages/direct/${selectedRide.driver?.id}`
                            )
                          }
                        >
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
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-1 border-b border-gray-200">
                      <span className="text-gray-600">Seats</span>
                      <span className="font-semibold">
                        {selectedRide.booking?.numSeats || 1}
                      </span>
                    </div>
                    {selectedRide.driver?.upiId && (
                      <div className="flex justify-between items-center py-1 border-b border-gray-200">
                        <span className="text-gray-600">Driver UPI ID</span>
                        <span className="font-semibold text-blue-600">
                          {selectedRide.driver.upiId}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-600">Total Amount</span>
                      <span className="font-semibold text-lg">
                        ₹{selectedRide.price}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  {selectedRide.status === "PENDING" && (
                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                      Contact Driver
                    </Button>
                  )}

                  {selectedRide.status === "COMPLETED" && (
                    <>
                      <Button variant="outline" className="flex-1">
                        Rate Driver
                      </Button>
                      <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                        Book Again
                      </Button>
                    </>
                  )}

                  {selectedRide.status === "CANCELLED" && (
                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                      Book New Ride
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
