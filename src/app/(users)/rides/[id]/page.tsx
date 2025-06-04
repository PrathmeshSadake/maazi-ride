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
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center pb-16">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
        <p className="text-muted-foreground font-medium text-sm">
          Loading ride details...
        </p>
      </div>
    );
  }

  if (error || !ride) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center pb-16">
        <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-2">
          <AlertCircle size={28} className="text-destructive" />
        </div>
        <p className="text-destructive font-medium mb-2 text-center text-base">
          {error || "Ride not found"}
        </p>
        <Button onClick={goBack} size="sm" className="w-full max-w-[180px]">
          Go Back
        </Button>
      </div>
    );
  }

  const formattedDate = format(
    parseISO(ride.departureDate),
    "EEE, dd MMM yyyy"
  );
  const totalPrice = ride.price * numSeats;

  return (
    <div className="min-h-screen bg-[#f8f9fb] pb-4 max-w-md mx-auto">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40 px-3 py-2 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={goBack}
          className="h-8 w-8 p-0"
        >
          <ArrowLeft size={18} />
        </Button>
        <h1 className="text-base font-bold text-foreground">Ride Details</h1>
        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
          <Share2 size={18} />
        </Button>
      </div>

      <div className="px-2 pt-3 space-y-4">
        {/* Route & Price Card */}
        <div className="bg-white rounded-xl shadow-sm border border-border/60 p-3 space-y-2">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <Calendar size={14} className="text-green-600" />
            <span>{formattedDate}</span>
            <Clock size={14} className="text-green-600 ml-2" />
            <span>{ride.departureTime}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <MapPin size={16} className="text-green-500" />
            <span className="font-semibold text-foreground text-sm truncate max-w-[90px]">
              {ride.fromLocation}
            </span>
            <span className="mx-1 text-muted-foreground">→</span>
            <MapPin size={16} className="text-destructive" />
            <span className="font-semibold text-foreground text-sm truncate max-w-[90px]">
              {ride.toLocation}
            </span>
            <Button variant="outline" size="icon" className="h-7 w-7 ml-auto">
              <Navigation size={14} />
            </Button>
          </div>
          <div className="flex items-center justify-between bg-[#f3f6fa] rounded-lg px-2 py-2 mt-2">
            <div className="flex items-center gap-1 text-xs">
              <Users size={14} className="text-primary" />
              <span className="font-medium text-foreground">
                {ride.availableSeats} seats
              </span>
            </div>
            <div className="flex items-center gap-1 text-lg font-bold text-green-600">
              <IndianRupee size={16} />
              <span>{ride.price}</span>
              <span className="text-xs font-normal text-muted-foreground">
                /seat
              </span>
            </div>
          </div>
        </div>

        {/* Vehicle Section */}
        <div className="bg-white rounded-xl shadow-sm border border-border/60 p-3">
          <div className="flex items-center mb-2">
            <Car size={16} className="text-muted-foreground mr-2" />
            <span className="text-sm font-bold text-foreground">Vehicle</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-foreground text-sm">
              {ride.driver.vehicle?.make} {ride.driver.vehicle?.model}
              {ride.driver.vehicle?.year && ` (${ride.driver.vehicle?.year})`}
            </span>
            {ride.driver.vehicle?.color && (
              <Badge
                variant="outline"
                className="ml-2 text-xs px-2 py-0.5 bg-gray-50"
              >
                {ride.driver.vehicle?.color}
              </Badge>
            )}
          </div>
          {ride.driver.vehicle?.vehicleImages &&
            Array.isArray(ride.driver.vehicle?.vehicleImages) &&
            ride.driver.vehicle?.vehicleImages.length > 0 && (
              <div className="mt-2">
                <div className="text-xs text-muted-foreground mb-1 font-medium">
                  Photos
                </div>
                <div className="flex overflow-x-auto gap-2 pb-1">
                  {ride.driver.vehicle?.vehicleImages.map((image, index) => {
                    const imageUrl = image.startsWith("http")
                      ? image
                      : image.startsWith("/")
                      ? `${window.location.origin}${image}`
                      : `${window.location.origin}/${image}`;
                    return (
                      <div
                        key={index}
                        className="min-w-[80px] h-[56px] rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 bg-[#f3f6fa]"
                      >
                        <img
                          src={imageUrl}
                          alt={`${ride.driver.vehicle?.make || "Vehicle"} ${
                            ride.driver.vehicle?.model || "image"
                          }`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://via.placeholder.com/80x56?text=Vehicle";
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
        </div>

        {/* Driver Section */}
        <div className="bg-white rounded-xl shadow-sm border border-border/60 p-3">
          <div className="flex items-center mb-2">
            <UserCheck size={16} className="text-muted-foreground mr-2" />
            <span className="text-sm font-bold text-foreground">Driver</span>
          </div>
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 ring-2 ring-primary/20">
              <AvatarFallback className="bg-primary text-primary-foreground text-base font-semibold">
                {ride.driver.name
                  ?.split(" ")
                  .map((n) => n.charAt(0))
                  .join("")
                  .slice(0, 2) || "D"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-foreground text-sm truncate">
                {ride.driver.name}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <Star size={12} className="text-yellow-500 fill-current" />
                <span className="font-medium">
                  {ride.driver.driverRating?.toFixed(1) || "New"}
                </span>
                <span>•</span>
                <span>{ride.driver.ridesCompleted} rides</span>
              </div>
            </div>
            <div className="flex gap-1 ml-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowDriverSheet(true)}
                className="h-8 w-8 p-0"
              >
                <Info size={14} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleContactDriver}
                className="h-8 w-8 p-0"
              >
                <MessageSquare size={14} />
              </Button>
            </div>
          </div>
        </div>

        {/* Trip Details */}
        {ride.description && (
          <div className="bg-white rounded-xl shadow-sm border border-border/60 p-3">
            <div className="flex items-center mb-2">
              <Info size={16} className="text-muted-foreground mr-2" />
              <span className="text-sm font-bold text-foreground">
                Trip Details
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {ride.description}
            </p>
          </div>
        )}
      </div>

      {/* Fixed Bottom Booking Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="max-w-md mx-auto p-2">
          <Drawer open={showBookingSheet} onOpenChange={setShowBookingSheet}>
            <DrawerTrigger asChild>
              <Button className="w-full py-3 font-semibold text-base rounded-lg shadow-sm bg-green-600 hover:bg-green-700 text-white">
                Request to Book
              </Button>
            </DrawerTrigger>
            <DrawerContent className="h-auto max-h-[80vh] min-h-[45vh] flex flex-col rounded-t-2xl px-2">
              <DrawerHeader className="flex-shrink-0">
                <DrawerTitle className="text-base">Book Your Ride</DrawerTitle>
              </DrawerHeader>
              <div className="flex-1 overflow-y-auto py-4 px-1 space-y-4">
                {/* Route Summary */}
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-foreground text-sm">
                      {ride.fromLocation}
                    </span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-semibold text-foreground text-sm">
                      {ride.toLocation}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formattedDate}</span>
                    <span>•</span>
                    <span className="font-semibold text-foreground text-sm">
                      {ride.departureTime}
                    </span>
                  </div>
                </div>
                {/* Seat Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">
                    Number of Seats
                  </label>
                  <div className="flex items-center justify-between bg-muted rounded-lg p-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setNumSeats(Math.max(1, numSeats - 1))}
                      disabled={numSeats <= 1}
                      className="rounded-full w-8 h-8 p-0"
                    >
                      <Minus size={14} />
                    </Button>
                    <span className="text-lg font-semibold text-foreground">
                      {numSeats}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setNumSeats(Math.min(ride.availableSeats, numSeats + 1))
                      }
                      disabled={numSeats >= ride.availableSeats}
                      className="rounded-full w-8 h-8 p-0"
                    >
                      <Plus size={14} />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    {ride.availableSeats} seats available
                  </p>
                </div>
                {/* Price Breakdown */}
                <div className="bg-muted rounded-lg p-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      Price per seat
                    </span>
                    <span className="font-medium text-foreground">
                      ₹{ride.price}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      Number of seats
                    </span>
                    <span className="font-medium text-foreground">
                      {numSeats}
                    </span>
                  </div>
                  <div className="border-t pt-1 flex justify-between text-sm">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="font-bold text-lg text-primary">
                      ₹{totalPrice}
                    </span>
                  </div>
                </div>
                {/* Booking Status */}
                {bookingStatus === "success" && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle size={16} className="text-green-600" />
                    <div>
                      <p className="font-medium text-green-800 text-sm">
                        Booking Request Sent!
                      </p>
                      <p className="text-xs text-green-600">
                        The driver will review your request. You can message
                        them for any questions.
                      </p>
                    </div>
                  </div>
                )}
                {bookingStatus === "error" && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <AlertCircle size={16} className="text-destructive" />
                    <div>
                      <p className="font-medium text-destructive text-sm">
                        Booking Failed
                      </p>
                      <p className="text-xs text-destructive/80">
                        Something went wrong. Please try again.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {/* Action Buttons - Fixed at bottom */}
              <div className="flex-shrink-0 border-t bg-card p-2 pb-4 flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowBookingSheet(false)}
                  className="flex-1 h-10 text-sm"
                  disabled={bookingStatus === "loading"}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBooking}
                  disabled={
                    bookingStatus === "loading" || bookingStatus === "success"
                  }
                  className="flex-1 h-10 font-semibold text-sm"
                >
                  {bookingStatus === "loading"
                    ? "Processing..."
                    : "Confirm Booking"}
                </Button>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>

      {/* Driver Details Sheet */}
      <Drawer open={showDriverSheet} onOpenChange={setShowDriverSheet}>
        <DrawerContent className="h-auto max-h-[75vh] flex flex-col rounded-t-2xl px-2">
          <DrawerHeader className="flex-shrink-0">
            <DrawerTitle className="text-base">Driver Information</DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            {/* Driver Profile */}
            <div className="flex items-center gap-3">
              <Avatar className="w-14 h-14 ring-2 ring-primary/20">
                <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                  {ride.driver.name
                    ?.split(" ")
                    .map((n) => n.charAt(0))
                    .join("")
                    .slice(0, 2) || "D"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground">
                  {ride.driver.name}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-xs">
                  <Star size={14} className="text-yellow-500 fill-current" />
                  <span className="font-medium text-foreground">
                    {ride.driver.driverRating?.toFixed(1) || "New"}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">
                    {ride.driver.ridesCompleted} rides
                  </span>
                </div>
              </div>
            </div>
            {/* Driver Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-muted rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-primary">
                  {ride.driver.ridesCompleted}
                </div>
                <p className="text-xs text-muted-foreground">Total Rides</p>
              </div>
              <div className="bg-muted rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-green-600">
                  {ride.driver.driverRating?.toFixed(1) || "New"}
                </div>
                <p className="text-xs text-muted-foreground">Rating</p>
              </div>
            </div>
          </div>
          {/* Contact Actions - Fixed at bottom */}
          <div className="flex-shrink-0 border-t bg-card p-2 pb-4 flex gap-2">
            <Button
              variant="outline"
              className="flex-1 h-10 flex items-center gap-2 text-sm"
              onClick={handleContactDriver}
            >
              <MessageSquare size={16} /> Message
            </Button>
            <Button
              variant="outline"
              className="flex-1 h-10 flex items-center gap-2 text-sm"
            >
              <Phone size={16} /> Call
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
