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

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useLogout } from "@/hooks/useLogout";
import Link from "next/link";

export default function DriverAccountPage() {
  const { data: session, status } = useSession();
  const { logout } = useLogout();
  const router = useRouter();

  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

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
  ];

  const handleLogout = async () => {
    try {
      await logout("/");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Account</h1>

      <div className="flex items-center mb-6">
        <Avatar>
          <AvatarFallback>{session?.user?.name?.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="ml-4">
          <h2 className="text-xl font-semibold">{session?.user?.name}</h2>
          <div className="flex items-center">
            <p className="text-gray-500">{session?.user?.email}</p>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className="flex items-center p-4 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <item.icon size={20} className="text-gray-500 mr-3" />
            <span className="flex-1">{item.label}</span>
          </Link>
        ))}
      </div>

      <Button onClick={handleLogout} className="w-full mt-4">
        <LogOut size={20} className="text-gray-500 mr-3" />
        <span className="flex-1">Log Out</span>
      </Button>

      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>Driver App Version 1.0.0</p>
      </div>
    </div>
  );
}
