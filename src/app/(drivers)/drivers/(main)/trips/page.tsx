"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  CalendarPlus,
  Car,
  Clock,
  MapPin,
  Calendar,
  IndianRupee,
  Users,
  ArrowRight,
  ArrowLeft,
  Phone,
  User,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

type Ride = {
  id: string;
  fromLocation: string;
  toLocation: string;
  departureDate: string;
  departureTime: string;
  price: number;
  availableSeats: number;
  status: string;
  bookings: Array<{
    id: string;
    status: string;
    phoneNumber?: string;
    user: {
      id: string;
      name: string;
      phone?: string;
    };
  }>;
};

export default function TripsPage() {
  const router = useRouter();
  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed">(
    "upcoming"
  );

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const response = await fetch("/api/rides");
        if (response.ok) {
          const data = await response.json();
          setRides(data);
        } else {
          toast.error("Failed to load rides");
        }
      } catch (error) {
        console.error("Error fetching rides:", error);
        toast.error("An error occurred while loading rides");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRides();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING_APPROVAL":
        return (
          <div className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
            Pending
          </div>
        );
      case "APPROVED":
        return (
          <div className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            Active
          </div>
        );
      case "REJECTED":
        return (
          <div className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            Rejected
          </div>
        );
      case "COMPLETED":
        return (
          <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            Completed
          </div>
        );
      case "CANCELLED":
        return (
          <div className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
            Cancelled
          </div>
        );
      default:
        return (
          <div className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
            {status}
          </div>
        );
    }
  };

  // Filter rides by status
  const upcomingRides = rides.filter(
    (ride) => !["COMPLETED", "CANCELLED"].includes(ride.status)
  );

  const completedRides = rides.filter((ride) =>
    ["COMPLETED", "CANCELLED"].includes(ride.status)
  );

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (e) {
      return dateString;
    }
  };

  const currentRides =
    activeTab === "upcoming" ? upcomingRides : completedRides;

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
          <h1 className="text-xl font-semibold text-gray-900 flex-1">
            My Rides
          </h1>
          <Link href="/drivers/trips/new">
            <button className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium">
              <CalendarPlus className="w-3 h-3 mr-1 inline" />
              New
            </button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === "upcoming"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("upcoming")}
          >
            Upcoming ({upcomingRides.length})
          </button>
          <button
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === "completed"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("completed")}
          >
            Completed ({completedRides.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-20 pt-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-gray-200 rounded-full mr-3"></div>
                    <div>
                      <div className="w-40 h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="w-32 h-3 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
                </div>
                <div className="w-full h-20 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : currentRides.length > 0 ? (
          <div className="space-y-3">
            {currentRides.map((ride) => (
              <div
                key={ride.id}
                className="bg-white rounded-xl overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <Car className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm">
                          {ride.fromLocation.split(",")[0]} →{" "}
                          {ride.toLocation.split(",")[0]}
                        </h3>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(ride.departureDate)}
                          <span className="mx-2">•</span>
                          <Clock className="w-3 h-3 mr-1" />
                          {ride.departureTime}
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(ride.status)}
                  </div>

                  {/* Ride Details */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <div className="text-xs text-gray-500">Price</div>
                        <div className="text-sm font-medium text-gray-900 mt-0.5 flex items-center">
                          <IndianRupee className="w-3 h-3 mr-0.5" />
                          {ride.price.toLocaleString("en-IN")}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Seats</div>
                        <div className="text-sm font-medium text-gray-900 mt-0.5 flex items-center">
                          <Users className="w-3 h-3 mr-0.5" />
                          {ride.availableSeats}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Bookings</div>
                        <div className="text-sm font-medium text-gray-900 mt-0.5">
                          {
                            ride.bookings.filter(
                              (b) => b.status === "CONFIRMED"
                            ).length
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Passengers */}
                  {ride.bookings.filter((b) => b.status === "CONFIRMED")
                    .length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs text-gray-500 mb-2">
                        Confirmed Passengers
                      </div>
                      <div className="space-y-2">
                        {ride.bookings
                          .filter((booking) => booking.status === "CONFIRMED")
                          .slice(0, 2)
                          .map((booking) => (
                            <div
                              key={booking.id}
                              className="flex items-center justify-between p-2 bg-green-50 rounded-lg"
                            >
                              <div className="flex items-center">
                                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2">
                                  <User className="w-3 h-3 text-green-600" />
                                </div>
                                <span className="text-sm text-green-800">
                                  {booking.user.name}
                                </span>
                              </div>
                              {booking.user.phone && (
                                <button className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                  <Phone className="w-3 h-3 text-green-600" />
                                </button>
                              )}
                            </div>
                          ))}
                        {ride.bookings.filter((b) => b.status === "CONFIRMED")
                          .length > 2 && (
                          <div className="text-xs text-gray-500 text-center">
                            +
                            {ride.bookings.filter(
                              (b) => b.status === "CONFIRMED"
                            ).length - 2}{" "}
                            more passengers
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link href={`/drivers/trips/${ride.id}`} className="flex-1">
                      <button className="w-full py-2 px-3 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 active:bg-blue-200 transition-colors">
                        View Details
                      </button>
                    </Link>
                    {ride.status === "APPROVED" && (
                      <button className="px-3 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 active:bg-gray-200 transition-colors">
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Car className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {activeTab} rides
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              {activeTab === "upcoming"
                ? "Schedule your first ride to start earning"
                : "Your completed rides will appear here"}
            </p>
            {activeTab === "upcoming" && (
              <Link href="/drivers/trips/new">
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium">
                  Schedule a Ride
                </button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
