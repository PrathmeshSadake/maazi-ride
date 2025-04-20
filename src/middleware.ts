import { NextResponse } from "next/server";
import { createClerkClient } from "@clerk/backend";
import { clerkMiddleware } from "@clerk/nextjs/server";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});
// List of public routes that don't require authentication
const publicRoutes = [
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks/clerk(.*)",
  "/api/upload-docs(.*)",
  "/api/auth/clerk(.*)",
  "/_next(.*)",
  "/favicon.ico",
];

export default clerkMiddleware(async (auth, req) => {
  const authInfo = await auth(); // Check if the path is a public route

  const userId = authInfo?.userId;

  if (
    publicRoutes.some((pattern) =>
      new RegExp(pattern).test(req.nextUrl.pathname)
    ) ||
    req.nextUrl.pathname.startsWith("/api")
  ) {
    return NextResponse.next();
  }

  // If no user and not a public route, redirect to sign-in
  if (!userId) {
    const signInUrl = new URL("/sign-in", req.url);
    return NextResponse.redirect(signInUrl);
  }

  try {
    const user = await clerkClient.users.getUser(userId);
    // Get user role from session claims
    const userMetadata =
      (user?.publicMetadata as Record<string, unknown>) || {};
    const role = (userMetadata.role as string) || "user";
    const isVerified = (userMetadata.isVerified as boolean) ?? false;

    // Handle role-based redirects
    if (role === "driver") {
      // If driver is not verified and not on onboarding page, redirect to onboarding
      if (
        !isVerified &&
        !req.nextUrl.pathname.startsWith("/drivers/onboarding")
      ) {
        const onboardingUrl = new URL("/drivers/onboarding", req.url);
        return NextResponse.redirect(onboardingUrl);
      }

      // If user is trying to access admin routes
      if (req.nextUrl.pathname.startsWith("/admin")) {
        const driverHomeUrl = new URL("/drivers", req.url);
        return NextResponse.redirect(driverHomeUrl);
      }

      // If driver is trying to access user routes and not on driver routes
      if (
        !req.nextUrl.pathname.startsWith("/drivers") &&
        !req.nextUrl.pathname.startsWith("/api")
      ) {
        const driverHomeUrl = new URL("/drivers", req.url);
        return NextResponse.redirect(driverHomeUrl);
      }
    } else if (role === "admin") {
      // If admin is trying to access driver or user routes
      if (
        req.nextUrl.pathname.startsWith("/drivers") ||
        (req.nextUrl.pathname !== "/" &&
          !req.nextUrl.pathname.startsWith("/admin") &&
          !req.nextUrl.pathname.startsWith("/api"))
      ) {
        const adminHomeUrl = new URL("/admin", req.url);
        return NextResponse.redirect(adminHomeUrl);
      }
    } else {
      // Regular user
      // If user is trying to access admin or driver routes
      if (
        // req.nextUrl.pathname.startsWith("/admin") ||
        req.nextUrl.pathname.startsWith("/drivers")
      ) {
        const homeUrl = new URL("/", req.url);
        return NextResponse.redirect(homeUrl);
      }
    }
  } catch (error) {
    console.error("Error in middleware:", error);
  }

  // If no redirects were triggered, continue
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
