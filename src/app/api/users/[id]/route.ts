import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;

    // Check if user is authenticated and is admin
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!currentUser || currentUser.role !== "admin") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Fetch the user with the given ID
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        isVerified: true,
        ridesCompleted: true,
        driverRating: true,
        // Include vehicle information if the user is a driver
        vehicle:
          currentUser.role === "admin"
            ? {
                select: {
                  make: true,
                  model: true,
                  year: true,
                  color: true,
                  licensePlate: true,
                  vehicleImages: true,
                },
              }
            : false,
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("[USER_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
