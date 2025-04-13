import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

import { createClerkClient } from "@clerk/backend";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function GET(request: Request) {
  try {
    // Get the current user
    const user = await currentUser();

    if (!user) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // Get the role from the URL parameter
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role") || "user";
    const redirectMode = searchParams.get("redirect") || "json";

    // Set isVerified based on role (users are verified by default, drivers need verification)
    const isVerified = role === "user";

    await clerkClient.users.updateUserMetadata(user.id, {
      publicMetadata: {
        role,
        isVerified,
      },
    });

    console.log(
      `User ${user.id} metadata updated: role=${role}, isVerified=${isVerified}`
    );

    // Determine the redirect URL
    let redirectUrl = "/";
    if (role === "driver") {
      redirectUrl = isVerified ? "/drivers" : "/drivers/onboarding";
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
  } catch (error) {
    console.error("Error in clerk-setup route:", error);

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
