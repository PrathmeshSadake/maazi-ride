"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession, signIn } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function RoleSelectionPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"user" | "driver" | null>(
    null
  );
  const { update, data: session } = useSession();

  const handleRoleSelection = async (role: "user" | "driver") => {
    if (isLoading) return;

    setIsLoading(true);
    setSelectedRole(role);

    try {
      const response = await fetch("/api/auth/set-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        throw new Error("Failed to set role");
      }

      // Wait for session to update
      await update();

      console.log("Session after update:", session);

      toast.success(
        `Welcome! You've joined as a ${
          role === "user" ? "passenger" : "driver"
        }.`
      );

      // Now redirect
      await signOut({ callbackUrl: "/auth/signin?roleJustSet=1" });
    } catch (error) {
      console.error("Error setting role:", error);
      toast.error("Something went wrong. Please try again.");
      setSelectedRole(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/auth/signin" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Maazi Ride!
          </h1>
          <p className="text-gray-600">
            Choose how you'd like to use our platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Passenger Option */}
          <Card
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
              selectedRole === "user"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => !isLoading && handleRoleSelection("user")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Join as Passenger</CardTitle>
              <CardDescription>
                Find and book rides with verified drivers
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-2 mb-4">
                <Badge variant="secondary" className="mr-2">
                  Book Rides
                </Badge>
                <Badge variant="secondary" className="mr-2">
                  Rate Drivers
                </Badge>
                <Badge variant="secondary">Track Journey</Badge>
              </div>
              <Button
                className="w-full"
                disabled={isLoading}
                variant={selectedRole === "user" ? "default" : "outline"}
              >
                {isLoading && selectedRole === "user" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Setting
                    up...
                  </>
                ) : (
                  "Continue as Passenger"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Driver Option */}
          <Card
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
              selectedRole === "driver"
                ? "border-green-500 bg-green-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => !isLoading && handleRoleSelection("driver")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
                <Car className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">Join as Driver</CardTitle>
              <CardDescription>
                Offer rides and earn money driving others
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-2 mb-4">
                <Badge variant="secondary" className="mr-2">
                  Offer Rides
                </Badge>
                <Badge variant="secondary" className="mr-2">
                  Earn Money
                </Badge>
                <Badge variant="secondary">Build Rating</Badge>
              </div>
              <Button
                className="w-full"
                disabled={isLoading}
                variant={selectedRole === "driver" ? "default" : "outline"}
              >
                {isLoading && selectedRole === "driver" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Setting
                    up...
                  </>
                ) : (
                  "Continue as Driver"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 mb-4">
            You can change this later in your profile settings
          </p>
          <Button
            variant="ghost"
            onClick={handleSignOut}
            disabled={isLoading}
            className="text-gray-600 hover:text-gray-800"
          >
            Sign out and choose different account
          </Button>
        </div>
      </div>
    </div>
  );
}
