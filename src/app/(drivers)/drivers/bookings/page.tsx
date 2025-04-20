"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, Clock, X, Calendar, MapPin, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { useUser } from "@clerk/nextjs";

interface Booking {
  id: string;
  status: string;
  numSeats: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  ride: {
    id: string;
    fromLocation: string;
    toLocation: string;
    departureDate: string;
    departureTime: string;
    price: number;
  };
}

export default function DriverBookingsPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded, user } = useUser();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "pending" | "confirmed" | "rejected"
  >("pending");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    } else if (isSignedIn) {
      fetchBookings();
    }
  }, [isSignedIn, isLoaded, router, activeTab]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      let status;
      switch (activeTab) {
        case "pending":
          status = "PENDING_APPROVAL";
          break;
        case "confirmed":
          status = "CONFIRMED";
          break;
        case "rejected":
          status = "REJECTED";
          break;
      }

      const response = await fetch(`/api/bookings?status=${status}`);

      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }

      const data = await response.json();
      setBookings(data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    setProcessingId(bookingId);
    try {
      const response = await fetch(`/api/bookings?id=${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update booking");
      }

      // Update local state
      fetchBookings();
    } catch (err) {
      console.error("Error updating booking:", err);
      alert(err instanceof Error ? err.message : "Failed to update booking");
    } finally {
      setProcessingId(null);
    }
  };

  const statusColors: Record<
    string,
    { bg: string; text: string; icon: JSX.Element }
  > = {
    PENDING_APPROVAL: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      icon: <Clock size={14} className="text-yellow-600" />,
    },
    CONFIRMED: {
      bg: "bg-green-100",
      text: "text-green-800",
      icon: <Check size={14} className="text-green-600" />,
    },
    REJECTED: {
      bg: "bg-red-100",
      text: "text-red-800",
      icon: <X size={14} className="text-red-600" />,
    },
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Booking Requests</h1>

      <div className="flex border-b mb-4">
        <button
          className={`flex-1 py-2 text-center font-medium ${
            activeTab === "pending"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("pending")}
        >
          Pending Requests
        </button>
        <button
          className={`flex-1 py-2 text-center font-medium ${
            activeTab === "confirmed"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("confirmed")}
        >
          Confirmed
        </button>
        <button
          className={`flex-1 py-2 text-center font-medium ${
            activeTab === "rejected"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("rejected")}
        >
          Rejected
        </button>
      </div>

      {loading ? (
        <div className="py-10 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-2 border-t-blue-600 border-r-transparent border-b-blue-600 border-l-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500">Loading booking requests...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-gray-500 mb-2">
            No {activeTab} booking requests found
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                  <div
                    className={`px-2 py-1 rounded-full flex items-center gap-1 text-xs font-medium ${
                      statusColors[booking.status]?.bg || "bg-gray-100"
                    } ${statusColors[booking.status]?.text || "text-gray-800"}`}
                  >
                    {statusColors[booking.status]?.icon || null}
                    {booking.status.replace("_", " ")}
                  </div>
                </div>
                <div className="text-lg font-semibold">
                  ${booking.ride.price * booking.numSeats}
                </div>
              </div>

              <div className="mb-3">
                <div className="flex items-center mb-1">
                  <Calendar size={14} className="text-gray-500 mr-2" />
                  <span className="text-sm">
                    {format(
                      new Date(booking.ride.departureDate),
                      "dd MMM yyyy"
                    )}{" "}
                    • {booking.ride.departureTime}
                  </span>
                </div>

                <div className="flex items-center mt-2">
                  <div className="w-1 h-1 rounded-full bg-green-500 mr-2"></div>
                  <div className="text-sm text-gray-800 truncate flex-1">
                    {booking.ride.fromLocation}
                  </div>
                </div>

                <div className="w-0.5 h-3 bg-gray-300 ml-2.5 my-0.5"></div>

                <div className="flex items-center">
                  <div className="w-1 h-1 rounded-full bg-red-500 mr-2"></div>
                  <div className="text-sm text-gray-800 truncate flex-1">
                    {booking.ride.toLocation}
                  </div>
                </div>
              </div>

              <div className="flex items-center mt-3 text-sm text-gray-600">
                <span>
                  Passenger: {booking.user.firstName}{" "}
                  {booking.user.lastName.charAt(0)}.
                </span>
                <span className="mx-2">•</span>
                <span>
                  {booking.numSeats} {booking.numSeats === 1 ? "seat" : "seats"}
                </span>
                <span className="mx-2">•</span>
                <span>
                  Requested:{" "}
                  {format(new Date(booking.createdAt), "MMM d, h:mm a")}
                </span>
              </div>

              {booking.status === "PENDING_APPROVAL" && (
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleStatusChange(booking.id, "CONFIRMED")}
                    disabled={processingId === booking.id}
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300"
                  >
                    {processingId === booking.id ? "Processing..." : "Accept"}
                  </button>
                  <button
                    onClick={() => handleStatusChange(booking.id, "REJECTED")}
                    disabled={processingId === booking.id}
                    className="flex-1 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-300"
                  >
                    {processingId === booking.id ? "Processing..." : "Reject"}
                  </button>
                </div>
              )}

              {booking.status === "CONFIRMED" && (
                <div className="mt-4">
                  <button
                    onClick={() =>
                      router.push(
                        `/messages?userId=${booking.user.id}&bookingId=${booking.id}`
                      )
                    }
                    className="w-full py-2 flex items-center justify-center gap-2 text-blue-600 font-medium border border-blue-200 rounded-lg hover:bg-blue-50"
                  >
                    <MessageSquare size={16} />
                    Message Passenger
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
