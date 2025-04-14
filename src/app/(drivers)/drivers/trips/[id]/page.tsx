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
} from "lucide-react";
import { format } from "date-fns";
import GoogleMapsSection from "@/components/drivers/google-maps-section";
import { SourceProvider } from "@/context/source-context";
import { DestinationProvider } from "@/context/destination-context";

// Helper to format status badges
const getStatusBadge = (status: string) => {
  switch (status) {
    case "PENDING_APPROVAL":
      return (
        <Badge variant='outline' className='bg-yellow-50 text-yellow-700'>
          Pending Approval
        </Badge>
      );
    case "APPROVED":
      return (
        <Badge variant='outline' className='bg-green-50 text-green-700'>
          Approved
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge variant='outline' className='bg-red-50 text-red-700'>
          Rejected
        </Badge>
      );
    case "COMPLETED":
      return (
        <Badge variant='outline' className='bg-blue-50 text-blue-700'>
          Completed
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge variant='outline' className='bg-gray-50 text-gray-700'>
          Cancelled
        </Badge>
      );
    default:
      return <Badge variant='outline'>{status}</Badge>;
  }
};

interface Booking {
  id: string;
  status: string;
}

interface Ride {
  id: string;
  fromLocation: string;
  toLocation: string;
  fromLat: number;
  fromLng: number;
  toLat: number;
  toLng: number;
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
  const [confirmedBookings, setConfirmedBookings] = useState(0);

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
            lat: data.fromLat,
            lng: data.fromLng,
            name: data.fromLocation,
          });

          setDestination({
            lat: data.toLat,
            lng: data.toLng,
            name: data.toLocation,
          });

          // Count bookings
          const totalBookings = data.bookings.length;
          const confirmed = data.bookings.filter(
            (booking: Booking) => booking.status === "CONFIRMED"
          ).length;
          setBookingsCount(totalBookings);
          setConfirmedBookings(confirmed);
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
    if (!confirm("Are you sure you want to cancel this trip?")) return;

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

  if (loading) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='mb-8'>
          <Skeleton className='h-10 w-48 mb-2' />
          <Skeleton className='h-6 w-64' />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className='h-8 w-48 mb-2' />
            <Skeleton className='h-4 w-32' />
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <Skeleton className='h-24 w-full' />
              <Skeleton className='h-16 w-full' />
              <Skeleton className='h-16 w-full' />
              <Skeleton className='h-48 w-full' />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <Card className='border-red-200 bg-red-50'>
          <CardHeader>
            <CardTitle className='text-red-700'>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleBack} variant='outline'>
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

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='flex justify-between items-center mb-8'>
        <div>
          <h1 className='text-3xl font-bold'>Trip Details</h1>
          <p className='text-gray-500'>
            Manage your scheduled trip from {trip.fromLocation} to{" "}
            {trip.toLocation}
          </p>
        </div>
        <Button onClick={handleBack} variant='outline'>
          Back to Trips
        </Button>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2 space-y-6'>
          <Card>
            <CardHeader>
              <div className='flex justify-between items-center'>
                <CardTitle>Route Information</CardTitle>
                {getStatusBadge(trip.status)}
              </div>
              <CardDescription>Trip ID: {trip.id}</CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='flex flex-col space-y-4'>
                <div className='flex items-start'>
                  <MapPin className='w-5 h-5 text-green-600 mt-1 mr-2' />
                  <div>
                    <p className='text-sm text-gray-500'>Pickup Location</p>
                    <p className='font-medium'>{trip.fromLocation}</p>
                  </div>
                </div>

                <div className='ml-3 border-l-2 border-dashed border-gray-300 h-8'></div>

                <div className='flex items-start'>
                  <MapPin className='w-5 h-5 text-red-600 mt-1 mr-2' />
                  <div>
                    <p className='text-sm text-gray-500'>Dropoff Location</p>
                    <p className='font-medium'>{trip.toLocation}</p>
                  </div>
                </div>
              </div>

              {source && destination && (
                <SourceProvider initialValue={source}>
                  <DestinationProvider initialValue={destination}>
                    <GoogleMapsSection />
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
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='flex items-center'>
                  <Calendar className='w-5 h-5 text-gray-500 mr-3' />
                  <div>
                    <p className='text-sm text-gray-500'>Departure Date</p>
                    <p className='font-medium'>
                      {format(new Date(trip.departureDate), "PPP")}
                    </p>
                  </div>
                </div>

                <div className='flex items-center'>
                  <Clock className='w-5 h-5 text-gray-500 mr-3' />
                  <div>
                    <p className='text-sm text-gray-500'>Departure Time</p>
                    <p className='font-medium'>{trip.departureTime}</p>
                  </div>
                </div>

                <div className='flex items-center'>
                  <IndianRupee className='w-5 h-5 text-gray-500 mr-3' />
                  <div>
                    <p className='text-sm text-gray-500'>Price per Seat</p>
                    <p className='font-medium'>₹{trip.price.toFixed(2)}</p>
                  </div>
                </div>

                <div className='flex items-center'>
                  <Users className='w-5 h-5 text-gray-500 mr-3' />
                  <div>
                    <p className='text-sm text-gray-500'>Available Seats</p>
                    <p className='font-medium'>
                      {trip.availableSeats - confirmedBookings} of{" "}
                      {trip.availableSeats}
                    </p>
                  </div>
                </div>
              </div>

              {trip.description && (
                <div className='mt-5'>
                  <p className='text-sm text-gray-500 mb-1'>Trip Description</p>
                  <p className='text-gray-700'>{trip.description}</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              {canCancel && (
                <Button
                  variant='destructive'
                  onClick={handleCancelTrip}
                  className='w-full sm:w-auto'
                >
                  Cancel Trip
                </Button>
              )}
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Enhanced Map View</CardTitle>
              <CardDescription>
                Interactive map with route details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {source && destination && (
                <SourceProvider initialValue={source}>
                  <DestinationProvider initialValue={destination}>
                    <GoogleMapsSection />
                  </DestinationProvider>
                </SourceProvider>
              )}
            </CardContent>
          </Card>
        </div>

        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Booking Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-500'>Total Bookings</span>
                  <Badge variant='outline'>{bookingsCount}</Badge>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-500'>Confirmed Bookings</span>
                  <Badge
                    variant='outline'
                    className='bg-green-50 text-green-700'
                  >
                    {confirmedBookings}
                  </Badge>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-500'>Remaining Seats</span>
                  <Badge variant='outline' className='bg-blue-50 text-blue-700'>
                    {trip.availableSeats - confirmedBookings}
                  </Badge>
                </div>
              </div>

              <Separator className='my-4' />

              <div className='space-y-3'>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-500'>Created On</span>
                  <span className='text-sm'>
                    {format(new Date(trip.createdAt), "PPP")}
                  </span>
                </div>

                {trip.status === "APPROVED" && trip.approvedAt && (
                  <div className='flex justify-between items-center'>
                    <span className='text-gray-500'>Approved On</span>
                    <span className='text-sm'>
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
              <div className='flex items-center'>
                <div className='w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center'>
                  <User className='w-6 h-6 text-gray-500' />
                </div>
                <div className='ml-4'>
                  <p className='font-medium'>
                    {trip.driver.firstName || ""} {trip.driver.lastName || ""}
                  </p>
                  <div className='flex items-center'>
                    <span className='text-sm text-gray-500 mr-2'>Rating:</span>
                    <span className='text-sm font-medium'>
                      {trip.driver.driverRating?.toFixed(1) || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
