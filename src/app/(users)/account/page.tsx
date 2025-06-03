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
  Edit,
  Shield,
  HelpCircle,
  Phone,
  Mail,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useLogout } from "@/hooks/useLogout";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AccountPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { logout } = useLogout();
  const [loading, setLoading] = useState(false);
  const [showSignOutSheet, setShowSignOutSheet] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await logout("/");
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-3 border-t-blue-600 border-r-transparent border-b-blue-600 border-l-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 font-medium">Loading your profile...</p>
      </div>
    );
  }

  if (!session?.user) {
    router.push("/sign-in");
    return null;
  }

  const menuItems = [
    {
      icon: <Clock size={20} className="text-purple-600" />,
      title: "Ride History",
      description: "Your past and upcoming rides",
      onClick: () => router.push("/activity"),
      badge: null,
    },
    {
      icon: <Star size={20} className="text-yellow-600" />,
      title: "Reviews & Ratings",
      description: "Your ratings and reviews",
      onClick: () => router.push("/account/reviews"),
      badge: "4.8",
    },
    {
      icon: <Bell size={20} className="text-green-600" />,
      title: "Notifications",
      description: "Manage your notifications",
      onClick: () => router.push("/account/notifications"),
      badge: "3",
    },
    {
      icon: <Shield size={20} className="text-blue-600" />,
      title: "Privacy & Security",
      description: "Manage your privacy settings",
      onClick: () => {},
      badge: null,
    },
    {
      icon: <HelpCircle size={20} className="text-orange-600" />,
      title: "Help & Support",
      description: "Get help and contact support",
      onClick: () => {},
      badge: null,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <div className="bg-sky-600 shadow-sm border-b border-gray-100">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-white">Account</h1>
          <p className="text-gray-200 text-sm">
            Manage your profile and preferences
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        {/* User Profile Section */}
        <Card className="shadow-none py-3 border-0 bg-white/80 backdrop-blur-sm mb-4">
          <CardContent className="px-4 py-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Avatar className="w-16 h-16 mr-4 ring-4 ring-blue-100">
                  <AvatarImage src={session?.user?.image || ""} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold">
                    {session?.user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-900">
                      {session?.user?.name || "User"}
                    </h2>
                    <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                      Verified
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {session?.user?.email}
                  </p>
                </div>
              </div>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-full">
                    <Edit size={16} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[85vh] flex flex-col">
                  <SheetHeader className="flex-shrink-0 pb-4 border-b border-gray-200">
                    <SheetTitle>Edit Profile</SheetTitle>
                  </SheetHeader>

                  {/* Scrollable content area */}
                  <div className="flex-1 overflow-y-auto py-4">
                    <div className="space-y-6">
                      <div className="flex justify-center">
                        <Avatar className="w-24 h-24 ring-4 ring-blue-100">
                          <AvatarImage src={session?.user?.image || ""} />
                          <AvatarFallback className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-2xl font-semibold">
                            {session?.user?.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      <Button variant="outline" className="w-full">
                        Change Photo
                      </Button>

                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-2">
                            Name
                          </label>
                          <input
                            type="text"
                            defaultValue={session?.user?.name || ""}
                            className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            defaultValue={session?.user?.email || ""}
                            className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base bg-gray-50"
                            disabled
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-2">
                            Phone
                          </label>
                          <input
                            type="tel"
                            placeholder="Add phone number"
                            className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                          />
                        </div>
                      </div>

                      {/* Add some bottom padding for better scrolling */}
                      <div className="h-4"></div>
                    </div>
                  </div>

                  {/* Fixed action buttons at bottom */}
                  <div className="flex-shrink-0 pt-4 border-t border-gray-200 bg-white">
                    <div className="flex gap-3 pb-safe">
                      <Button variant="outline" className="flex-1 py-3">
                        Cancel
                      </Button>
                      <Button className="flex-1 py-3 bg-blue-600 hover:bg-blue-700">
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4 px-2">
          <div className="bg-white backdrop-blur-sm rounded-xl p-4 text-center border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">12</div>
            <p className="text-xs text-gray-600 font-medium">Total Rides</p>
          </div>
          <div className="bg-white backdrop-blur-sm rounded-xl p-4 text-center border border-gray-200">
            <div className="text-2xl font-bold text-green-600">4.8</div>
            <p className="text-xs text-gray-600 font-medium">Rating</p>
          </div>
          <div className="bg-white backdrop-blur-sm rounded-xl p-4 text-center border border-gray-200">
            <div className="text-2xl font-bold text-purple-600">₹2.4k</div>
            <p className="text-xs text-gray-600 font-medium">Saved</p>
          </div>
        </div>

        {/* Menu Items */}
        <Card className="shadow-none border-0 bg-white/80 backdrop-blur-sm rounded-none border-b border-gray-200 py-0">
          <CardContent className="p-0">
            {menuItems.map((item, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-4 hover:bg-gray-50/80 cursor-pointer transition-colors ${
                  index !== menuItems.length - 1
                    ? "border-b border-gray-100"
                    : ""
                }`}
                onClick={item.onClick}
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mr-4">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {item.badge && (
                    <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                      {item.badge}
                    </div>
                  )}
                  <ChevronRight size={20} className="text-gray-400" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card className="shadow-none border-0 bg-white/80 backdrop-blur-sm rounded-none">
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Phone size={16} />
                Call Support
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Mail size={16} />
                Email Us
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sign Out */}
        <Sheet open={showSignOutSheet} onOpenChange={setShowSignOutSheet}>
          <div className="bg-white p-2">
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="w-full py-3 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
              >
                <LogOut size={18} className="mr-2" />
                Sign Out
              </Button>
            </SheetTrigger>
          </div>
          <SheetContent side="bottom" className="h-auto">
            <SheetHeader>
              <SheetTitle>Sign Out</SheetTitle>
            </SheetHeader>
            <div className="py-6">
              <p className="text-gray-600 mb-6">
                Are you sure you want to sign out of your account?
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowSignOutSheet(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSignOut}
                  disabled={loading}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {loading ? "Signing out..." : "Sign Out"}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <p className="text-xs text-gray-500 text-center py-2">
          Maazi Ride • Version 1.0.0
        </p>
      </div>
    </div>
  );
}
