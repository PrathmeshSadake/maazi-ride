import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const driverId = (await params).id;

    // Ensure user can only access their own profile or is admin
    if (session.user.id !== driverId && session.user.role !== "admin") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Get driver profile information
    const driver = await prisma.user.findUnique({
      where: {
        id: driverId,
        role: "driver",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        phoneVerified: true,
        driverRating: true,
        ridesCompleted: true,
        isVerified: true,
        createdAt: true,
        drivingLicenseUrl: true,
        vehicleRegistrationUrl: true,
        insuranceUrl: true,
        upiId: true,
        vehicle: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            color: true,
            licensePlate: true,
            vehicleImages: true,
          },
        },
        offeredRides: {
          where: {
            status: "COMPLETED",
          },
          select: {
            id: true,
          },
        },
        reviews: {
          select: {
            rating: true,
            comment: true,
            author: {
              select: {
                name: true,
              },
            },
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
      },
    });

    if (!driver) {
      return new NextResponse("Driver not found", { status: 404 });
    }

    // Calculate average rating from reviews
    const avgRating =
      driver.reviews.length > 0
        ? driver.reviews.reduce((sum, review) => sum + review.rating, 0) /
          driver.reviews.length
        : null;

    // Format the response
    const profileData = {
      id: driver.id,
      name: driver.name,
      email: driver.email,
      phone: driver.phone,
      phoneVerified: driver.phoneVerified,
      driverRating: avgRating || driver.driverRating,
      ridesCompleted: driver.offeredRides.length,
      isVerified: driver.isVerified,
      memberSince: driver.createdAt,
      hasDocuments: {
        drivingLicense: !!driver.drivingLicenseUrl,
        vehicleRegistration: !!driver.vehicleRegistrationUrl,
        insurance: !!driver.insuranceUrl,
      },
      vehicle: driver.vehicle,
      upiId: driver.upiId,
      recentReviews: driver.reviews.slice(0, 3),
      stats: {
        totalRides: driver.offeredRides.length,
        rating: avgRating || driver.driverRating || 0,
        reviewCount: driver.reviews.length,
      },
    };

    return NextResponse.json(profileData);
  } catch (error) {
    console.error("Error fetching driver profile:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const driverId = (await params).id;

    // Ensure user can only update their own profile
    if (session.user.id !== driverId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await req.json();
    const { name, phone, upiId } = body;

    // Update user profile
    const updatedDriver = await prisma.user.update({
      where: {
        id: driverId,
        role: "driver",
      },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(upiId && { upiId }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        upiId: true,
      },
    });

    return NextResponse.json(updatedDriver);
  } catch (error) {
    console.error("Error updating driver profile:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
