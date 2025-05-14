import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Check if user is authenticated and is admin
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || user.role !== "admin") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Get total users and drivers
    const [
      totalUsers,
      totalDrivers,
      verifiedDrivers,
      totalRides,
      completedRides,
      pendingApprovalRides,
      totalBookings,
      confirmedBookings,
      pendingBookings,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // Total drivers
      prisma.user.count({
        where: { role: "driver" },
      }),

      // Verified drivers
      prisma.user.count({
        where: {
          role: "driver",
          isVerified: true,
        },
      }),

      // Total rides
      prisma.ride.count(),

      // Completed rides
      prisma.ride.count({
        where: {
          approvedAt: { not: null },
        },
      }),

      // Pending approval rides
      prisma.ride.count({
        where: {
          approvedAt: null,
        },
      }),

      // Total bookings
      prisma.booking.count(),

      // Confirmed bookings
      prisma.booking.count({
        where: {
          status: "CONFIRMED",
        },
      }),

      // Pending bookings
      prisma.booking.count({
        where: {
          status: "PENDING",
        },
      }),
    ]);

    // Get trends by comparing with data from 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      previousUsersCount,
      previousDriversCount,
      previousRidesCount,
      previousBookingsCount,
    ] = await Promise.all([
      // Previous users count
      prisma.user.count({
        where: {
          createdAt: { lt: thirtyDaysAgo },
        },
      }),

      // Previous drivers count
      prisma.user.count({
        where: {
          role: "driver",
          createdAt: { lt: thirtyDaysAgo },
        },
      }),

      // Previous rides count
      prisma.ride.count({
        where: {
          createdAt: { lt: thirtyDaysAgo },
        },
      }),

      // Previous bookings count
      prisma.booking.count({
        where: {
          createdAt: { lt: thirtyDaysAgo },
        },
      }),
    ]);

    // Calculate trend percentages
    const usersTrend = calculateTrend(previousUsersCount, totalUsers);
    const driversTrend = calculateTrend(previousDriversCount, totalDrivers);
    const ridesTrend = calculateTrend(previousRidesCount, totalRides);
    const bookingsTrend = calculateTrend(previousBookingsCount, totalBookings);

    return NextResponse.json({
      totalUsers,
      totalDrivers: verifiedDrivers,
      totalRides,
      totalBookings,
      completedRides,
      pendingApprovalRides,
      confirmedBookings,
      pendingBookings,
      usersTrend,
      driversTrend,
      ridesTrend,
      bookingsTrend,
    });
  } catch (error) {
    console.error("[DASHBOARD_STATS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// Helper function to calculate trend
function calculateTrend(previous: number, current: number) {
  if (previous === 0) {
    return { percentage: 100, isUp: true };
  }

  const difference = current - previous;
  const percentage = Math.abs(Math.round((difference / previous) * 100));

  return {
    percentage,
    isUp: difference >= 0,
  };
}
