"use client";

import { useState, useRef, useEffect } from "react";
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
  ArrowLeft,
  Camera,
  Upload,
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
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export default function AccountPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const { logout } = useLogout();
  const [loading, setLoading] = useState(false);
  const [showSignOutSheet, setShowSignOutSheet] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state for editing
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    image: "",
  });

  // Initialize form when session data is available
  useEffect(() => {
    if (session?.user) {
      setEditForm({
        name: session.user.name || "",
        phone: "", // We'll fetch this from the user profile API if needed
        image: session.user.image || "",
      });
    }
  }, [session?.user]);

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

  const handleEditToggle = () => {
    if (isEditingProfile) {
      // Reset form when canceling
      setEditForm({
        name: session?.user?.name || "",
        phone: "", // We'll fetch this from the user profile API if needed
        image: session?.user?.image || "",
      });
    }
    setIsEditingProfile(!isEditingProfile);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      setEditForm((prev) => ({
        ...prev,
        image: data.url,
      }));
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!session?.user?.id) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/users/${session.user.id}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedUser = await response.json();

      // Update the session with new data
      await update({
        ...session,
        user: {
          ...session.user,
          name: updatedUser.name,
          image: updatedUser.image,
        },
      });

      setIsEditingProfile(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-semibold text-gray-900">Loading...</p>
            <p className="text-sm text-gray-500">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    router.push("/sign-in");
    return null;
  }

  const menuItems = [
    {
      icon: Clock,
      title: "Ride History",
      description: "Your past and upcoming rides",
      onClick: () => router.push("/activity"),
      badge: null,
      color: "purple",
    },
    {
      icon: Star,
      title: "Reviews & Ratings",
      description: "Your ratings and reviews",
      onClick: () => router.push("/account/reviews"),
      badge: "4.8",
      color: "yellow",
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Manage your notifications",
      onClick: () => router.push("/account/notifications"),
      badge: "3",
      color: "green",
    },
    {
      icon: Shield,
      title: "Privacy & Security",
      description: "Manage your privacy settings",
      onClick: () => {},
      badge: null,
      color: "blue",
    },
    {
      icon: HelpCircle,
      title: "Help & Support",
      description: "Get help and contact support",
      onClick: () => {},
      badge: null,
      color: "orange",
    },
  ];

  const getIconColorClasses = (color: string) => {
    const colorMap = {
      purple: "bg-purple-100 text-purple-600",
      yellow: "bg-yellow-100 text-yellow-600",
      green: "bg-green-100 text-green-600",
      blue: "bg-blue-100 text-blue-600",
      orange: "bg-orange-100 text-orange-600",
    };
    return (
      colorMap[color as keyof typeof colorMap] || "bg-gray-100 text-gray-600"
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="flex items-center px-4 pt-8 pb-4">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Account</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-6 space-y-3">
        {/* Profile Card */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Avatar className="w-16 h-16 border-2 border-white/20 mr-4">
                <AvatarImage
                  src={editForm.image || session?.user?.image || ""}
                />
                <AvatarFallback className="bg-white/20 text-white text-xl font-semibold">
                  {(editForm.name || session?.user?.name)?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h2 className="text-lg font-semibold">
                    {editForm.name || session?.user?.name || "User"}
                  </h2>
                  <div className="bg-green-400/20 border border-green-400/30 text-green-100 text-xs px-2 py-0.5 rounded-full font-medium">
                    Verified
                  </div>
                </div>
                <p className="text-white/80 text-sm mb-1">
                  {session?.user?.email}
                </p>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <span className="text-white/90 text-xs">Active User</span>
                </div>
              </div>
            </div>

            <Drawer open={isEditingProfile} onOpenChange={setIsEditingProfile}>
              <DrawerTrigger asChild>
                <button
                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"
                  onClick={() => setIsEditingProfile(true)}
                >
                  <Edit className="w-4 h-4 text-white" />
                </button>
              </DrawerTrigger>
              <DrawerContent className="flex flex-col px-4">
                <DrawerHeader className="flex-shrink-0 pb-4 border-b border-gray-200">
                  <DrawerTitle>Edit Profile</DrawerTitle>
                </DrawerHeader>

                {/* Scrollable content area */}
                <div className="flex-1 overflow-y-auto py-4">
                  <div className="space-y-6">
                    <div className="flex justify-center">
                      <div className="relative">
                        <Avatar className="w-24 h-24 border-4 border-blue-100">
                          <AvatarImage src={editForm.image || ""} />
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-2xl font-semibold">
                            {editForm.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingImage}
                          className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 disabled:opacity-50"
                        >
                          {isUploadingImage ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Camera className="w-4 h-4" />
                          )}
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 active:bg-gray-300 transition-colors disabled:opacity-50"
                    >
                      {isUploadingImage ? "Uploading..." : "Change Photo"}
                    </button>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">
                          Name
                        </label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={session?.user?.email || ""}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                          disabled
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={editForm.phone}
                          onChange={(e) =>
                            handleInputChange("phone", e.target.value)
                          }
                          placeholder="Add phone number"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      </div>
                    </div>

                    {/* Add some bottom padding for better scrolling */}
                    <div className="h-4"></div>
                  </div>
                </div>

                {/* Fixed action buttons at bottom */}
                <div className="flex-shrink-0 py-4 border-t border-gray-200 bg-white">
                  <div className="flex space-x-3 pb-safe">
                    <button
                      onClick={handleEditToggle}
                      disabled={isSaving}
                      className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 active:bg-gray-300 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving || isUploadingImage}
                      className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 active:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {menuItems.map((item, index) => (
            <button
              key={index}
              className={`w-full flex items-center p-3 hover:bg-gray-50 active:bg-gray-100 transition-colors ${
                index !== menuItems.length - 1 ? "border-b border-gray-50" : ""
              }`}
              onClick={item.onClick}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${getIconColorClasses(
                  item.color
                )}`}
              >
                <item.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-gray-900 text-sm">
                  {item.title}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {item.description}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {item.badge && (
                  <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                    {item.badge}
                  </div>
                )}
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </button>
          ))}
        </div>

        {/* Contact Support */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">
              Need Help?
            </h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 active:bg-gray-300 transition-colors">
                <Phone className="w-4 h-4" />
                <span>Call Support</span>
              </button>
              <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 active:bg-gray-300 transition-colors">
                <Mail className="w-4 h-4" />
                <span>Email Us</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sign Out */}
        <Drawer open={showSignOutSheet} onOpenChange={setShowSignOutSheet}>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <DrawerTrigger asChild>
              <button className="w-full flex items-center justify-center space-x-2 p-3 hover:bg-red-50 active:bg-red-100 transition-colors">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <LogOut className="w-4 h-4 text-red-600" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-red-600 text-sm">
                    Sign Out
                  </div>
                  <div className="text-xs text-red-400 mt-0.5">
                    Sign out of your account
                  </div>
                </div>
              </button>
            </DrawerTrigger>
          </div>
          <DrawerContent className="h-auto">
            <DrawerHeader>
              <DrawerTitle>Sign Out</DrawerTitle>
            </DrawerHeader>
            <div className="p-6">
              <p className="text-gray-600 mb-6 text-center">
                Are you sure you want to sign out of your account?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowSignOutSheet(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 active:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSignOut}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 active:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Signing out..." : "Sign Out"}
                </button>
              </div>
            </div>
          </DrawerContent>
        </Drawer>

        {/* App Version */}
        <div className="text-center pt-2">
          <p className="text-xs text-gray-400">Maazi Ride • Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
}
