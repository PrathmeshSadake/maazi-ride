import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { createClerkClient } from "@clerk/backend";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function GET(request: Request) {
  try {
    // Get the authenticated user session using Clerk's auth helper
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the role from the URL parameter
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const redirectMode = searchParams.get("redirect") || "json";

    // Validate role
    if (!role || !["user", "driver", "admin"].includes(role)) {
      return NextResponse.json(
        { success: false, error: "Invalid role specified" },
        { status: 400 }
      );
    }

    console.log(`Setting up user ${userId} with role: ${role}`);

    // Set isVerified based on role (users are verified by default, drivers need verification)
    const isVerified = role === "user";

    try {
      // Update user metadata with the role using Clerk's Node SDK
      await clerkClient.users.updateUser(userId, {
        publicMetadata: {
          role,
          isVerified,
        },
      });

      console.log(
        `User ${userId} metadata updated: role=${role}, isVerified=${isVerified}`
      );

      // Determine the redirect URL based on role
      let redirectUrl = "/";
      if (role === "driver") {
        redirectUrl = isVerified ? "/drivers" : "/drivers/onboarding";
      } else if (role === "admin") {
        redirectUrl = "/admin";
      }

      // Return JSON or redirect based on mode
      if (redirectMode === "json") {
        return NextResponse.json({
          success: true,
          redirectUrl,
          role,
          isVerified,
        });
      } else {
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      }
    } catch (clerkError) {
      console.error("Error updating user metadata:", clerkError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to update user metadata",
          details: clerkError,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in role-based auth route:", error);

    // Handle error response based on requested format
    const { searchParams } = new URL(request.url);
    const redirectMode = searchParams.get("redirect") || "json";

    if (redirectMode === "json") {
      return NextResponse.json(
        { success: false, error: "Failed to set up account" },
        { status: 500 }
      );
    } else {
      return NextResponse.redirect(
        new URL("/?error=setup-failed", request.url)
      );
    }
  }
}
