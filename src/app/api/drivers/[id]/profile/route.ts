import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    // Check if user is authenticated
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if the authenticated user is requesting their own data
    if (session.user.id !== params.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Fetch user data from database
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        driverRating: true,
        ridesCompleted: true,
        isVerified: true,
        // Add any other fields you need
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Return the user profile data
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      driverRating: user.driverRating || 0,
      ridesCompleted: user.ridesCompleted,
      isVerified: user.isVerified,
      // You can add a profile image URL here if you have one in your database
    });
  } catch (error) {
    console.error("Error fetching driver profile:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
