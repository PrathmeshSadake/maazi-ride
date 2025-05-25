import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "30d";

    // Calculate date range
    const now = new Date();
    let startDate: Date;

    switch (range) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "1y":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default: // 30d
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // 1. User Activity Over Time
    const userActivity = await prisma.user.groupBy({
      by: ["createdAt", "role"],
      _count: { id: true },
      where: { createdAt: { gte: startDate } },
      orderBy: { createdAt: "asc" },
    });

    // 2. Booking Activity Over Time
    const bookingActivity = await prisma.booking.groupBy({
      by: ["createdAt"],
      _count: { id: true },
      where: { createdAt: { gte: startDate } },
      orderBy: { createdAt: "asc" },
    });

    // 3. Revenue Data
    const revenueData = await prisma.booking.findMany({
      where: {
        status: "COMPLETED",
        createdAt: { gte: startDate },
      },
      include: {
        ride: {
          select: { price: true },
        },
      },
    });

    // 4. User Demographics
    const userDemographics = await prisma.user.groupBy({
      by: ["role"],
      _count: { role: true },
    });

    // 5. Popular Routes
    const popularRoutes = await prisma.ride.groupBy({
      by: ["fromLocation", "toLocation"],
      _count: { id: true },
      _sum: { price: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    });

    // 6. Performance Metrics
    const totalBookings = await prisma.booking.count();
    const completedBookings = await prisma.booking.count({
      where: { status: "COMPLETED" },
    });
    const conversionRate =
      totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;

    const averageRating = await prisma.review.aggregate({
      _avg: { rating: true },
    });

    const totalDrivers = await prisma.user.count({ where: { role: "driver" } });
    const activeDrivers = await prisma.user.count({
      where: {
        role: "driver",
        offeredRides: { some: { createdAt: { gte: startDate } } },
      },
    });
    const driverUtilization =
      totalDrivers > 0 ? (activeDrivers / totalDrivers) * 100 : 0;

    const averageRideValue =
      revenueData.length > 0
        ? revenueData.reduce(
            (sum, booking) => sum + booking.ride.price * booking.numSeats,
            0
          ) / revenueData.length
        : 0;

    // Format data for charts

    // User Activity Chart Data
    const activityMap = new Map<
      string,
      { users: number; drivers: number; bookings: number }
    >();

    // Initialize with booking data
    bookingActivity.forEach((item) => {
      const date = item.createdAt.toISOString().split("T")[0];
      activityMap.set(date, { users: 0, drivers: 0, bookings: item._count.id });
    });

    // Add user data
    userActivity.forEach((item) => {
      const date = item.createdAt.toISOString().split("T")[0];
      const existing = activityMap.get(date) || {
        users: 0,
        drivers: 0,
        bookings: 0,
      };

      if (item.role === "user") {
        existing.users += item._count.id;
      } else if (item.role === "driver") {
        existing.drivers += item._count.id;
      }

      activityMap.set(date, existing);
    });

    const userActivityChart = Array.from(activityMap.entries()).map(
      ([date, data]) => ({
        date,
        ...data,
      })
    );

    // Revenue by Month
    const revenueByMonth = revenueData.reduce((acc, booking) => {
      const month = booking.createdAt.toISOString().substring(0, 7); // YYYY-MM
      const revenue = booking.ride.price * booking.numSeats;

      const existing = acc.find((item) => item.month === month);
      if (existing) {
        existing.revenue += revenue;
        existing.bookings += 1;
      } else {
        acc.push({ month, revenue, bookings: 1 });
      }
      return acc;
    }, [] as { month: string; revenue: number; bookings: number }[]);

    // User Demographics Chart Data
    const userDemographicsChart = userDemographics.map((item) => ({
      id: item.role || "unknown",
      label: item.role || "Unknown",
      value: item._count.role,
    }));

    // Route Distribution
    const rideDistribution = popularRoutes.map((route) => ({
      route: `${route.fromLocation} → ${route.toLocation}`,
      count: route._count.id,
      revenue: route._sum.price || 0,
    }));

    // Calendar Data (for heatmap)
    const calendarData = userActivityChart.map((item) => ({
      day: item.date,
      value: item.users + item.drivers + item.bookings,
    }));

    // Location Heatmap Data (mock data - you can enhance this with real location data)
    const locationHeatmap = [
      {
        id: "Downtown",
        data: Array.from({ length: 24 }, (_, hour) => ({
          x: `${hour}:00`,
          y: Math.floor(Math.random() * 100),
        })),
      },
      {
        id: "Airport",
        data: Array.from({ length: 24 }, (_, hour) => ({
          x: `${hour}:00`,
          y: Math.floor(Math.random() * 80),
        })),
      },
      {
        id: "University",
        data: Array.from({ length: 24 }, (_, hour) => ({
          x: `${hour}:00`,
          y: Math.floor(Math.random() * 60),
        })),
      },
      {
        id: "Mall",
        data: Array.from({ length: 24 }, (_, hour) => ({
          x: `${hour}:00`,
          y: Math.floor(Math.random() * 70),
        })),
      },
    ];

    return NextResponse.json({
      timeRange: range,
      userActivity: userActivityChart,
      locationHeatmap,
      revenueByMonth,
      userDemographics: userDemographicsChart,
      rideDistribution,
      performanceMetrics: {
        conversionRate,
        averageRideValue,
        customerSatisfaction: averageRating._avg.rating || 0,
        driverUtilization,
      },
      calendarData,
    });
  } catch (error) {
    console.error("Analytics API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
