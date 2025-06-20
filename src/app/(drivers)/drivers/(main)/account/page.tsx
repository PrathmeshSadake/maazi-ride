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
  ChevronRight,
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

  const accountSections = [
    {
      title: "Profile",
      items: [
        {
          icon: User,
          label: "Personal Information",
          href: "/drivers/account/profile",
          subtitle: "Edit your profile details",
        },
        {
          icon: Car,
          label: "My Vehicle",
          href: "/drivers/account/vehicle",
          subtitle: "Vehicle information",
        },
      ],
    },
    {
      title: "Performance",
      items: [
        {
          icon: Star,
          label: "Ratings & Reviews",
          href: "/drivers/account/ratings",
          subtitle: "4.8 rating • 124 reviews",
        },
      ],
    },
    {
      title: "Account",
      items: [
        {
          icon: Shield,
          label: "Documents & Verification",
          href: "/drivers/account/documents",
          subtitle: "Manage your documents",
        },
        {
          icon: CreditCard,
          label: "Payment Information",
          href: "/drivers/account/payment",
          subtitle: "Banking & payment details",
        },
        {
          icon: Bell,
          label: "Notifications",
          href: "/drivers/account/notifications",
          subtitle: "Push notifications & alerts",
        },
        {
          icon: Settings,
          label: "Settings",
          href: "/drivers/account/settings",
          subtitle: "App preferences",
        },
        {
          icon: HelpCircle,
          label: "Help & Support",
          href: "/drivers/account/help",
          subtitle: "Get help when you need it",
        },
        {
          icon: FileText,
          label: "Tax Information",
          href: "/drivers/account/tax",
          subtitle: "Tax documents & reports",
        },
      ],
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white">
        <div className="px-4 pt-8 pb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Account</h1>

          {/* Profile Card */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 text-white">
            <div className="flex items-center">
              <Avatar className="w-12 h-12 border-2 border-white/20">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback className="bg-white/20 text-white text-lg font-semibold">
                  {session?.user?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="ml-3 flex-1">
                <h2 className="text-lg font-semibold">{session?.user?.name}</h2>
                <p className="text-white/80 text-sm">{session?.user?.email}</p>
                <div className="flex items-center mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <span className="text-white/90 text-xs">Active Driver</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-6">
        {accountSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-4">
            <h3 className="text-base font-semibold text-gray-900 mb-2 px-1">
              {section.title}
            </h3>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {section.items.map((item, itemIndex) => (
                <Link
                  key={itemIndex}
                  href={item.href}
                  className="flex items-center p-3 hover:bg-gray-50 active:bg-gray-100 transition-colors duration-150 border-b border-gray-50 last:border-b-0"
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                    <item.icon size={16} className="text-gray-600" />
                  </div>

                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">
                      {item.label}
                    </div>
                    {item.subtitle && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        {item.subtitle}
                      </div>
                    )}
                  </div>

                  <ChevronRight size={14} className="text-gray-400" />
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Logout Button */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={handleLogout}
            className="w-full flex items-center p-3 hover:bg-red-50 active:bg-red-100 transition-colors duration-150"
          >
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
              <LogOut size={16} className="text-red-600" />
            </div>

            <div className="flex-1 text-left">
              <div className="font-medium text-red-600 text-sm">Sign Out</div>
              <div className="text-xs text-red-400 mt-0.5">
                Sign out of your account
              </div>
            </div>
          </button>
        </div>

        {/* App Version */}
        <div className="mt-4 text-center">
          <p className="text-gray-400 text-xs">Driver App Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
}
