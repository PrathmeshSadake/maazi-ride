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
  RefreshCw,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useDriverVerification } from "@/hooks/useDriverVerification";
import { useEffect, useState } from "react";
import { useLogout } from "@/hooks/useLogout";
import Link from "next/link";

export default function DriverAccountPage() {
  const { data: session, status } = useSession();
  const { logout } = useLogout();
  const router = useRouter();
  const { verificationData, loading, error, isVerified, refetch } =
    useDriverVerification();
  const [driver, setDriver] = useState<any>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  // Handle session timeout
  useEffect(() => {
    if (status === "loading") {
      const timer = setTimeout(() => {
        if (status === "loading") {
          console.warn("Session loading timeout, refreshing page");
          window.location.reload();
        }
      }, 10000); // 10 second timeout

      return () => clearTimeout(timer);
    }
  }, [status]);

  // Handle verification data loading timeout
  useEffect(() => {
    if (loading && status === "authenticated") {
      const timer = setTimeout(() => {
        if (loading) {
          console.warn("Verification data loading timeout");
          // Force a retry
          handleRetry();
        }
      }, 8000); // 8 second timeout

      return () => clearTimeout(timer);
    }
  }, [loading, status]);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await refetch();
    } catch (error) {
      console.error("Error during retry:", error);
    } finally {
      setIsRetrying(false);
    }
  };

  // Show loading state with timeout option
  if (status === "loading") {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">Account</h1>
        <div className="py-8 text-center">
          <div className="text-lg mb-4">Loading session...</div>
          <div className="text-sm text-gray-500">
            If this takes too long, the page will refresh automatically
          </div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  // Show loading state for verification data with retry option
  if (loading && !error) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">Account</h1>
        <div className="py-8 text-center">
          <div className="text-lg mb-4">Loading account information...</div>
          <div className="text-sm text-gray-500 mb-4">
            Please wait while we fetch your data
          </div>
          <Button
            variant="outline"
            onClick={handleRetry}
            disabled={isRetrying}
            className="mt-4"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </>
            )}
          </Button>
        </div>
      </div>
    );
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

      <div
        className={`${
          isVerified ? "bg-green-50" : "bg-yellow-50"
        } rounded-lg p-4 mb-6`}
      >
        <div className="flex items-center">
          <Shield
            size={20}
            className={isVerified ? "text-green-800" : "text-yellow-800"}
          />
          <div className="ml-3">
            <h3 className="font-medium">
              Account Status: {isVerified ? "Verified" : "Pending Verification"}
            </h3>
            <p className="text-sm text-gray-600">
              {isVerified
                ? "All documents verified and account is active"
                : "Please complete document verification to start driving"}
            </p>
            {verificationData && !isVerified && (
              <div className="mt-2 text-xs text-gray-500">
                <p>
                  Documents:{" "}
                  {verificationData.hasDocuments.drivingLicense &&
                  verificationData.hasDocuments.vehicleRegistration &&
                  verificationData.hasDocuments.insurance
                    ? "✓"
                    : "✗"}{" "}
                  Uploaded
                </p>
                <p>Vehicle: {verificationData.hasVehicle ? "✓" : "✗"} Added</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 text-sm mb-2">
            Error loading verification status: {error}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            disabled={isRetrying}
          >
            {isRetrying ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </>
            )}
          </Button>
        </div>
      )}

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
