"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Car,
  Star,
  MessageSquare,
  Share2,
  IndianRupee,
  MapPin,
  Phone,
  Navigation,
  Info,
  CheckCircle,
  AlertCircle,
  Minus,
  Plus,
  Mail,
  UserCheck,
  Languages,
  Music,
  Cigarette,
  Heart,
  Wind,
  Fuel,
  Settings,
  Hash,
  Award,
  CalendarDays,
  Shield,
  Wifi,
  Bluetooth,
  Volume2,
} from "lucide-react";
import { formatDistanceToNow, format, parseISO } from "date-fns";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface RideDetails {
  id: string;
  fromLocation: string;
  toLocation: string;
  departureDate: string;
  departureTime: string;
  price: number;
  availableSeats: number;
  description: string | null;
  driver: {
    id: string;
    name: string | null; // API returns 'name', not firstName/lastName
    driverRating: number | null;
    ridesCompleted: number;
    vehicle?: {
      id: string;
      make: string;
      model: string;
      year?: number;
      color?: string;
      licensePlate?: string; // Schema uses 'licensePlate', not 'plateNumber'
      vehicleImages: string[];
    };
  };
}

export default function RideDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const id = params.id as string;

  const [ride, setRide] = useState<RideDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numSeats, setNumSeats] = useState(1);
  const [bookingStatus, setBookingStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [showBookingSheet, setShowBookingSheet] = useState(false);
  const [showDriverSheet, setShowDriverSheet] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRideDetails();
    }
  }, [id]);

  // Debug hook to monitor vehicle data
  useEffect(() => {
    if (ride?.driver?.vehicle) {
      console.log("Vehicle data in state:", ride.driver.vehicle);
      console.log("Vehicle images:", ride.driver.vehicle.vehicleImages);
    }
  }, [ride]);

  const fetchRideDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/rides/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch ride details");
      }

      const data = await response.json();
      console.log("Ride details data:", JSON.stringify(data, null, 2));

      // Ensure vehicle data is properly accessed
      if (data.driver && !data.driver.vehicle) {
        // Try to fetch vehicle separately with public mode
        try {
          const vehicleResponse = await fetch(
            `/api/drivers/${data.driver.id}/vehicle?mode=public`
          );
          if (vehicleResponse.ok) {
            const vehicleData = await vehicleResponse.json();
            console.log("Fetched vehicle data separately:", vehicleData);
            // Modify the data object to include vehicle
            data.driver.vehicle = vehicleData;
          }
        } catch (vehicleError) {
          console.error("Error fetching vehicle data:", vehicleError);
        }
      }

      setRide(data);
    } catch (err) {
      console.error("Error fetching ride details:", err);
      setError("Failed to load ride details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!session || !session.user) {
      router.push("/auth/sign-in");
      return;
    }

    if (!ride) return;

    setBookingStatus("loading");

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rideId: ride.id,
          numSeats,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to book ride");
      }

      const bookingData = await response.json();
      setBookingStatus("success");

      // Close booking sheet and navigate after a delay
      setTimeout(() => {
        setShowBookingSheet(false);
        router.push(
          `/messages/direct/${ride.driver.id}?rideId=${ride.id}&bookingId=${bookingData.id}`
        );
      }, 2000);
    } catch (err) {
      console.error("Error booking ride:", err);
      setBookingStatus("error");
    }
  };

  const handleContactDriver = () => {
    if (!ride) return;

    // First check if there's an existing booking
    fetch(`/api/bookings/check?rideId=${ride.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.booking) {
          // If booking exists, go to messages with this booking
          router.push(
            `/messages/direct/${ride.driver.id}?rideId=${ride.id}&bookingId=${data.booking.id}`
          );
        } else {
          // Otherwise, go to messages with just driver info
          router.push(`/messages/direct/${ride.driver.id}?rideId=${ride.id}`);
        }
      })
      .catch((err) => {
        console.error("Error checking booking:", err);
        // Fallback to simple messaging
        router.push(`/messages/direct/${ride.driver.id}?rideId=${ride.id}`);
      });
  };

  const goBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center pb-20">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-muted-foreground font-medium">
          Loading ride details...
        </p>
      </div>
    );
  }

  if (error || !ride) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center pb-20">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
          <AlertCircle size={32} className="text-destructive" />
        </div>
        <p className="text-destructive font-medium mb-4">
          {error || "Ride not found"}
        </p>
        <Button onClick={goBack}>Go Back</Button>
      </div>
    );
  }

  const formattedDate = format(
    parseISO(ride.departureDate),
    "EEEE, dd MMMM yyyy"
  );
  const totalPrice = ride.price * numSeats;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={goBack}>
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">
              Ride Details
            </h1>
            <Button variant="ghost" size="sm">
              <Share2 size={20} />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Route & Price Card */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            {/* Date & Time */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {formattedDate}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {ride.departureTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Route */}
            <div className="relative mb-6">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <div className="w-0.5 h-8 bg-border my-2"></div>
                  <div className="w-4 h-4 bg-destructive rounded-full"></div>
                </div>
                <div className="flex-1 space-y-8">
                  <div>
                    <p className="font-semibold text-foreground">
                      {ride.fromLocation}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Pickup location
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {ride.toLocation}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Drop-off location
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Navigation size={16} />
                </Button>
              </div>
            </div>

            {/* Price & Seats */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-primary" />
                <span className="font-medium text-foreground">
                  {ride.availableSeats} seats available
                </span>
              </div>
              <div className="flex items-center gap-1 text-2xl font-bold text-primary">
                <IndianRupee size={24} />
                <span>{ride.price}</span>
                <span className="text-sm font-normal text-muted-foreground">
                  /seat
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Info */}
        {ride.driver.vehicle && (
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Vehicle
                </h3>
                <div className="flex items-center gap-2">
                  <Car size={18} className="text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {ride.driver.vehicle.make} {ride.driver.vehicle.model}
                    {ride.driver.vehicle.year &&
                      ` (${ride.driver.vehicle.year})`}
                  </span>
                </div>
              </div>

              {ride.driver.vehicle.color && (
                <div className="mb-4">
                  <Badge variant="outline" className="bg-gray-50">
                    {ride.driver.vehicle.color}
                  </Badge>
                </div>
              )}

              {/* Vehicle Images */}
              {ride.driver.vehicle.vehicleImages &&
                Array.isArray(ride.driver.vehicle.vehicleImages) &&
                ride.driver.vehicle.vehicleImages.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">
                      Photos
                    </h4>
                    <div className="flex overflow-x-auto gap-3 pb-2">
                      {ride.driver.vehicle.vehicleImages.map((image, index) => {
                        const imageUrl = image.startsWith("http")
                          ? image
                          : image.startsWith("/")
                          ? `${window.location.origin}${image}`
                          : `${window.location.origin}/${image}`;

                        return (
                          <div
                            key={index}
                            className="min-w-[160px] h-[100px] rounded-xl overflow-hidden border border-gray-200 flex-shrink-0"
                          >
                            <img
                              src={imageUrl}
                              alt={`${ride.driver.vehicle?.make || "Vehicle"} ${
                                ride.driver.vehicle?.model || "image"
                              }`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error(
                                  `Error loading image: ${imageUrl}`
                                );
                                e.currentTarget.src =
                                  "https://via.placeholder.com/160x100?text=Vehicle+Image";
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>
        )}

        {/* Driver Info */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="w-16 h-16 ring-2 ring-primary/20">
                <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                  {ride.driver.name
                    ?.split(" ")
                    .map((n) => n.charAt(0))
                    .join("")
                    .slice(0, 2) || "D"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-foreground truncate">
                      {ride.driver.name}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <div className="flex items-center gap-1">
                        <Star
                          size={14}
                          className="text-yellow-500 fill-current"
                        />
                        <span className="font-medium">
                          {ride.driver.driverRating?.toFixed(1) || "New"}
                        </span>
                      </div>
                      <span>•</span>
                      <span>{ride.driver.ridesCompleted} rides</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDriverSheet(true)}
                      className="h-9 w-9 p-0"
                    >
                      <Info size={16} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleContactDriver}
                      className="h-9 w-9 p-0"
                    >
                      <MessageSquare size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trip Details */}
        {ride.description && (
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Trip Details
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {ride.description}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Fixed Bottom Booking Button */}
      <div className="fixed bottom-16 left-0 right-0 bg-card border-t shadow-lg">
        <div className="max-w-md mx-auto p-4">
          <Sheet open={showBookingSheet} onOpenChange={setShowBookingSheet}>
            <SheetTrigger asChild>
              <Button className="w-full py-4 font-semibold text-lg rounded-xl shadow-sm">
                Request to Book
              </Button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="h-auto max-h-[85vh] min-h-[50vh] flex flex-col"
            >
              <SheetHeader className="flex-shrink-0">
                <SheetTitle>Book Your Ride</SheetTitle>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto py-6 px-1 space-y-6">
                {/* Route Summary */}
                <div className="bg-muted rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-foreground">
                      {ride.fromLocation}
                    </span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-semibold text-foreground">
                      {ride.toLocation}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{formattedDate}</span>
                    <span>•</span>
                    <span>{ride.departureTime}</span>
                  </div>
                </div>

                {/* Seat Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    Number of Seats
                  </label>
                  <div className="flex items-center justify-between bg-muted rounded-xl p-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setNumSeats(Math.max(1, numSeats - 1))}
                      disabled={numSeats <= 1}
                      className="rounded-full w-10 h-10 p-0"
                    >
                      <Minus size={16} />
                    </Button>
                    <span className="text-xl font-semibold text-foreground">
                      {numSeats}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setNumSeats(Math.min(ride.availableSeats, numSeats + 1))
                      }
                      disabled={numSeats >= ride.availableSeats}
                      className="rounded-full w-10 h-10 p-0"
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    {ride.availableSeats} seats available
                  </p>
                </div>

                {/* Price Breakdown */}
                <div className="bg-muted rounded-xl p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Price per seat
                    </span>
                    <span className="font-medium text-foreground">
                      ₹{ride.price}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Number of seats
                    </span>
                    <span className="font-medium text-foreground">
                      {numSeats}
                    </span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-semibold text-foreground">
                      Total Amount
                    </span>
                    <span className="font-bold text-xl text-primary">
                      ₹{totalPrice}
                    </span>
                  </div>
                </div>

                {/* Booking Status */}
                {bookingStatus === "success" && (
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <CheckCircle size={20} className="text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">
                        Booking Request Sent!
                      </p>
                      <p className="text-sm text-green-600">
                        The driver will review your request. You can message
                        them for any questions.
                      </p>
                    </div>
                  </div>
                )}

                {bookingStatus === "error" && (
                  <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
                    <AlertCircle size={20} className="text-destructive" />
                    <div>
                      <p className="font-medium text-destructive">
                        Booking Failed
                      </p>
                      <p className="text-sm text-destructive/80">
                        Something went wrong. Please try again.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons - Fixed at bottom */}
              <div className="flex-shrink-0 border-t bg-card p-4 pb-6">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowBookingSheet(false)}
                    className="flex-1 h-12"
                    disabled={bookingStatus === "loading"}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleBooking}
                    disabled={
                      bookingStatus === "loading" || bookingStatus === "success"
                    }
                    className="flex-1 h-12 font-semibold"
                  >
                    {bookingStatus === "loading"
                      ? "Processing..."
                      : "Confirm Booking"}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Driver Details Sheet */}
      <Sheet open={showDriverSheet} onOpenChange={setShowDriverSheet}>
        <SheetContent
          side="bottom"
          className="h-auto max-h-[80vh] flex flex-col"
        >
          <SheetHeader className="flex-shrink-0">
            <SheetTitle>Driver Information</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto py-6 space-y-6">
            {/* Driver Profile */}
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20 ring-2 ring-primary/20">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
                  {ride.driver.name
                    ?.split(" ")
                    .map((n) => n.charAt(0))
                    .join("")
                    .slice(0, 2) || "D"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground">
                  {ride.driver.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    <Star size={16} className="text-yellow-500 fill-current" />
                    <span className="font-medium text-foreground">
                      {ride.driver.driverRating?.toFixed(1) || "New"}
                    </span>
                  </div>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">
                    {ride.driver.ridesCompleted} completed rides
                  </span>
                </div>
              </div>
            </div>

            {/* Driver Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {ride.driver.ridesCompleted}
                </div>
                <p className="text-sm text-muted-foreground">Total Rides</p>
              </div>
              <div className="bg-muted rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {ride.driver.driverRating?.toFixed(1) || "New"}
                </div>
                <p className="text-sm text-muted-foreground">Rating</p>
              </div>
            </div>
          </div>

          {/* Contact Actions - Fixed at bottom */}
          <div className="flex-shrink-0 border-t bg-card p-4 pb-6">
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-12 flex items-center gap-2"
                onClick={handleContactDriver}
              >
                <MessageSquare size={18} />
                Message
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-12 flex items-center gap-2"
              >
                <Phone size={18} />
                Call
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
