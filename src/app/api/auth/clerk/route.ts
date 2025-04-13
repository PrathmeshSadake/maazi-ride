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

    // Set isVerified based on role (users are verified by default, drivers need verification)
    const isVerified = role === "user";

    clerkClient.users.updateUserMetadata(user.id, {
      publicMetadata: {
        role,
        isVerified,
      },
    });

    console.log(
      `User ${user.id} metadata updated: role=${role}, isVerified=${isVerified}`
    );

    // Redirect to the appropriate page
    if (role === "driver") {
      if (isVerified) {
        return NextResponse.redirect(new URL("/drivers", request.url));
      }
      return NextResponse.redirect(new URL("/drivers/onboarding", request.url));
    } else {
      return NextResponse.redirect(new URL("/", request.url));
    }
  } catch (error) {
    console.error("Error in clerk-setup route:", error);
    return NextResponse.redirect(new URL("/?error=setup-failed", request.url));
  }
}
