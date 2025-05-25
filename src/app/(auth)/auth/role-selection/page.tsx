"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession, signIn } from "next-auth/react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Car, Users, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  RoleSelectionData,
  AuthLoadingStates,
  RoleUpdateApiResponse,
} from "@/lib/auth.types";
import {
  mapAuthError,
  getSuccessMessage,
  getLoadingMessage,
} from "@/lib/auth-utils";

export default function RoleSelectionPage() {
  const router = useRouter();
  const { update, data: session } = useSession();

  // Loading states
  const [loadingStates, setLoadingStates] = useState<AuthLoadingStates>({
    credentials: false,
    google: false,
    roleSelection: false,
    signUp: false,
  });

  const [selectedRole, setSelectedRole] = useState<"user" | "driver" | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const handleRoleSelection = async (role: "user" | "driver") => {
    if (loadingStates.roleSelection) return;

    setLoadingStates((prev) => ({ ...prev, roleSelection: true }));
    setSelectedRole(role);
    setError(null);

    try {
      const response = await fetch("/api/auth/set-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role } as RoleSelectionData),
      });

      const data: RoleUpdateApiResponse = await response.json();

      if (!response.ok) {
        const errorDetails = mapAuthError(data.error || "Failed to set role");
        setError(errorDetails.message);
        toast.error(errorDetails.message);
        return;
      }

      // Wait for session to update
      await update();

      toast.success(
        `Welcome! You've joined as a ${
          role === "user" ? "passenger" : "driver"
        }.`
      );

      // Small delay to show success message before redirect
      setTimeout(async () => {
        await signOut({ callbackUrl: "/auth/signin?roleJustSet=1" });
      }, 1500);
    } catch (error) {
      const errorDetails = mapAuthError(error as Error);
      setError(errorDetails.message);
      toast.error(errorDetails.message);
    } finally {
      setLoadingStates((prev) => ({ ...prev, roleSelection: false }));
      setSelectedRole(null);
    }
  };

  const handleSignOut = async () => {
    setLoadingStates((prev) => ({ ...prev, credentials: true }));
    try {
      await signOut({ callbackUrl: "/auth/signin" });
    } catch (error) {
      const errorDetails = mapAuthError(error as Error);
      toast.error(errorDetails.message);
      setLoadingStates((prev) => ({ ...prev, credentials: false }));
    }
  };

  const isLoading = Object.values(loadingStates).some(Boolean);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Maazi Ride!
          </h1>
          <p className="text-gray-600 text-lg">
            Choose how you'd like to use our platform
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert
            variant="destructive"
            className="mb-6 border-red-200 bg-red-50"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Passenger Option */}
          <Card
            className={`cursor-pointer transition-all duration-300 hover:shadow-xl border-2 transform hover:-translate-y-1 ${
              selectedRole === "user"
                ? "border-blue-500 bg-blue-50 shadow-lg"
                : "border-gray-200 hover:border-blue-300 bg-white/80 backdrop-blur-sm"
            } ${isLoading && selectedRole !== "user" ? "opacity-50" : ""}`}
            onClick={() => !isLoading && handleRoleSelection("user")}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-blue-100 rounded-full w-fit">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl font-semibold">
                Join as Passenger
              </CardTitle>
              <CardDescription className="text-gray-600">
                Find and book rides with verified drivers
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-3 mb-6">
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-700 border-blue-200"
                  >
                    Book Rides
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-700 border-blue-200"
                  >
                    Rate Drivers
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-700 border-blue-200"
                  >
                    Track Journey
                  </Badge>
                </div>
                <div className="text-sm text-gray-500">
                  Perfect for daily commuters and occasional travelers
                </div>
              </div>
              <Button
                className={`w-full h-11 transition-all ${
                  selectedRole === "user"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
                disabled={isLoading}
                variant={selectedRole === "user" ? "default" : "default"}
              >
                {loadingStates.roleSelection && selectedRole === "user" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {getLoadingMessage("roleSelection")}
                  </>
                ) : (
                  "Continue as Passenger"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Driver Option */}
          <Card
            className={`cursor-pointer transition-all duration-300 hover:shadow-xl border-2 transform hover:-translate-y-1 ${
              selectedRole === "driver"
                ? "border-green-500 bg-green-50 shadow-lg"
                : "border-gray-200 hover:border-green-300 bg-white/80 backdrop-blur-sm"
            } ${isLoading && selectedRole !== "driver" ? "opacity-50" : ""}`}
            onClick={() => !isLoading && handleRoleSelection("driver")}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-green-100 rounded-full w-fit">
                <Car className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl font-semibold">
                Join as Driver
              </CardTitle>
              <CardDescription className="text-gray-600">
                Offer rides and earn money driving others
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-3 mb-6">
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-700 border-green-200"
                  >
                    Offer Rides
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-700 border-green-200"
                  >
                    Earn Money
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-700 border-green-200"
                  >
                    Build Rating
                  </Badge>
                </div>
                <div className="text-sm text-gray-500">
                  Great for earning extra income with flexible hours
                </div>
              </div>
              <Button
                className={`w-full h-11 transition-all ${
                  selectedRole === "driver"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
                disabled={isLoading}
                variant={selectedRole === "driver" ? "default" : "default"}
              >
                {loadingStates.roleSelection && selectedRole === "driver" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {getLoadingMessage("roleSelection")}
                  </>
                ) : (
                  "Continue as Driver"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 space-y-4">
          <p className="text-sm text-gray-500">
            You can change this later in your profile settings
          </p>
          <Button
            variant="ghost"
            onClick={handleSignOut}
            disabled={isLoading}
            className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
          >
            {loadingStates.credentials ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing out...
              </>
            ) : (
              "Sign out and choose different account"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
