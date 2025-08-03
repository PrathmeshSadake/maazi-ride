"use client";

import { useState, useEffect, JSX } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Clock,
  X,
  Calendar,
  MapPin,
  MessageSquare,
  Phone,
  User,
  IndianRupee,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { useSession } from "next-auth/react";

interface Booking {
  id: string;
  status: string;
  numSeats: number;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    phone?: string;
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
  const { data: session, status } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "pending" | "confirmed" | "rejected"
  >("pending");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/sign-in");
    } else if (session?.user) {
      fetchBookings();
    }
  }, [session, status, router, activeTab]);

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
      bg: "bg-amber-100",
      text: "text-amber-800",
      icon: <Clock className="w-3 h-3 text-amber-600" />,
    },
    CONFIRMED: {
      bg: "bg-green-100",
      text: "text-green-800",
      icon: <Check className="w-3 h-3 text-green-600" />,
    },
    REJECTED: {
      bg: "bg-red-100",
      text: "text-red-800",
      icon: <X className="w-3 h-3 text-red-600" />,
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white">
        <div className="flex items-center px-4 pt-8 pb-4">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">
            Booking Requests
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === "pending"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("pending")}
          >
            Pending
          </button>
          <button
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === "confirmed"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("confirmed")}
          >
            Confirmed
          </button>
          <button
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === "rejected"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("rejected")}
          >
            Rejected
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-20 pt-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-gray-200 rounded-full mr-3"></div>
                    <div>
                      <div className="w-32 h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="w-24 h-3 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {activeTab} requests
            </h3>
            <p className="text-gray-500 text-sm">
              Booking requests will appear here when passengers contact you
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-xl overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm">
                          {booking.user.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {booking.numSeats} seat
                          {booking.numSeats > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`px-2 py-1 rounded-full flex items-center gap-1 text-xs font-medium ${
                        statusColors[booking.status]?.bg || "bg-gray-100"
                      } ${
                        statusColors[booking.status]?.text || "text-gray-800"
                      }`}
                    >
                      {statusColors[booking.status]?.icon}
                      {booking.status === "PENDING_APPROVAL" && "Pending"}
                      {booking.status === "CONFIRMED" && "Confirmed"}
                      {booking.status === "REJECTED" && "Rejected"}
                    </div>
                  </div>

                  {/* Ride Details */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <div className="flex items-center text-sm text-gray-900 mb-1">
                      <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                      {booking.ride.fromLocation.split(",")[0]} →{" "}
                      {booking.ride.toLocation.split(",")[0]}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="w-3 h-3 mr-1" />
                      {format(
                        new Date(booking.ride.departureDate),
                        "MMM d, yyyy"
                      )}{" "}
                      at {booking.ride.departureTime}
                    </div>
                  </div>

                  {/* Actions */}
                  {booking.status === "PENDING_APPROVAL" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleStatusChange(booking.id, "REJECTED")
                        }
                        disabled={processingId === booking.id}
                        className="flex-1 py-2 px-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 active:bg-red-200 transition-colors disabled:opacity-50"
                      >
                        {processingId === booking.id ? "..." : "Reject"}
                      </button>
                      <button
                        onClick={() =>
                          handleStatusChange(booking.id, "CONFIRMED")
                        }
                        disabled={processingId === booking.id}
                        className="flex-1 py-2 px-3 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 active:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {processingId === booking.id ? "..." : "Accept"}
                      </button>
                    </div>
                  )}

                  {/* Contact Options */}
                  {booking.status === "CONFIRMED" && (
                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                      {booking.user.phone && (
                        <button 
                          onClick={() => window.open(`tel:${booking.user.phone?.replace(/\D/g, "")}`, "_self")}
                          className="flex-1 flex items-center justify-center py-2 px-3 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 active:bg-blue-200 transition-colors"
                        >
                          <Phone className="w-3 h-3 mr-1" />
                          Call
                        </button>
                      )}
                      <button className="flex-1 flex items-center justify-center py-2 px-3 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-100 active:bg-purple-200 transition-colors">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        Message
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
