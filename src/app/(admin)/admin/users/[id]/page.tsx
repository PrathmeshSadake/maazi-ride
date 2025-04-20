"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import React from "react";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  createdAt: string;
}

interface Booking {
  id: string;
  rideId: string;
  status: string;
  numSeats: number;
  createdAt: string;
  ride: {
    fromLocation: string;
    toLocation: string;
    departureDate: string;
    departureTime: string;
    price: number;
  };
}

const UserDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json() as Promise<User>;
    },
  });

  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ["userBookings", userId],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}/bookings`);
      if (!res.ok) throw new Error("Failed to fetch bookings");
      return res.json() as Promise<Booking[]>;
    },
  });

  if (userLoading) return <div>Loading user details...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="p-6">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Users
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex flex-col items-center">
            <div className="h-24 w-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-blue-600">
                {user.firstName?.[0] || ""}
                {user.lastName?.[0] || ""}
              </span>
            </div>
            <h2 className="text-xl font-semibold">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-gray-500 mb-4">{user.email}</p>

            <div className="w-full border-t border-gray-200 my-4 pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Role:</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    user.role === "admin"
                      ? "bg-purple-100 text-purple-800"
                      : user.role === "driver"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Phone:</span>
                <span>{user.phoneNumber || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Joined:</span>
                <span>{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings Section */}
        <div className="md:col-span-2 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Booking History</h3>

          {bookingsLoading ? (
            <div className="text-center py-4">Loading bookings...</div>
          ) : bookings && bookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Route
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seats
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.ride.fromLocation}
                        </div>
                        <div className="text-sm text-gray-500">
                          to {booking.ride.toLocation}
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(
                            booking.ride.departureDate
                          ).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.ride.departureTime}
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            booking.status === "COMPLETED"
                              ? "bg-green-100 text-green-800"
                              : booking.status === "CONFIRMED"
                              ? "bg-blue-100 text-blue-800"
                              : booking.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : booking.status === "CANCELLED" ||
                                booking.status === "REJECTED"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {booking.numSeats}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        ${(booking.ride.price * booking.numSeats).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-md p-4 text-center text-gray-500">
              No booking history found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetailPage;
