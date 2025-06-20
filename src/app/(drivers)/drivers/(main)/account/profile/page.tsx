"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Star,
  Calendar,
  Shield,
  Car,
  MapPin,
  Edit3,
  CheckCircle,
  XCircle,
  Trophy,
  Clock,
  Save,
  X,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DriverProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  phoneVerified: boolean;
  driverRating?: number;
  ridesCompleted: number;
  isVerified: boolean;
  memberSince: string;
  hasDocuments: {
    drivingLicense: boolean;
    vehicleRegistration: boolean;
    insurance: boolean;
  };
  vehicle?: {
    id: string;
    make: string;
    model: string;
    year?: number;
    color?: string;
    licensePlate?: string;
    vehicleImages: string[];
  };
  upiId?: string;
  recentReviews: Array<{
    rating: number;
    comment?: string;
    author: { name: string };
    createdAt: string;
  }>;
  stats: {
    totalRides: number;
    rating: number;
    reviewCount: number;
  };
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    upiId: "",
  });

  // Fetch user profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (status === "loading") return;

      if (status === "unauthenticated") {
        router.push("/auth/signin");
        return;
      }

      try {
        const response = await fetch(
          `/api/drivers/${session?.user?.id}/profile`
        );

        if (!response.ok) {
          throw new Error("Failed to load profile information");
        }

        const data = await response.json();
        setProfile(data);
        // Initialize edit form with current data
        setEditForm({
          name: data.name || "",
          phone: data.phone || "",
          upiId: data.upiId || "",
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile information. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [status, session, router]);

  // Handle edit mode toggle
  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form to original values when canceling
      setEditForm({
        name: profile?.name || "",
        phone: profile?.phone || "",
        upiId: profile?.upiId || "",
      });
    }
    setIsEditing(!isEditing);
  };

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle save profile
  const handleSaveProfile = async () => {
    if (!session?.user?.id) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/drivers/${session.user.id}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      // Update local profile state
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              name: editForm.name,
              phone: editForm.phone,
              upiId: editForm.upiId,
            }
          : null
      );

      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate profile completion percentage
  const getProfileCompletion = () => {
    if (!profile) return 0;

    const fields = [
      profile.name,
      profile.phone,
      profile.hasDocuments.drivingLicense,
      profile.hasDocuments.vehicleRegistration,
      profile.hasDocuments.insurance,
      profile.vehicle,
      profile.upiId,
    ];

    const completedFields = fields.filter(Boolean).length;
    return Math.round((completedFields / fields.length) * 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const getVerificationStatus = () => {
    if (!profile) return "incomplete";

    const hasAllDocs =
      profile.hasDocuments.drivingLicense &&
      profile.hasDocuments.vehicleRegistration &&
      profile.hasDocuments.insurance;

    if (profile.isVerified && hasAllDocs) return "verified";
    if (hasAllDocs) return "pending";
    return "incomplete";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white px-4 pt-8 pb-4">
          <div className="h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
        </div>
        <div className="px-4 space-y-4">
          <div className="bg-white rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-6 text-center max-w-sm w-full">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Profile
          </h3>
          <p className="text-gray-600 mb-4 text-sm">{error}</p>
          <Button onClick={() => window.location.reload()} className="w-full">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const verificationStatus = getVerificationStatus();
  const profileCompletion = getProfileCompletion();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white">
        <div className="flex items-center justify-between px-4 pt-8 pb-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.back()}
              className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">My Profile</h1>
          </div>

          {/* Edit/Save/Cancel buttons */}
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleEditToggle}
                  disabled={isSaving}
                  className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-full"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="px-3 py-1.5 text-sm text-white bg-blue-500 rounded-full"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </>
            ) : (
              <button
                onClick={handleEditToggle}
                className="px-3 py-1.5 text-sm text-blue-500 bg-blue-50 rounded-full"
              >
                Edit
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pb-6 space-y-4">
        {/* Profile Header Card */}
        <div className="bg-white rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <Avatar className="w-16 h-16 border-2 border-blue-100">
              <AvatarFallback className="bg-blue-100 text-blue-800 text-xl font-bold">
                {(isEditing ? editForm.name : profile?.name)?.[0] || "D"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={editForm.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="text-lg font-bold border-0 p-0 focus-visible:ring-0"
                    placeholder="Enter your name"
                  />
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-2 mb-1">
                    <h2 className="text-lg font-bold text-gray-900 truncate">
                      {profile?.name || "Driver"}
                    </h2>
                    {profile?.isVerified && (
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    )}
                  </div>

                  <div className="flex items-center space-x-1 mb-2">
                    <Star className="w-3 h-3 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-900">
                      {profile?.stats.rating.toFixed(1) || "0.0"}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({profile?.stats.reviewCount} reviews)
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-xs text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Trophy className="w-3 h-3" />
                      <span>{profile?.stats.totalRides} rides</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        Since {formatDate(profile?.memberSince || "")}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Verification Status */}
          {!isEditing && (
            <div className="mt-4 p-3 rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Profile Completion
                </span>
                <Badge
                  variant={
                    verificationStatus === "verified"
                      ? "default"
                      : verificationStatus === "pending"
                      ? "secondary"
                      : "destructive"
                  }
                  className="text-xs"
                >
                  {verificationStatus === "verified"
                    ? "Verified"
                    : verificationStatus === "pending"
                    ? "Pending"
                    : "Incomplete"}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-600">
                  {profileCompletion}% complete
                </span>
              </div>
              <Progress value={profileCompletion} className="h-2" />
            </div>
          )}
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">
              Contact Information
            </h3>
          </div>

          <div className="p-4 space-y-4">
            {/* Email */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <Mail className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {profile?.email || "Not provided"}
                </p>
                <p className="text-xs text-gray-500">Email Address</p>
              </div>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>

            {/* Phone */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <Phone className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <Input
                    value={editForm.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="Enter phone number"
                    type="tel"
                    className="text-sm"
                  />
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-900">
                      {profile?.phone || "Not provided"}
                    </p>
                    <p className="text-xs text-gray-500">Phone Number</p>
                  </>
                )}
              </div>
              {!isEditing && (
                <>
                  {profile?.phoneVerified ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                </>
              )}
            </div>

            {/* UPI ID */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <Input
                    value={editForm.upiId}
                    onChange={(e) => handleInputChange("upiId", e.target.value)}
                    placeholder="Enter UPI ID (Optional)"
                    className="text-sm"
                  />
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-900">
                      {profile?.upiId || "Not provided"}
                    </p>
                    <p className="text-xs text-gray-500">UPI ID</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Information */}
        {profile?.vehicle && (
          <div className="bg-white rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900 flex items-center">
                <Car className="w-4 h-4 mr-2" />
                Vehicle Details
              </h3>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {profile.vehicle.year} {profile.vehicle.make}{" "}
                  {profile.vehicle.model}
                </p>
                <p className="text-xs text-gray-500">Vehicle</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {profile.vehicle.color || "Not specified"}
                  </p>
                  <p className="text-xs text-gray-500">Color</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {profile.vehicle.licensePlate || "Not provided"}
                  </p>
                  <p className="text-xs text-gray-500">License Plate</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Documents Status */}
        <div className="bg-white rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900 flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Documents
            </h3>
          </div>

          <div className="p-4 space-y-3">
            {[
              {
                key: "drivingLicense",
                label: "Driving License",
                verified: profile?.hasDocuments.drivingLicense,
              },
              {
                key: "vehicleRegistration",
                label: "Vehicle Registration",
                verified: profile?.hasDocuments.vehicleRegistration,
              },
              {
                key: "insurance",
                label: "Insurance Certificate",
                verified: profile?.hasDocuments.insurance,
              },
            ].map((doc) => (
              <div key={doc.key} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{doc.label}</span>
                {doc.verified ? (
                  <Badge
                    variant="default"
                    className="text-xs bg-green-100 text-green-800"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Uploaded
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    Pending
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Reviews */}
        {profile?.recentReviews &&
          profile.recentReviews.length > 0 &&
          !isEditing && (
            <div className="bg-white rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900 flex items-center">
                  <Star className="w-4 h-4 mr-2" />
                  Recent Reviews
                </h3>
              </div>

              <div className="p-4 space-y-4">
                {profile.recentReviews.map((review, index) => (
                  <div key={index} className="border-l-4 border-blue-200 pl-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < review.rating
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        by {review.author.name}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-gray-700 italic">
                        "{review.comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Action Buttons */}
        {!isEditing && (
          <div className="space-y-3">
            <button
              onClick={() => router.push("/drivers/account/documents")}
              className="w-full flex items-center p-3 bg-white rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                <Shield className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-gray-900 text-sm">
                  Manage Documents
                </div>
                <div className="text-xs text-gray-500">
                  Upload and verify documents
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            <button
              onClick={() => router.push("/drivers/account/vehicle")}
              className="w-full flex items-center p-3 bg-white rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                <Car className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-gray-900 text-sm">
                  Vehicle Information
                </div>
                <div className="text-xs text-gray-500">
                  Update vehicle details
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
