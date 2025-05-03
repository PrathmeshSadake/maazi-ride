"use client";

import {
  User,
  Settings,
  CreditCard,
  Bell,
  LogOut,
  Car,
  Star,
  Shield,
  FileText,
  HelpCircle,
} from "lucide-react";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
export default function DriverAccountPage() {
  const { user } = useUser();
  const menuItems = [
    {
      icon: User,
      label: "Personal Information",
      href: "/drivers/account/profile",
    },
    {
      icon: Car,
      label: "My Vehicle",
      href: "/drivers/account/vehicle",
    },
    {
      icon: Star,
      label: "Ratings & Reviews",
      href: "/drivers/account/ratings",
    },
    {
      icon: Shield,
      label: "Documents & Verification",
      href: "/drivers/account/documents",
    },
    {
      icon: CreditCard,
      label: "Payment Information",
      href: "/drivers/account/payment",
    },
    {
      icon: FileText,
      label: "Tax Information",
      href: "/drivers/account/tax",
    },
    {
      icon: Bell,
      label: "Notifications",
      href: "/drivers/account/notifications",
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      href: "/drivers/account/help",
    },
    {
      icon: Settings,
      label: "Settings",
      href: "/drivers/account/settings",
    },
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Account</h1>

      <div className="flex items-center mb-6">
        <Avatar>
          <AvatarImage src={user?.imageUrl} />
          <AvatarFallback>{user?.fullName?.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="ml-4">
          <h2 className="text-xl font-semibold">{user?.fullName}</h2>
          <div className="flex items-center">
            <p className="text-gray-500">
              {user?.emailAddresses[0].emailAddress}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-green-50 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <Shield size={20} className="text-green-800 mr-3" />
          <div>
            <h3 className="font-medium">Account Status: Active</h3>
            <p className="text-sm text-gray-600">All documents verified</p>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        {menuItems.map((item, index) => (
          <a
            key={index}
            href={item.href}
            className="flex items-center p-4 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <item.icon size={20} className="text-gray-500 mr-3" />
            <span className="flex-1">{item.label}</span>
          </a>
        ))}
        <SignOutButton>
          <div className="cursor-pointer flex items-center p-4 hover:bg-gray-50 rounded-lg transition-colors">
            <LogOut size={20} className="text-gray-500 mr-3" />
            <span className="flex-1">Log Out</span>
          </div>
        </SignOutButton>
      </div>

      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>Driver App Version 1.0.0</p>
      </div>
    </div>
  );
}
