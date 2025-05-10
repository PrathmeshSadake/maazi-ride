import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET handler - Fetch vehicle info by driver ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    const { id } = await params;

    // Get the mode from query parameters
    const mode = request.nextUrl.searchParams.get("mode");

    // Only check permissions for non-public mode
    if (mode !== "public") {
      // Check if the user is authenticated
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Check if the user is accessing their own vehicle info or is an admin
      if (user.id !== id) {
        // Add admin check logic here if needed
        return NextResponse.json(
          {
            error:
              "Forbidden: You can only access your own vehicle information",
          },
          { status: 403 }
        );
      }
    }

    // Fetch the vehicle info
    const vehicle = await prisma.vehicle.findUnique({
      where: { userId: id },
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    return NextResponse.json(
      { error: "Error fetching vehicle information" },
      { status: 500 }
    );
  }
}
