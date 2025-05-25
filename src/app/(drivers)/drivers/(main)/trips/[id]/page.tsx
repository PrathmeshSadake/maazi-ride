"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  CalendarIcon,
  Clock,
  MapPin,
  IndianRupee,
  Users,
  CircleCheck,
  CircleX,
  Calendar,
  Info,
  Navigation,
  User,
  Check,
  X,
  MessageSquare,
  ChevronLeft,
  MoreVertical,
  Menu,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { format } from "date-fns";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GoogleMapsPreview } from "@/components/ui/google-maps-preview";

interface Booking {
  id: string;
  status: string;
  numSeats: number;
  createdAt: string;
  userId: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

interface Driver {
  firstName: string;
  lastName: string;
  driverRating?: number;
}

interface Trip {
  id: string;
  fromLocation: string;
  toLocation: string;
  fromLatitude: number;
  fromLongitude: number;
  toLatitude: number;
  toLongitude: number;
  departureDate: string;
  departureTime: string;
  price: number;
  availableSeats: number;
  description?: string;
  status: string;
  createdAt: string;
  approvedAt?: string;
  bookings: Booking[];
  driver: Driver;
}

interface Location {
  name: string;
  lat: number;
  lng: number;
}

// Helper to format status badges
const getStatusBadge = (status: string) => {
  switch (status) {
    case "REJECTED":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700">
          Rejected
        </Badge>
      );
    case "COMPLETED":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          Completed
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700">
          Cancelled
        </Badge>
      );
    case "CONFIRMED":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700">
          Confirmed
        </Badge>
      );
    case "PENDING":
    case "PENDING_APPROVAL":
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
          Pending
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function TripDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [totalConfirmedBookings, setTotalConfirmedBookings] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  console.log(source, destination);
  console.log(trip);
  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        const tripId = params.id;
        const response = await fetch(`/api/rides/${tripId}`);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch trip details: ${response.statusText}`
          );
        }

        const data: Trip = await response.json();
        setTrip(data);

        // Set up source and destination for maps
        if (data) {
          setSource({
            name: data.fromLocation,
            lat: data.fromLatitude,
            lng: data.fromLongitude,
          });

          setDestination({
            name: data.toLocation,
            lat: data.toLatitude,
            lng: data.toLongitude,
          });

          // Count bookings
          const totalBookings = data.bookings.length;
          const confirmed = data.bookings.filter(
            (booking) => booking.status === "CONFIRMED"
          ).length;
          setBookingsCount(totalBookings);
          setTotalConfirmedBookings(confirmed);
        }
      } catch (err) {
        console.error("Error fetching trip details:", err);
        setError("Failed to load trip details. Please try again later.");
        toast.error("Failed to load trip details");
      } finally {
        setLoading(false);
      }
    };

    fetchTripDetails();
  }, [params.id]);

  const handleBack = () => {
    router.push("/drivers/trips");
  };

  const handleCancelTrip = async () => {
    try {
      const response = await fetch(`/api/rides/${params.id}/cancel`, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error("Failed to cancel trip");
      }

      toast.success("Trip cancelled successfully");
      router.refresh();
      // Refresh the trip data
      const updatedTrip = await response.json();
      setTrip(updatedTrip);
    } catch (err) {
      console.error("Error cancelling trip:", err);
      toast.error("Failed to cancel trip");
    }
  };

  const handleApproveRequest = async (bookingId: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/bookings?id=${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "CONFIRMED",
        }),
      });

      if (response.ok) {
        toast.success("Booking request approved!");
        // Refresh ride details
        const updatedRideResponse = await fetch(`/api/rides/${params.id}`);
        if (updatedRideResponse.ok) {
          const updatedRide = await updatedRideResponse.json();
          setTrip(updatedRide);
        }
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to approve request");
      }
    } catch (error) {
      console.error("Error approving request:", error);
      toast.error("An error occurred while approving the request");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectRequest = async (bookingId: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/bookings?id=${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "REJECTED",
        }),
      });

      if (response.ok) {
        toast.success("Booking request rejected");
        // Refresh ride details
        const updatedRideResponse = await fetch(`/api/rides/${params.id}`);
        if (updatedRideResponse.ok) {
          const updatedRide = await updatedRideResponse.json();
          setTrip(updatedRide);
        }
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to reject request");
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("An error occurred while rejecting the request");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-md mx-auto px-4 py-4">
        <div className="mb-4">
          <Skeleton className="h-8 w-36 mb-2" />
          <Skeleton className="h-5 w-48" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-36 mb-2" />
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-md mx-auto px-4 py-4">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleBack} variant="outline" className="w-full">
              Go Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!trip) return null;

  const departureDate = new Date(trip.departureDate);
  const isPastTrip = departureDate < new Date();
  const canCancel =
    !isPastTrip && trip.status !== "CANCELLED" && trip.status !== "COMPLETED";

  const pendingBookings = trip.bookings.filter(
    (booking) =>
      booking.status === "PENDING" || booking.status === "PENDING_APPROVAL"
  );

  const confirmedBookings = trip.bookings.filter(
    (booking) => booking.status === "CONFIRMED"
  );

  const rejectedBookings = trip.bookings.filter(
    (booking) => booking.status === "REJECTED" || booking.status === "CANCELLED"
  );

  // Mobile optimized trip details view
  return (
    <div className="container max-w-md mx-auto px-4 py-4 pb-16">
      {/* Top navigation with back button */}
      <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 py-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="rounded-full"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Trip Details</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canCancel && (
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => setShowCancelDialog(true)}
              >
                Cancel Trip
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => router.push("/drivers/trips")}>
              All Trips
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Status Card with Route Info */}
      <Card className="mb-4 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">
              {trip.fromLocation} to {trip.toLocation}
            </CardTitle>
            {getStatusBadge(trip.status)}
          </div>
          <CardDescription className="text-xs">
            ID: {trip.id.substring(0, 8)}...
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col space-y-3 mt-2">
            <div className="flex items-start">
              <MapPin className="w-4 h-4 text-green-600 mt-1 mr-2 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">From</p>
                <p className="text-sm font-medium">{trip.fromLocation}</p>
              </div>
            </div>

            <div className="ml-3 border-l-2 border-dashed border-gray-300 h-4"></div>

            <div className="flex items-start">
              <MapPin className="w-4 h-4 text-red-600 mt-1 mr-2 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">To</p>
                <p className="text-sm font-medium">{trip.toLocation}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="text-sm font-medium">
                  {format(new Date(trip.departureDate), "MMM d, yyyy")}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <Clock className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Time</p>
                <p className="text-sm font-medium">{trip.departureTime}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Tab Navigation */}
      <div className="mb-4">
        <Tabs
          defaultValue="details"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="bookings">
              Bookings{" "}
              {trip.bookings.length > 0 ? `(${trip.bookings.length})` : ""}
            </TabsTrigger>
            <TabsTrigger value="driver">Driver</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4 mt-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Trip Information</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center">
                    <IndianRupee className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Price</p>
                      <p className="text-sm font-medium">
                        ₹{trip.price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Users className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Seats</p>
                      <p className="text-sm font-medium">
                        {trip.availableSeats - confirmedBookings.length}/
                        {trip.availableSeats}
                      </p>
                    </div>
                  </div>
                </div>

                {trip.description && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-1">Description</p>
                    <p className="text-sm text-gray-700">{trip.description}</p>
                  </div>
                )}

                {/* Add Google Maps Preview */}
                {source && destination && (
                  <div className="mt-4">
                    <GoogleMapsPreview
                      source={source}
                      destination={destination}
                      className="w-full h-48 rounded-lg overflow-hidden"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Status Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Total Bookings
                    </span>
                    <Badge variant="outline">{bookingsCount}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Confirmed</span>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700"
                    >
                      {confirmedBookings.length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Remaining</span>
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700"
                    >
                      {trip.availableSeats - confirmedBookings.length}
                    </Badge>
                  </div>
                </div>

                <Separator className="my-3" />

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Created</span>
                    <span className="text-xs">
                      {format(new Date(trip.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>

                  {trip.status === "APPROVED" && trip.approvedAt && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Approved</span>
                      <span className="text-xs">
                        {format(new Date(trip.approvedAt), "MMM d, yyyy")}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
              {canCancel && (
                <CardFooter className="pt-0">
                  <Button
                    variant="destructive"
                    onClick={() => setShowCancelDialog(true)}
                    className="w-full text-sm"
                    size="sm"
                  >
                    Cancel Trip
                  </Button>
                </CardFooter>
              )}
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="mt-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Booking Requests</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Tabs defaultValue="pending" className="w-full">
                  <TabsList className="grid grid-cols-3 w-full mb-3 h-8">
                    <TabsTrigger value="pending" className="text-xs">
                      Pending ({pendingBookings.length})
                    </TabsTrigger>
                    <TabsTrigger value="confirmed" className="text-xs">
                      Confirmed ({confirmedBookings.length})
                    </TabsTrigger>
                    <TabsTrigger value="rejected" className="text-xs">
                      Rejected ({rejectedBookings.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="pending">
                    {pendingBookings.length > 0 ? (
                      <div className="space-y-3">
                        {pendingBookings.map((booking) => (
                          <div
                            key={booking.id}
                            className="border rounded-lg p-3"
                          >
                            <div className="flex justify-between mb-2">
                              <div>
                                <div className="font-medium text-sm">
                                  {booking.user.firstName}{" "}
                                  {booking.user.lastName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {booking.numSeats} seat(s) •{" "}
                                  {new Date(
                                    booking.createdAt
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                              {getStatusBadge(booking.status)}
                            </div>
                            <div className="flex space-x-2 mt-3">
                              <Button
                                size="sm"
                                onClick={() => handleApproveRequest(booking.id)}
                                disabled={isProcessing}
                                className="bg-green-600 hover:bg-green-700 text-xs h-8 px-2"
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectRequest(booking.id)}
                                disabled={isProcessing}
                                className="text-red-600 border-red-600 hover:bg-red-50 text-xs h-8 px-2"
                              >
                                <X className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                              <Link href={`/messages?userId=${booking.userId}`}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-8 ml-auto px-2"
                                >
                                  <MessageSquare className="h-3 w-3 mr-1" />
                                  Message
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-center text-gray-500 text-sm">
                        No pending booking requests
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="confirmed">
                    {confirmedBookings.length > 0 ? (
                      <div className="space-y-3">
                        {confirmedBookings.map((booking) => (
                          <div
                            key={booking.id}
                            className="border rounded-lg p-3"
                          >
                            <div className="flex justify-between mb-2">
                              <div>
                                <div className="font-medium text-sm">
                                  {booking.user.firstName}{" "}
                                  {booking.user.lastName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {booking.numSeats} seat(s)
                                </div>
                              </div>
                              {getStatusBadge(booking.status)}
                            </div>
                            <div className="flex mt-3">
                              <Link href={`/messages?userId=${booking.userId}`}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-8"
                                >
                                  <MessageSquare className="h-3 w-3 mr-1" />
                                  Message
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-center text-gray-500 text-sm">
                        No confirmed bookings
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="rejected">
                    {rejectedBookings.length > 0 ? (
                      <div className="space-y-3">
                        {rejectedBookings.map((booking) => (
                          <div
                            key={booking.id}
                            className="border rounded-lg p-3"
                          >
                            <div className="flex justify-between mb-2">
                              <div>
                                <div className="font-medium text-sm">
                                  {booking.user.firstName}{" "}
                                  {booking.user.lastName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {booking.numSeats} seat(s)
                                </div>
                              </div>
                              {getStatusBadge(booking.status)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-center text-gray-500 text-sm">
                        No rejected bookings
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Driver Tab */}
          <TabsContent value="driver" className="mt-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Driver Information</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-gray-500" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-sm">
                      {trip.driver.firstName || ""} {trip.driver.lastName || ""}
                    </p>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500 mr-1">
                        Rating:
                      </span>
                      <span className="text-xs font-medium">
                        {trip.driver.driverRating?.toFixed(1) || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="w-[90%] max-w-md mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Trip</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this trip? This action cannot be
              undone. All pending and confirmed bookings will be cancelled.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto mt-0">
              Keep Trip
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelTrip}
              className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
            >
              Yes, Cancel Trip
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
