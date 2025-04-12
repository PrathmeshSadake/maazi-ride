import {
  clerkClient,
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // const userSession = (await auth()).sessionClaims;
  // const user = await (
  //   await clerkClient()
  // ).users.getUser(userSession?.sub as string);
  // console.log(user);
  // const role = (user?.publicMetadata?.role as string) || "user";
  // if (role === "driver") {
  //   console.log("driver");
  // } else if (role === "admin") {
  //   console.log("admin");
  // } else {
  //   console.log("user");
  // }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
