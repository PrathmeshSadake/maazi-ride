"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Phone, Mail } from "lucide-react";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is loaded from Clerk
  useEffect(() => {
    if (isLoaded) {
      setIsLoading(false);
    }
  }, [isLoaded]);

  if (isLoading) {
    return (
      <div className="p-4 max-w-3xl mx-auto">
        <div className="py-8 text-center">Loading profile information...</div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 mr-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Personal Information</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-8">
          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt="Profile picture"
              className="w-24 h-24 rounded-full object-cover border-4 border-green-100"
            />
          ) : (
            <div className="w-24 h-24 rounded-full overflow-hidden bg-green-100 flex items-center justify-center text-green-800 text-2xl font-bold">
              {user?.firstName?.[0] || "D"}
            </div>
          )}

          <div className="ml-4">
            <h2 className="text-xl font-semibold">
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : "Your Name"}
            </h2>
            <p className="text-gray-500 mt-1">Driver</p>

            <button
              onClick={() =>
                window.open(
                  "https://accounts.maaziride.com/user/profile/picture",
                  "_blank"
                )
              }
              className="mt-2 px-3 py-1 text-sm bg-green-50 text-green-700 rounded-full hover:bg-green-100"
            >
              Update Photo
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-2">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <User size={14} />
                  <span>First Name</span>
                </div>
                <p className="font-medium">
                  {user?.firstName || "Not provided"}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <User size={14} />
                  <span>Last Name</span>
                </div>
                <p className="font-medium">
                  {user?.lastName || "Not provided"}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-md font-medium text-gray-700 mb-2">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <Mail size={14} />
                  <span>Email Address</span>
                </div>
                <p className="font-medium">
                  {user?.emailAddresses?.[0]?.emailAddress || "Not provided"}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <Phone size={14} />
                  <span>Phone Number</span>
                </div>
                <p className="font-medium">
                  {user?.phoneNumbers?.[0]?.phoneNumber || "Not provided"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() =>
              window.open(
                "https://accounts.maaziride.com/user/profile",
                "_blank"
              )
            }
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Edit Profile
          </button>
          <p className="mt-2 text-sm text-gray-500">
            You will be redirected to the Maazi Ride account management page to
            update your information.
          </p>
        </div>
      </div>
    </div>
  );
}
