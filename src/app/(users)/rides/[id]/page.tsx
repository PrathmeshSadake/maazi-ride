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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PhoneNumberDialog } from "@/components/ui/phone-number-dialog";
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
    name: string | null;
    phone?: string;
    driverRating: number | null;
    ridesCompleted: number;
    vehicle?: {
      id: string;
      make: string;
      model: string;
      year?: number;
      color?: string;
      licensePlate?: string;
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
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [phoneDialogOpen, setPhoneDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRideDetails();
    }
  }, [id]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch("/api/users/me");
        if (response.ok) {
          const userData = await response.json();
          setUserPhone(userData.phone);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

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

    // Check if user has phone number
    if (!userPhone) {
      // Show dialog to collect phone number
      setPhoneDialogOpen(true);
      return;
    }

    // User has phone number, proceed with booking
    await submitBooking(userPhone);
  };

  const submitBooking = async (phoneNumber: string) => {
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
          phoneNumber,
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
    } finally {
      setPhoneDialogOpen(false);
    }
  };

  const handlePhoneSubmit = (phoneNumber: string) => {
    submitBooking(phoneNumber);
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

  const handleCallDriver = () => {
    if (!ride?.driver?.phone) {
      alert("Driver phone number not available");
      return;
    }
    
    // Clean the phone number and make the call
    const cleanPhone = ride.driver.phone.replace(/\D/g, "");
    window.open(`tel:${cleanPhone}`, "_self");
  };

  const goBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
            <Car className="w-6 h-6 text-white" />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-semibold text-gray-900">Loading...</p>
            <p className="text-sm text-gray-500">Loading ride details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !ride) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4 px-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-gray-900">Error</p>
            <p className="text-sm text-gray-600">{error || "Ride not found"}</p>
          </div>
          <button
            onClick={goBack}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 active:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const formattedDate = format(
    parseISO(ride.departureDate),
    "EEE, dd MMM yyyy"
  );
  const totalPrice = ride.price * numSeats;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-4 pt-8 pb-4">
          <button
            onClick={goBack}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Ride Details</h1>
          <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-4 space-y-3">
        {/* Route & Price Card */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-green-600" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>{ride.departureTime}</span>
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-semibold text-gray-900 text-sm truncate">
                  {ride.fromLocation}
                </span>
              </div>
              <div className="text-gray-400">→</div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="font-semibold text-gray-900 text-sm truncate">
                  {ride.toLocation}
                </span>
              </div>
              <button className="ml-auto w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Navigation className="w-4 h-4 text-blue-600" />
              </button>
            </div>
            <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-gray-900 text-sm">
                  {ride.availableSeats} seats available
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <IndianRupee className="w-5 h-5 text-green-600" />
                <span className="text-xl font-bold text-green-600">
                  {ride.price}
                </span>
                <span className="text-sm text-gray-500">/seat</span>
              </div>
            </div>
          </div>
        </div>

        {/* Driver Section */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <UserCheck className="w-3 h-3 text-blue-600" />
              </div>
              <h2 className="text-base font-semibold text-gray-900">Driver</h2>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12 border-2 border-blue-100">
                <AvatarFallback className="bg-blue-500 text-white text-base font-semibold">
                  {ride.driver.name
                    ?.split(" ")
                    .map((n) => n.charAt(0))
                    .join("")
                    .slice(0, 2) || "D"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 text-sm">
                  {ride.driver.name}
                </div>
                <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span className="font-medium">
                      {ride.driver.driverRating?.toFixed(1) || "New"}
                    </span>
                  </div>
                  <span>•</span>
                  <span>{ride.driver.ridesCompleted} rides</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowDriverSheet(true)}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
                >
                  <Info className="w-4 h-4" />
                </button>
                <button
                  onClick={handleContactDriver}
                  className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"
                >
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Section */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <Car className="w-3 h-3 text-purple-600" />
              </div>
              <h2 className="text-base font-semibold text-gray-900">Vehicle</h2>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <span className="font-semibold text-gray-900 text-sm">
                {ride.driver.vehicle?.make} {ride.driver.vehicle?.model}
                {ride.driver.vehicle?.year && ` (${ride.driver.vehicle?.year})`}
              </span>
              {ride.driver.vehicle?.color && (
                <Badge variant="outline" className="text-xs bg-gray-50">
                  {ride.driver.vehicle?.color}
                </Badge>
              )}
            </div>
            {ride.driver.vehicle?.vehicleImages &&
              Array.isArray(ride.driver.vehicle?.vehicleImages) &&
              ride.driver.vehicle?.vehicleImages.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-gray-700 mb-2">
                    Photos
                  </div>
                  <div className="flex space-x-2 overflow-x-auto">
                    {ride.driver.vehicle?.vehicleImages.map((image, index) => {
                      const imageUrl = image.startsWith("http")
                        ? image
                        : image.startsWith("/")
                        ? `${window.location.origin}${image}`
                        : `${window.location.origin}/${image}`;
                      return (
                        <div
                          key={index}
                          className="flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
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
        </div>

        {/* Trip Details */}
        {ride.description && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <Info className="w-3 h-3 text-green-600" />
                </div>
                <h2 className="text-base font-semibold text-gray-900">
                  Trip Details
                </h2>
              </div>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                {ride.description}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Booking Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="p-4">
          <Drawer open={showBookingSheet} onOpenChange={setShowBookingSheet}>
            <DrawerTrigger asChild>
              <button className="w-full px-4 py-4 bg-green-500 text-white rounded-xl font-semibold text-base hover:bg-green-600 active:bg-green-700 transition-colors">
                Request to Book
              </button>
            </DrawerTrigger>
            <DrawerContent className="h-auto max-h-[80vh] min-h-[45vh] flex flex-col rounded-t-2xl px-4">
              <DrawerHeader className="flex-shrink-0">
                <DrawerTitle className="text-lg font-semibold">
                  Book Your Ride
                </DrawerTitle>
              </DrawerHeader>
              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {/* Route Summary */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900 text-sm">
                      {ride.fromLocation}
                    </span>
                    <span className="text-gray-400">→</span>
                    <span className="font-semibold text-gray-900 text-sm">
                      {ride.toLocation}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-gray-600">
                    <span>{formattedDate}</span>
                    <span>•</span>
                    <span className="font-semibold">{ride.departureTime}</span>
                  </div>
                </div>

                {/* Seat Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">
                    Number of Seats
                  </label>
                  <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                    <button
                      onClick={() => setNumSeats(Math.max(1, numSeats - 1))}
                      disabled={numSeats <= 1}
                      className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center disabled:opacity-50"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-xl font-semibold text-gray-900">
                      {numSeats}
                    </span>
                    <button
                      onClick={() =>
                        setNumSeats(Math.min(ride.availableSeats, numSeats + 1))
                      }
                      disabled={numSeats >= ride.availableSeats}
                      className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    {ride.availableSeats} seats available
                  </p>
                </div>

                {/* Price Breakdown */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Price per seat</span>
                    <span className="font-medium text-gray-900">
                      ₹{ride.price}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Number of seats</span>
                    <span className="font-medium text-gray-900">
                      {numSeats}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-lg text-green-600">
                      ₹{totalPrice}
                    </span>
                  </div>
                </div>

                {/* Booking Status */}
                {bookingStatus === "success" && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-green-800">
                          Booking Request Sent!
                        </h3>
                        <p className="text-xs text-green-600 mt-1">
                          The driver will review your request. You can message
                          them for any questions.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {bookingStatus === "error" && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-red-800">
                          Booking Failed
                        </h3>
                        <p className="text-xs text-red-600 mt-1">
                          Something went wrong. Please try again.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons - Fixed at bottom */}
              <div className="flex-shrink-0 border-t border-gray-200 bg-white pt-4 pb-4">
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowBookingSheet(false)}
                    disabled={bookingStatus === "loading"}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 active:bg-gray-300 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBooking}
                    disabled={
                      bookingStatus === "loading" || bookingStatus === "success"
                    }
                    className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 active:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {bookingStatus === "loading"
                      ? "Processing..."
                      : "Confirm Booking"}
                  </button>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>

      {/* Driver Details Sheet */}
      <Drawer open={showDriverSheet} onOpenChange={setShowDriverSheet}>
        <DrawerContent className="h-auto max-h-[75vh] flex flex-col rounded-t-2xl px-4">
          <DrawerHeader className="flex-shrink-0">
            <DrawerTitle className="text-lg font-semibold">
              Driver Information
            </DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            {/* Driver Profile */}
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16 border-2 border-blue-100">
                <AvatarFallback className="bg-blue-500 text-white text-xl font-semibold">
                  {ride.driver.name
                    ?.split(" ")
                    .map((n) => n.charAt(0))
                    .join("")
                    .slice(0, 2) || "D"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">
                  {ride.driver.name}
                </h3>
                <div className="flex items-center space-x-3 text-sm text-gray-600 mt-1">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-medium">
                      {ride.driver.driverRating?.toFixed(1) || "New"}
                    </span>
                  </div>
                  <span>•</span>
                  <span>{ride.driver.ridesCompleted} rides</span>
                </div>
              </div>
            </div>

            {/* Driver Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {ride.driver.ridesCompleted}
                </div>
                <p className="text-xs text-gray-600 font-medium">Total Rides</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {ride.driver.driverRating?.toFixed(1) || "New"}
                </div>
                <p className="text-xs text-gray-600 font-medium">Rating</p>
              </div>
            </div>
          </div>

          {/* Contact Actions - Fixed at bottom */}
          <div className="flex-shrink-0 border-t border-gray-200 bg-white pt-4 pb-4">
            <div className="flex space-x-3">
              <button
                onClick={handleContactDriver}
                className="flex-1 px-4 py-3 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 active:bg-blue-300 transition-colors flex items-center justify-center space-x-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Message</span>
              </button>
              <button 
                onClick={handleCallDriver}
                disabled={!ride?.driver?.phone}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 active:bg-gray-300 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Phone className="w-4 h-4" />
                <span>Call</span>
              </button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <PhoneNumberDialog
        open={phoneDialogOpen}
        onOpenChange={setPhoneDialogOpen}
        onSubmit={handlePhoneSubmit}
        isLoading={bookingStatus === "loading"}
      />
    </div>
  );
}
