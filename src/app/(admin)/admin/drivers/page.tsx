"use client";

import Loader from "@/components/loader";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import React from "react";

interface Driver {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  isVerified: boolean;
  createdAt: string;
}

const fetchDrivers = async (): Promise<Driver[]> => {
  const response = await fetch("/api/drivers");
  if (!response.ok) {
    throw new Error("Failed to fetch drivers");
  }
  return response.json();
};

const DriversPage = () => {
  const {
    data: drivers,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["drivers"],
    queryFn: fetchDrivers,
  });

  if (isLoading) return <Loader />;
  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen">
        Error: {error.message}
      </div>
    );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Drivers Management</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Phone</th>
              <th className="py-3 px-4 text-left">Verification</th>
              <th className="py-3 px-4 text-left">Join Date</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers?.map((driver) => (
              <tr
                key={driver.id}
                className="border-b border-gray-200 hover:bg-gray-50"
              >
                <td className="py-3 px-4">{driver.name}</td>
                <td className="py-3 px-4">{driver.email || "N/A"}</td>
                <td className="py-3 px-4">{driver.phoneNumber || "N/A"}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      driver.isVerified
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {driver.isVerified ? "Verified" : "Unverified"}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {new Date(driver.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <Link
                    href={`/admin/drivers/${driver.id}`}
                    className="text-blue-600 hover:text-blue-800 transition"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
            {drivers?.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  No drivers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DriversPage;
