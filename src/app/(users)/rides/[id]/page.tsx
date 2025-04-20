"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Car,
  Star,
  MessageSquare,
  Share2,
} from "lucide-react";
import { formatDistanceToNow, format, parseISO } from "date-fns";
import { useUser } from "@clerk/nextjs";

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
    firstName: string | null;
    lastName: string | null;
    driverRating: number | null;
    ridesCompleted: number;
  };
}

export default function RideDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isLoaded } = useUser();
  const id = params.id as string;

  const [ride, setRide] = useState<RideDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numSeats, setNumSeats] = useState(1);
  const [bookingStatus, setBookingStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  useEffect(() => {
    if (id) {
      fetchRideDetails();
    }
  }, [id]);

  const fetchRideDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/rides/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch ride details");
      }

      const data = await response.json();
      setRide(data);
    } catch (err) {
      console.error("Error fetching ride details:", err);
      setError("Failed to load ride details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!isLoaded || !user) {
      router.push("/sign-in");
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

      // Navigate to messages with this booking
      router.push(
        `/messages?driver=${ride.driver.firstName}&rideId=${ride.id}&bookingId=${bookingData.id}`
      );
    } catch (err) {
      console.error("Error booking ride:", err);
      setBookingStatus("error");
    }
  };

  const goBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="p-4 max-w-md mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-t-blue-600 border-r-transparent border-b-blue-600 border-l-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500">Loading ride details...</p>
      </div>
    );
  }

  if (error || !ride) {
    return (
      <div className="p-4 max-w-md mx-auto text-center min-h-[60vh] flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">{error || "Ride not found"}</p>
        <button
          onClick={goBack}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  const formattedDate = format(parseISO(ride.departureDate), "dd MMMM yyyy");
  const createdAtDistance = formatDistanceToNow(parseISO(ride.departureDate), {
    addSuffix: true,
  });

  return (
    <div className="p-4 max-w-md mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={goBack} className="p-2 rounded-full hover:bg-gray-100">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold">Ride Details</h1>
        <button className="p-2 rounded-full hover:bg-gray-100">
          <Share2 size={20} />
        </button>
      </div>

      {/* Ride Info Card */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-1.5 text-gray-700 mb-2">
              <Calendar size={16} className="text-gray-500" />
              <span className="text-sm">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-700">
              <Clock size={16} className="text-gray-500" />
              <span className="text-sm">{ride.departureTime}</span>
            </div>
          </div>

          <div className="flex items-center text-green-700 font-semibold text-xl">
            <DollarSign size={20} />
            <span>{ride.price.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex flex-col space-y-2 mb-4">
          <div className="flex items-start">
            <div className="mt-1 mr-3">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div>
              <p className="font-medium text-gray-900">{ride.fromLocation}</p>
            </div>
          </div>

          <div className="flex items-center ml-2">
            <div className="h-10 w-0.5 bg-gray-300 ml-0.5"></div>
          </div>

          <div className="flex items-start">
            <div className="mt-1 mr-3">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
            </div>
            <div>
              <p className="font-medium text-gray-900">{ride.toLocation}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between py-3 border-t border-b border-gray-200 mb-3">
          <div className="flex items-center">
            <Users size={18} className="text-gray-500 mr-2" />
            <span className="text-sm font-medium">
              {ride.availableSeats} seats available
            </span>
          </div>

          <div className="flex items-center">
            <Car size={18} className="text-gray-500 mr-2" />
            <span className="text-sm font-medium">Standard car</span>
          </div>
        </div>

        {ride.description && (
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-1">Trip Details</h3>
            <p className="text-sm text-gray-600">{ride.description}</p>
          </div>
        )}
      </div>

      {/* Driver Info */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-4">
        <h3 className="text-sm font-medium mb-3">Driver</h3>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mr-3">
              <span className="text-lg font-semibold">
                {ride.driver.firstName?.charAt(0) || ""}
                {ride.driver.lastName?.charAt(0) || ""}
              </span>
            </div>

            <div>
              <p className="font-medium">
                {ride.driver.firstName} {ride.driver.lastName}
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <span className="flex items-center">
                  <Star
                    size={14}
                    className="text-yellow-400 mr-1"
                    fill="currentColor"
                  />
                  {ride.driver.driverRating?.toFixed(1) || "New"}
                </span>
                <span className="mx-2">•</span>
                <span>{ride.driver.ridesCompleted} rides</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              // First check if there's an existing booking
              fetch(`/api/bookings/check?rideId=${ride.id}`)
                .then((res) => res.json())
                .then((data) => {
                  if (data.booking) {
                    // If booking exists, go to messages with this booking
                    router.push(
                      `/messages?driver=${ride.driver.firstName}&rideId=${ride.id}&bookingId=${data.booking.id}`
                    );
                  } else {
                    // Otherwise, go to messages with just driver info
                    router.push(
                      `/messages?driver=${ride.driver.firstName}&rideId=${ride.id}`
                    );
                  }
                })
                .catch((err) => {
                  console.error("Error checking booking:", err);
                  // Fallback to simple messaging
                  router.push(
                    `/messages?driver=${ride.driver.firstName}&rideId=${ride.id}`
                  );
                });
            }}
            className="p-2 text-blue-600 rounded-full border border-blue-200 hover:bg-blue-50"
          >
            <MessageSquare size={18} />
          </button>
        </div>
      </div>

      {/* Booking Section */}
      <div className="mt-auto left-0 right-0 bg-white border-t border-gray-200 p-4 max-w-md mx-auto">
        <button
          onClick={handleBooking}
          disabled={bookingStatus === "loading"}
          className={`w-full py-3 rounded-lg font-medium
            ${
              bookingStatus === "loading"
                ? "bg-gray-300 text-gray-600"
                : "bg-blue-600 text-white"
            }`}
        >
          {bookingStatus === "loading" ? "Processing..." : "Request to book"}
        </button>

        {bookingStatus === "success" && (
          <p className="text-green-500 text-sm mt-2 text-center">
            Booking request sent! Waiting for driver approval.
          </p>
        )}

        {bookingStatus === "error" && (
          <p className="text-red-500 text-sm mt-2 text-center">
            Something went wrong. Please try again.
          </p>
        )}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <label htmlFor="seats" className="text-sm font-medium mr-2">
              Seats:
            </label>
            <select
              id="seats"
              value={numSeats}
              onChange={(e) => setNumSeats(parseInt(e.target.value))}
              className="border rounded px-2 py-1"
            >
              {Array.from(
                { length: Math.min(ride.availableSeats, 5) },
                (_, i) => i + 1
              ).map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>

          <div className="font-semibold text-lg">
            ${(ride.price * numSeats).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
