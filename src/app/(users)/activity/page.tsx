"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, Clock, X, Calendar, MapPin, ChevronRight } from "lucide-react";
import { format, isPast } from "date-fns";
import { useUser } from "@clerk/nextjs";

interface Booking {
  id: string;
  status: string;
  numSeats: number;
  createdAt: string;
  ride: {
    id: string;
    fromLocation: string;
    toLocation: string;
    departureDate: string;
    departureTime: string;
    price: number;
    driver: {
      firstName: string;
      lastName: string;
    };
  };
}

export default function ActivityPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    } else if (isSignedIn) {
      fetchBookings();
    }
  }, [isSignedIn, isLoaded, router]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/bookings");

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

  const filteredBookings = bookings.filter((booking) => {
    const isPastRide = isPast(new Date(booking.ride.departureDate));
    return activeTab === "past" ? isPastRide : !isPastRide;
  });

  const statusColors: Record<
    string,
    { bg: string; text: string; icon: React.ReactNode }
  > = {
    PENDING: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      icon: <Clock size={14} className="text-yellow-600" />,
    },
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
    CANCELLED: {
      bg: "bg-red-100",
      text: "text-red-800",
      icon: <X size={14} className="text-red-600" />,
    },
    REJECTED: {
      bg: "bg-gray-100",
      text: "text-gray-800",
      icon: <X size={14} className="text-gray-600" />,
    },
    COMPLETED: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      icon: <Check size={14} className="text-blue-600" />,
    },
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">My Bookings</h1>

      <div className="flex border-b mb-4">
        <button
          className={`flex-1 py-2 text-center font-medium ${
            activeTab === "upcoming"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("upcoming")}
        >
          Upcoming
        </button>
        <button
          className={`flex-1 py-2 text-center font-medium ${
            activeTab === "past"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("past")}
        >
          Past
        </button>
      </div>

      {loading ? (
        <div className="py-10 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-2 border-t-blue-600 border-r-transparent border-b-blue-600 border-l-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500">Loading your bookings...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-gray-500 mb-2">No {activeTab} bookings found</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Find a Ride
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking: any) => (
            <div
              key={booking.id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow"
              onClick={() => router.push(`/rides/${booking.ride.id}`)}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                  <div
                    className={`px-2 py-1 rounded-full flex items-center gap-1 text-xs font-medium ${
                      statusColors[booking.status].bg
                    } ${statusColors[booking.status].text}`}
                  >
                    {statusColors[booking.status].icon}
                    {booking.status}
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

              <div className="flex justify-between items-center text-sm border-t pt-3 mt-2">
                <div className="text-gray-600">
                  {booking.numSeats} {booking.numSeats === 1 ? "seat" : "seats"}{" "}
                  • With {booking.ride.driver.firstName}{" "}
                  {booking.ride.driver.lastName.charAt(0)}.
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </div>

              {booking.status === "CONFIRMED" && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(
                        `/messages?driverId=${booking.ride.driver.id}&bookingId=${booking.id}`
                      );
                    }}
                    className="w-full py-2 text-sm text-blue-600 font-medium border border-blue-200 rounded-lg hover:bg-blue-50"
                  >
                    Message Driver
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
