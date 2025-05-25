import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get current date for time-based queries
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 1. User Statistics
    const totalUsers = await prisma.user.count();
    const totalDrivers = await prisma.user.count({ where: { role: "driver" } });
    const totalRegularUsers = await prisma.user.count({
      where: { role: "user" },
    });
    const verifiedDrivers = await prisma.user.count({
      where: { role: "driver", isVerified: true },
    });

    // 2. Ride Statistics
    const totalRides = await prisma.ride.count();
    const pendingRides = await prisma.ride.count({
      where: { status: "PENDING" },
    });
    const completedRides = await prisma.ride.count({
      where: { status: "COMPLETED" },
    });
    const cancelledRides = await prisma.ride.count({
      where: { status: "CANCELLED" },
    });

    // 3. Booking Statistics
    const totalBookings = await prisma.booking.count();
    const bookingsByStatus = await prisma.booking.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    // 4. Recent Activity (last 30 days)
    const recentUsers = await prisma.user.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });
    const recentRides = await prisma.ride.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });
    const recentBookings = await prisma.booking.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });

    // 5. User Growth Over Time (last 30 days)
    const userGrowth = await prisma.user.groupBy({
      by: ["createdAt"],
      _count: { id: true },
      where: { createdAt: { gte: thirtyDaysAgo } },
      orderBy: { createdAt: "asc" },
    });

    // 6. Ride Activity Over Time
    const rideActivity = await prisma.ride.groupBy({
      by: ["createdAt"],
      _count: { id: true },
      where: { createdAt: { gte: thirtyDaysAgo } },
      orderBy: { createdAt: "asc" },
    });

    // 7. Driver Verification Status
    const driverVerificationData = [
      { status: "Verified", count: verifiedDrivers },
      { status: "Unverified", count: totalDrivers - verifiedDrivers },
    ];

    // 8. Top Rated Drivers
    const topDrivers = await prisma.user.findMany({
      where: {
        role: "driver",
        driverRating: { not: null },
      },
      select: {
        id: true,
        name: true,
        email: true,
        driverRating: true,
        ridesCompleted: true,
        isVerified: true,
      },
      orderBy: { driverRating: "desc" },
      take: 10,
    });

    // 9. Revenue Data (based on completed bookings)
    const revenueData = await prisma.booking.findMany({
      where: {
        status: "COMPLETED",
        createdAt: { gte: thirtyDaysAgo },
      },
      include: {
        ride: {
          select: { price: true },
        },
      },
    });

    // 10. Notification Statistics
    const totalNotifications = await prisma.notification.count();
    const unreadNotifications = await prisma.notification.count({
      where: { read: false },
    });

    // 11. Review Statistics
    const totalReviews = await prisma.review.count();
    const averageRating = await prisma.review.aggregate({
      _avg: { rating: true },
    });

    // 12. Message Statistics
    const totalMessages = await prisma.message.count();
    const unreadMessages = await prisma.message.count({
      where: { read: false },
    });

    // Format data for charts
    const bookingStatusChart = bookingsByStatus.map((item) => ({
      id: item.status,
      label: item.status,
      value: item._count.status,
    }));

    const userGrowthChart = userGrowth.map((item) => ({
      x: item.createdAt.toISOString().split("T")[0],
      y: item._count.id,
    }));

    const rideActivityChart = rideActivity.map((item) => ({
      x: item.createdAt.toISOString().split("T")[0],
      y: item._count.id,
    }));

    const revenueChart = revenueData.reduce((acc, booking) => {
      const date = booking.createdAt.toISOString().split("T")[0];
      const revenue = booking.ride.price * booking.numSeats;

      const existingEntry = acc.find((item) => item.x === date);
      if (existingEntry) {
        existingEntry.y += revenue;
      } else {
        acc.push({ x: date, y: revenue });
      }
      return acc;
    }, [] as { x: string; y: number }[]);

    return NextResponse.json({
      overview: {
        totalUsers,
        totalDrivers,
        totalRegularUsers,
        verifiedDrivers,
        totalRides,
        pendingRides,
        completedRides,
        cancelledRides,
        totalBookings,
        recentUsers,
        recentRides,
        recentBookings,
        totalNotifications,
        unreadNotifications,
        totalReviews,
        averageRating: averageRating._avg.rating || 0,
        totalMessages,
        unreadMessages,
      },
      charts: {
        bookingStatus: bookingStatusChart,
        userGrowth: userGrowthChart,
        rideActivity: rideActivityChart,
        driverVerification: driverVerificationData,
        revenue: revenueChart,
      },
      topDrivers,
      recentActivity: {
        users: recentUsers,
        rides: recentRides,
        bookings: recentBookings,
      },
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
