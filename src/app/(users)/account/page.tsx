"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Settings,
  CreditCard,
  LogOut,
  ChevronRight,
  Bell,
  MessageSquare,
  Clock,
  Star,
} from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";

export default function AccountPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      router.push("/sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="p-4 max-w-md mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-t-blue-600 border-r-transparent border-b-blue-600 border-l-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500">Loading your profile...</p>
      </div>
    );
  }

  if (!user) {
    router.push("/sign-in");
    return null;
  }

  const menuItems = [
    {
      icon: <MessageSquare size={20} className="text-blue-600" />,
      title: "Messages",
      description: "Your conversations with drivers",
      onClick: () => router.push("/messages"),
    },
    {
      icon: <Clock size={20} className="text-purple-600" />,
      title: "Ride History",
      description: "Your past and upcoming rides",
      onClick: () => router.push("/activity"),
    },
    {
      icon: <Star size={20} className="text-yellow-600" />,
      title: "Reviews",
      description: "Your ratings and reviews",
      onClick: () => router.push("/reviews"),
    },
    {
      icon: <Bell size={20} className="text-green-600" />,
      title: "Notifications",
      description: "Manage your notifications",
      onClick: () => router.push("/notifications"),
    },
    {
      icon: <CreditCard size={20} className="text-indigo-600" />,
      title: "Payment Methods",
      description: "Manage your payment options",
      onClick: () => router.push("/payment-methods"),
    },
    {
      icon: <Settings size={20} className="text-gray-600" />,
      title: "Settings",
      description: "App preferences and more",
      onClick: () => router.push("/settings"),
    },
  ];

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-6">Account</h1>

      {/* User Profile Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 mr-4 overflow-hidden">
            {user.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={user.fullName || "User"}
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={30} />
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold">
              {user.fullName || user.firstName || "User"}
            </h2>
            <p className="text-gray-500 text-sm">
              {user.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        {menuItems.map((item, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer ${
              index !== menuItems.length - 1 ? "border-b border-gray-200" : ""
            }`}
            onClick={item.onClick}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                {item.icon}
              </div>
              <div>
                <h3 className="font-medium">{item.title}</h3>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </div>
        ))}
      </div>

      {/* Sign Out Button */}
      <button
        onClick={handleSignOut}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors"
      >
        <LogOut size={18} />
        {loading ? "Signing out..." : "Sign Out"}
      </button>

      <p className="text-xs text-gray-500 text-center mt-6">
        App Version 1.0.0
      </p>
    </div>
  );
}
