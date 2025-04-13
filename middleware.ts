import { authMiddleware, clerkClient } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/about",
  "/contact",
  "/search",
  "/rides",
];

// Routes that require specific roles
const roleBasedRoutes = [
  {
    pattern: "/drivers(.*)",
    roles: ["driver", "admin"],
    requireVerified: false,
  },
  {
    pattern: "/drivers/trips(.*)",
    roles: ["driver"],
    requireVerified: true,
  },
  {
    pattern: "/admin(.*)",
    roles: ["admin"],
    requireVerified: true,
  },
];

// Extend the authMiddleware with custom logic for role-based access
export default authMiddleware({
  publicRoutes,
  async afterAuth(auth, req) {
    // If the user is authenticated and trying to access a protected route
    if (auth.userId) {
      // Check if the route requires a specific role
      const path = req.nextUrl.pathname;

      const roleRoute = roleBasedRoutes.find((route) => {
        const regex = new RegExp(`^${route.pattern.replace(/\(.*\)/g, "")}`);
        return regex.test(path);
      });

      if (roleRoute) {
        try {
          // Get the user from Clerk to access publicMetadata
          const user = await clerkClient.users.getUser(auth.userId);

          // Get user's role and verification status
          const role = (user.publicMetadata.role as string) || "user";
          const isVerified =
            (user.publicMetadata.isVerified as boolean) || false;

          // Check if the user has the required role
          const hasRequiredRole = roleRoute.roles.includes(role);

          // Check if verification is required
          const needsVerification = roleRoute.requireVerified && !isVerified;

          // If the user doesn't have the required role, redirect to home
          if (!hasRequiredRole) {
            return NextResponse.redirect(new URL("/", req.url));
          }

          // If the user needs to be verified but isn't, redirect to onboarding
          if (needsVerification && role === "driver") {
            // Only redirect if they're not already on the onboarding page
            if (!path.includes("/drivers/onboarding")) {
              return NextResponse.redirect(
                new URL("/drivers/onboarding", req.url)
              );
            }
          }
        } catch (error) {
          console.error("Error in middleware:", error);
          // In case of error, allow the request to proceed and let the page handle the auth check
        }
      }
    }

    return NextResponse.next();
  },
});

// Export the config to ensure middleware runs only on relevant paths
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
