import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { UserRole } from "@/auth";

export async function middleware(request: NextRequest) {
  const session = await auth();
  const user = session?.user;

  // Public paths that don't require authentication
  const publicPaths = [
    "/auth/signin",
    "/auth/signup",
    "/auth/forgot-password",
    "/auth/role-selection",
    "/api/auth/signup",
    "/api/auth/set-role",
  ];
  const isPublicPath = publicPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // If the user is not logged in and trying to access protected route
  if (!user && !isPublicPath) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  // If user needs role selection, redirect to role selection page
  if (
    user &&
    user.needsRoleSelection &&
    !request.nextUrl.pathname.startsWith("/auth/role-selection")
  ) {
    return NextResponse.redirect(new URL("/auth/role-selection", request.url));
  }

  // If the user is logged in and trying to access public route (but has role)
  if (
    user &&
    !user.needsRoleSelection &&
    isPublicPath &&
    !request.nextUrl.pathname.startsWith("/api/auth")
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Driver-specific paths
  const isDriverPath = request.nextUrl.pathname.startsWith("/drivers");

  // Admin-specific paths
  const isAdminPath = request.nextUrl.pathname.startsWith("/admin");

  // Handle driver routes
  if (isDriverPath) {
    if (user?.role !== UserRole.driver) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    // If driver is not verified and not on onboarding page
    // if (
    //   !(user as any).isVerified &&
    //   !request.nextUrl.pathname.includes("/drivers/onboarding")
    // ) {
    //   return NextResponse.redirect(new URL("/drivers/onboarding", request.url));
    // }
  }

  // Handle admin routes
  if (isAdminPath && user?.role !== UserRole.admin) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
