"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import React, { useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const fetchUsers = async (): Promise<User[]> => {
  const response = await fetch("/api/users");
  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }
  return response.json();
};

const UsersPage = () => {
  const [filter, setFilter] = useState("all"); // all, user, driver, admin

  const {
    data: users,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen">
        Error: {(error as Error).message}
      </div>
    );

  const filteredUsers =
    filter === "all" ? users : users?.filter((user) => user.role === filter);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Users Management</h1>

      <div className="mb-6 flex gap-3">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-md ${
            filter === "all" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          All Users
        </button>
        <button
          onClick={() => setFilter("user")}
          className={`px-4 py-2 rounded-md ${
            filter === "user" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Passengers
        </button>
        <button
          onClick={() => setFilter("driver")}
          className={`px-4 py-2 rounded-md ${
            filter === "driver" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Drivers
        </button>
        <button
          onClick={() => setFilter("admin")}
          className={`px-4 py-2 rounded-md ${
            filter === "admin" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Admins
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Phone</th>
              <th className="py-3 px-4 text-left">Role</th>
              <th className="py-3 px-4 text-left">Join Date</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers?.map((user) => (
              <tr
                key={user.id}
                className="border-b border-gray-200 hover:bg-gray-50"
              >
                <td className="py-3 px-4">{user.name}</td>
                <td className="py-3 px-4">{user.email || "N/A"}</td>
                <td className="py-3 px-4">
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
                </td>
                <td className="py-3 px-4">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="text-blue-600 hover:text-blue-800 transition"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
            {filteredUsers?.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersPage;
