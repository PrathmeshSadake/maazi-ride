"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { UserRole } from "@prisma/client";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface RoleManagerProps {
  showSwitcher?: boolean;
}

export function RoleManager({ showSwitcher = true }: RoleManagerProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Get user's role and verification status
  const userRole = (session?.user?.role as UserRole) || "user";
  const isVerified = (session?.user?.isVerified as boolean) || false;

  // Handle role change
  const handleRoleChange = async (newRole: UserRole) => {
    if (!session?.user) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/auth/role?role=${newRole}`, {
        method: "GET",
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`You are now a ${newRole}. Redirecting...`);

        // Force refresh
        router.push(data.redirectUrl);
      } else {
        throw new Error(data.error || "Failed to update role");
      }
    } catch (error) {
      console.error("Error changing role:", error);
      toast.error("Failed to change role. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return <div className="p-2">Loading user information...</div>;
  }

  if (status !== "unauthenticated" && !session) {
    return null;
  }

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="font-semibold">Current Role:</h3>
        <Badge
          variant={
            userRole === "admin"
              ? "destructive"
              : userRole === "driver"
              ? "outline"
              : "default"
          }
        >
          {userRole}
        </Badge>
        {userRole === "driver" && (
          <Badge variant={isVerified ? "default" : "outline"}>
            {isVerified ? "Verified" : "Unverified"}
          </Badge>
        )}
      </div>

      {showSwitcher && (
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={userRole === "user" ? "default" : "outline"}
            onClick={() => handleRoleChange("user")}
            disabled={userRole === "user" || loading}
          >
            Switch to User
          </Button>
          <Button
            size="sm"
            variant={userRole === "driver" ? "default" : "outline"}
            onClick={() => handleRoleChange("driver")}
            disabled={userRole === "driver" || loading}
          >
            Switch to Driver
          </Button>
          {userRole === "admin" && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleRoleChange("admin")}
              disabled={loading}
            >
              Admin Portal
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
