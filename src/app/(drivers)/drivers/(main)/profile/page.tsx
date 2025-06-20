"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Star,
  Edit3,
  Car,
  Shield,
  Calendar,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  User,
  Bell,
  Palette,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "personal" | "vehicle" | "preferences"
  >("personal");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white">
        <div className="flex items-center px-4 pt-8 pb-4">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
        </div>

        {/* Profile Header */}
        <div className="px-4 pb-4">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
              <span className="text-xl font-bold text-white">JD</span>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">
                John Driver
              </h2>
              <p className="text-sm text-gray-500">Driver since Oct 2023</p>
              <div className="flex items-center mt-1">
                <div className="flex items-center">
                  {[1, 2, 3, 4].map((star) => (
                    <Star
                      key={star}
                      className="w-3 h-3 text-amber-400 fill-current"
                    />
                  ))}
                  <Star className="w-3 h-3 text-gray-300" />
                </div>
                <span className="text-xs text-gray-500 ml-1">(4.8)</span>
              </div>
            </div>
            <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <Edit3 className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === "personal"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("personal")}
          >
            Personal
          </button>
          <button
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === "vehicle"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("vehicle")}
          >
            Vehicle
          </button>
          <button
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === "preferences"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("preferences")}
          >
            Settings
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-20 pt-4 space-y-4">
        {activeTab === "personal" && (
          <>
            {/* Personal Information */}
            <div className="bg-white rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">
                  Personal Information
                </h2>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        Full Name
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        John Driver
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <Mail className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        Email
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        john.driver@example.com
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <Phone className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        Phone Number
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        +1 234 567 8900
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mr-3">
                      <MapPin className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        Location
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        San Francisco, CA
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Driving Stats */}
            <div className="bg-white rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">
                  Driving Statistics
                </h2>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">156</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Trips Completed
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">4.8</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Average Rating
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">98%</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Acceptance Rate
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">2.5y</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Experience
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "vehicle" && (
          <>
            {/* Vehicle Information */}
            <div className="bg-white rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">
                  Vehicle Details
                </h2>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <Car className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        Make & Model
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Toyota Camry 2020
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-xs font-bold text-gray-600">#</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        License Plate
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        ABC-1234
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        Color
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">Silver</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">
                  Vehicle Documents
                </h2>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <Car className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        Registration
                      </div>
                      <div className="text-xs text-green-600 mt-0.5">
                        Expires: Dec 15, 2024
                      </div>
                    </div>
                  </div>
                  <div className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    Valid
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <Shield className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        Insurance
                      </div>
                      <div className="text-xs text-green-600 mt-0.5">
                        Expires: Aug 30, 2024
                      </div>
                    </div>
                  </div>
                  <div className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    Valid
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "preferences" && (
          <>
            {/* App Preferences */}
            <div className="bg-white rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">
                  App Preferences
                </h2>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <Bell className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        Notifications
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Push notifications & alerts
                      </div>
                    </div>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-blue-500">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <Palette className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        Dark Mode
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Toggle between light and dark
                      </div>
                    </div>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-gray-300">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <MapPin className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        Auto-Accept
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Automatically accept nearby rides
                      </div>
                    </div>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-gray-300">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                  </button>
                </div>
              </div>
            </div>

            {/* Earnings Summary */}
            <div className="bg-white rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">
                  Earnings Overview
                </h2>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-blue-900">
                      ₹2,450
                    </div>
                    <div className="text-xs text-blue-600 mt-0.5">Today</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-green-900">
                      ₹18,750
                    </div>
                    <div className="text-xs text-green-600 mt-0.5">
                      This Week
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-purple-900">
                      ₹67,890
                    </div>
                    <div className="text-xs text-purple-600 mt-0.5">
                      This Month
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
