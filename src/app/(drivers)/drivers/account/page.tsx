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
import { useState, useEffect } from "react";

export default function DriverAccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [driverStatus, setDriverStatus] = useState<{
    isActive: boolean;
    message: string;
  }>({ isActive: false, message: "" });

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    // Check driver verification status
    const checkDriverStatus = async () => {
      try {
        const response = await fetch(
          `/api/drivers/${session?.user?.id}/status`
        );
        if (response.ok) {
          const data = await response.json();
          setDriverStatus({
            isActive: data.isVerified,
            message: data.isVerified
              ? "All documents verified"
              : "Verification pending",
          });
        }
      } catch (error) {
        console.error("Error fetching driver status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkDriverStatus();
  }, [status, session, router]);

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
    // {
    //   icon: FileText,
    //   label: "Tax Information",
    //   href: "/drivers/account/tax",
    // },
    // {
    //   icon: Bell,
    //   label: "Notifications",
    //   href: "/drivers/account/notifications",
    // },
    // {
    //   icon: HelpCircle,
    //   label: "Help & Support",
    //   href: "/drivers/account/help",
    // },
    // {
    //   icon: Settings,
    //   label: "Settings",
    //   href: "/drivers/account/settings",
    // },
  ];

  if (isLoading) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">Account</h1>
        <div className="py-8 text-center">Loading account information...</div>
      </div>
    );
  }

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

      <div
        className={`${
          driverStatus.isActive ? "bg-green-50" : "bg-yellow-50"
        } rounded-lg p-4 mb-6`}
      >
        <div className="flex items-center">
          <Shield
            size={20}
            className={
              driverStatus.isActive ? "text-green-800" : "text-yellow-800"
            }
          />
          <div className="ml-3">
            <h3 className="font-medium">
              Account Status: {driverStatus.isActive ? "Active" : "Pending"}
            </h3>
            <p className="text-sm text-gray-600">{driverStatus.message}</p>
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
      </div>

      <Button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="w-full mt-4"
      >
        <LogOut size={20} className="text-gray-500 mr-3" />
        <span className="flex-1">Log Out</span>
      </Button>

      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>Driver App Version 1.0.0</p>
      </div>
    </div>
  );
}
