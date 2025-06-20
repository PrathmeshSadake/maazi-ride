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
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error Loading Profile
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const verificationStatus = getVerificationStatus();
  const profileCompletion = getProfileCompletion();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">My Profile</h1>
          </div>

          {/* Edit/Save/Cancel buttons */}
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditToggle}
                  disabled={isSaving}
                  className="flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? "Saving..." : "Save"}</span>
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEditToggle}
                className="flex items-center space-x-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6 max-w-md mx-auto">
        {/* Profile Header Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <Avatar className="w-20 h-20 border-4 border-green-100">
                <AvatarFallback className="bg-green-100 text-green-800 text-xl font-bold">
                  {(isEditing ? editForm.name : profile?.name)?.[0] || "D"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  {isEditing ? (
                    <div className="w-full">
                      <Label htmlFor="name" className="text-xs text-gray-500">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        value={editForm.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        className="mt-1 text-lg font-bold"
                        placeholder="Enter your name"
                      />
                    </div>
                  ) : (
                    <>
                      <h2 className="text-xl font-bold text-gray-900 truncate">
                        {profile?.name || "Driver"}
                      </h2>
                      {profile?.isVerified && (
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      )}
                    </>
                  )}
                </div>

                {!isEditing && (
                  <>
                    <div className="flex items-center space-x-1 mb-3">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-900">
                        {profile?.stats.rating.toFixed(1) || "0.0"}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({profile?.stats.reviewCount} reviews)
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Trophy className="w-4 h-4" />
                        <span>{profile?.stats.totalRides} rides</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
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
                    Verification Status
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
                      ? "Pending Review"
                      : "Incomplete"}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Profile Completion</span>
                    <span className="font-medium">{profileCompletion}%</span>
                  </div>
                  <Progress value={profileCompletion} className="h-2" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Mail className="w-5 h-5" />
              <span>Contact Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {profile?.email || "Not provided"}
                    </p>
                    <p className="text-xs text-gray-500">Email Address</p>
                  </div>
                </div>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <div className="flex-1">
                    {isEditing ? (
                      <div>
                        <Label
                          htmlFor="phone"
                          className="text-xs text-gray-500"
                        >
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          value={editForm.phone}
                          onChange={(e) =>
                            handleInputChange("phone", e.target.value)
                          }
                          className="mt-1"
                          placeholder="Enter phone number"
                          type="tel"
                        />
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {profile?.phone || "Not provided"}
                        </p>
                        <p className="text-xs text-gray-500">Phone Number</p>
                      </div>
                    )}
                  </div>
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
              <Separator />

              <div className="flex items-center space-x-3">
                <User className="w-4 h-4 text-gray-400" />
                <div className="flex-1">
                  {isEditing ? (
                    <div>
                      <Label htmlFor="upiId" className="text-xs text-gray-500">
                        UPI ID (Optional)
                      </Label>
                      <Input
                        id="upiId"
                        value={editForm.upiId}
                        onChange={(e) =>
                          handleInputChange("upiId", e.target.value)
                        }
                        className="mt-1"
                        placeholder="Enter UPI ID"
                      />
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {profile?.upiId || "Not provided"}
                      </p>
                      <p className="text-xs text-gray-500">UPI ID</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Information */}
        {profile?.vehicle && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Car className="w-5 h-5" />
                <span>Vehicle Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
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
            </CardContent>
          </Card>
        )}

        {/* Documents Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Documents</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
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
                <div
                  key={doc.key}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-gray-700">{doc.label}</span>
                  {doc.verified ? (
                    <Badge variant="default" className="text-xs">
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
          </CardContent>
        </Card>

        {/* Recent Reviews */}
        {profile?.recentReviews &&
          profile.recentReviews.length > 0 &&
          !isEditing && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Star className="w-5 h-5" />
                  <span>Recent Reviews</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.recentReviews.map((review, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-green-200 pl-4"
                    >
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
              </CardContent>
            </Card>
          )}

        {/* Action Buttons - Only show when not editing */}
        {!isEditing && (
          <div className="space-y-3 pb-6">
            <Button
              onClick={() => router.push("/drivers/account/documents")}
              className="w-full h-12"
              variant="outline"
            >
              <Shield className="w-4 h-4 mr-2" />
              Manage Documents
            </Button>

            <Button
              onClick={() => router.push("/drivers/account/vehicle")}
              className="w-full h-12"
              variant="outline"
            >
              <Car className="w-4 h-4 mr-2" />
              Vehicle Information
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
