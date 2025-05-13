import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

export async function middleware(request: NextRequest) {
  const session = await auth();
  const user = session?.user;

  // Public paths that don't require authentication
  const publicPaths = [
    "/auth/signin",
    "/auth/signup",
    "/auth/forgot-password",
    "/api/auth/signup",
  ];
  const isPublicPath = publicPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // Driver-specific paths
  const isDriverPath = request.nextUrl.pathname.startsWith("/drivers");

  // Admin-specific paths
  const isAdminPath = request.nextUrl.pathname.startsWith("/admin");

  // If the user is not logged in and trying to access protected route
  if (!user && !isPublicPath) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  // If the user is logged in and trying to access public route
  if (user && isPublicPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Handle driver routes
  if (isDriverPath) {
    if (user?.role !== "driver") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    // If driver is not verified and not on onboarding page
    if (
      !user.isVerified &&
      !request.nextUrl.pathname.includes("/drivers/onboarding")
    ) {
      return NextResponse.redirect(new URL("/drivers/onboarding", request.url));
    }
  }

  // Handle admin routes
  if (isAdminPath && user?.role !== "admin") {
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
