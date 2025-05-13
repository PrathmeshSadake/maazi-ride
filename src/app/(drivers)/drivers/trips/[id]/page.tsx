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
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { format } from "date-fns";
import { SourceProvider } from "@/context/source-context";
import { DestinationProvider } from "@/context/destination-context";
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
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

interface User {
  id: string;
  firstName: string;
  lastName: string;
}

interface Booking {
  id: string;
  userId: string;
  status: string;
  numSeats: number;
  createdAt: string;
  user: User;
}

interface Ride {
  id: string;
  fromLocation: string;
  toLocation: string;
  departureDate: string;
  departureTime: string;
  price: number;
  availableSeats: number;
  status: string;
  description: string;
  createdAt: string;
  driver: {
    firstName: string | null;
    lastName: string | null;
    driverRating: number | null;
  };
  bookings: Booking[];
  approvedById?: string | null;
  approvedAt?: string | null;
  isScheduled: boolean;
}

export default function TripDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [trip, setTrip] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<any>(null);
  const [destination, setDestination] = useState<any>(null);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [totalConfirmedBookings, setTotalConfirmedBookings] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

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

        const data = await response.json();
        setTrip(data);

        // Set up source and destination for maps
        if (data) {
          setSource({
            name: data.fromLocation,
          });

          setDestination({
            name: data.toLocation,
          });

          // Count bookings
          const totalBookings = data.bookings.length;
          const confirmed = data.bookings.filter(
            (booking: Booking) => booking.status === "CONFIRMED"
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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-6 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleBack} variant="outline">
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Trip Details</h1>
          <p className="text-gray-500">
            Manage your scheduled trip from {trip.fromLocation} to{" "}
            {trip.toLocation}
          </p>
        </div>
        <Button onClick={handleBack} variant="outline">
          Back to Trips
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Route Information</CardTitle>
                {getStatusBadge(trip.status)}
              </div>
              <CardDescription>Trip ID: {trip.id}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col space-y-4">
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-green-600 mt-1 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Pickup Location</p>
                    <p className="font-medium">{trip.fromLocation}</p>
                  </div>
                </div>

                <div className="ml-3 border-l-2 border-dashed border-gray-300 h-8"></div>

                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-red-600 mt-1 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Dropoff Location</p>
                    <p className="font-medium">{trip.toLocation}</p>
                  </div>
                </div>
              </div>

              {source && destination && (
                <SourceProvider initialValue={source}>
                  <DestinationProvider initialValue={destination}>
                    {null /* Or any appropriate content */}
                  </DestinationProvider>
                </SourceProvider>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Schedule & Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Departure Date</p>
                    <p className="font-medium">
                      {format(new Date(trip.departureDate), "PPP")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Departure Time</p>
                    <p className="font-medium">{trip.departureTime}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <IndianRupee className="w-5 h-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Price per Seat</p>
                    <p className="font-medium">₹{trip.price.toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Users className="w-5 h-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Available Seats</p>
                    <p className="font-medium">
                      {trip.availableSeats - confirmedBookings.length} of{" "}
                      {trip.availableSeats}
                    </p>
                  </div>
                </div>
              </div>

              {trip.description && (
                <div className="mt-5">
                  <p className="text-sm text-gray-500 mb-1">Trip Description</p>
                  <p className="text-gray-700">{trip.description}</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              {canCancel && (
                <Button
                  variant="destructive"
                  onClick={() => setShowCancelDialog(true)}
                  className="w-full sm:w-auto"
                >
                  Cancel Trip
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Total Bookings</span>
                  <Badge variant="outline">{bookingsCount}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Confirmed Bookings</span>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700"
                  >
                    {confirmedBookings.length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Remaining Seats</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {trip.availableSeats - confirmedBookings.length}
                  </Badge>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Created On</span>
                  <span className="text-sm">
                    {format(new Date(trip.createdAt), "PPP")}
                  </span>
                </div>

                {trip.status === "APPROVED" && trip.approvedAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Approved On</span>
                    <span className="text-sm">
                      {format(new Date(trip.approvedAt), "PPP")}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Driver Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-500" />
                </div>
                <div className="ml-4">
                  <p className="font-medium">
                    {trip.driver.firstName || ""} {trip.driver.lastName || ""}
                  </p>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 mr-2">Rating:</span>
                    <span className="text-sm font-medium">
                      {trip.driver.driverRating?.toFixed(1) || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {trip.isScheduled && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Booking Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending">
              <TabsList className="mb-4">
                <TabsTrigger value="pending">
                  Pending ({pendingBookings.length})
                </TabsTrigger>
                <TabsTrigger value="confirmed">
                  Confirmed ({confirmedBookings.length})
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  Rejected ({rejectedBookings.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending">
                {pendingBookings.length > 0 ? (
                  <div className="space-y-4">
                    {pendingBookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-4">
                        <div className="flex justify-between mb-2">
                          <div>
                            <div className="font-medium">
                              {booking.user.firstName} {booking.user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              Requested {booking.numSeats} seat(s) on{" "}
                              {new Date(booking.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          {getStatusBadge(booking.status)}
                        </div>
                        <div className="flex space-x-2 mt-4">
                          <Button
                            size="sm"
                            onClick={() => handleApproveRequest(booking.id)}
                            disabled={isProcessing}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectRequest(booking.id)}
                            disabled={isProcessing}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                          <Link href={`/messages?userId=${booking.userId}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="ml-auto"
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Message
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-gray-500">
                    No pending booking requests
                  </div>
                )}
              </TabsContent>

              <TabsContent value="confirmed">
                {confirmedBookings.length > 0 ? (
                  <div className="space-y-4">
                    {confirmedBookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-4">
                        <div className="flex justify-between mb-2">
                          <div>
                            <div className="font-medium">
                              {booking.user.firstName} {booking.user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              Booked {booking.numSeats} seat(s)
                            </div>
                          </div>
                          {getStatusBadge(booking.status)}
                        </div>
                        <div className="flex mt-4">
                          <Link href={`/messages?userId=${booking.userId}`}>
                            <Button size="sm" variant="outline">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Message
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-gray-500">
                    No confirmed bookings
                  </div>
                )}
              </TabsContent>

              <TabsContent value="rejected">
                {rejectedBookings.length > 0 ? (
                  <div className="space-y-4">
                    {rejectedBookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-4">
                        <div className="flex justify-between mb-2">
                          <div>
                            <div className="font-medium">
                              {booking.user.firstName} {booking.user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              Requested {booking.numSeats} seat(s)
                            </div>
                          </div>
                          {getStatusBadge(booking.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-gray-500">
                    No rejected bookings
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Trip</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this trip? This action cannot be
              undone. All pending and confirmed bookings will be cancelled.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelTrip}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Yes, Cancel Trip
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
