import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "30d";
    const status = searchParams.get("status") || "all";

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

    // Build status filter
    let statusFilter = {};
    if (status !== "all") {
      switch (status) {
        case "active":
          statusFilter = { isVerified: true };
          break;
        case "completed":
          statusFilter = { status: "COMPLETED" };
          break;
        case "pending":
          statusFilter = { status: "PENDING" };
          break;
      }
    }

    // 1. Users Report
    const users = await prisma.user.findMany({
      where: {
        createdAt: { gte: startDate },
        ...statusFilter,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        isVerified: true,
        ridesCompleted: true,
        driverRating: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // 2. Rides Report
    const rides = await prisma.ride.findMany({
      where: {
        createdAt: { gte: startDate },
        ...(status !== "all" ? { status: status.toUpperCase() as any } : {}),
      },
      include: {
        driver: {
          select: { name: true },
        },
        bookings: {
          select: { id: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const ridesReport = rides.map((ride) => ({
      id: ride.id,
      driverName: ride.driver.name || "Unknown",
      fromLocation: ride.fromLocation,
      toLocation: ride.toLocation,
      departureDate: ride.departureDate.toISOString(),
      price: ride.price,
      availableSeats: ride.availableSeats,
      status: ride.status,
      bookingsCount: ride.bookings.length,
    }));

    // 3. Bookings Report
    const bookings = await prisma.booking.findMany({
      where: {
        createdAt: { gte: startDate },
        ...(status !== "all" ? { status: status.toUpperCase() as any } : {}),
      },
      include: {
        user: {
          select: { name: true },
        },
        ride: {
          include: {
            driver: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const bookingsReport = bookings.map((booking) => ({
      id: booking.id,
      userName: booking.user.name || "Unknown",
      driverName: booking.ride.driver.name || "Unknown",
      route: `${booking.ride.fromLocation} → ${booking.ride.toLocation}`,
      status: booking.status,
      numSeats: booking.numSeats,
      createdAt: booking.createdAt.toISOString(),
      totalAmount: booking.ride.price * booking.numSeats,
    }));

    // 4. Revenue Report
    const completedBookings = await prisma.booking.findMany({
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

    // Group revenue by date
    const revenueByDate = completedBookings.reduce((acc, booking) => {
      const date = booking.createdAt.toISOString().split("T")[0];
      const revenue = booking.ride.price * booking.numSeats;

      if (!acc[date]) {
        acc[date] = {
          totalRevenue: 0,
          bookingsCount: 0,
          revenues: [],
        };
      }

      acc[date].totalRevenue += revenue;
      acc[date].bookingsCount += 1;
      acc[date].revenues.push(revenue);

      return acc;
    }, {} as Record<string, { totalRevenue: number; bookingsCount: number; revenues: number[] }>);

    const revenueReport = Object.entries(revenueByDate)
      .map(([date, data]) => ({
        date,
        totalRevenue: data.totalRevenue,
        bookingsCount: data.bookingsCount,
        averageRideValue: data.totalRevenue / data.bookingsCount,
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // 5. Summary Statistics
    const totalUsers = await prisma.user.count();
    const totalDrivers = await prisma.user.count({ where: { role: "driver" } });
    const totalRides = await prisma.ride.count();
    const totalBookings = await prisma.booking.count();

    const totalRevenue = completedBookings.reduce(
      (sum, booking) => sum + booking.ride.price * booking.numSeats,
      0
    );

    const averageRating = await prisma.review.aggregate({
      _avg: { rating: true },
    });

    const summary = {
      totalUsers,
      totalDrivers,
      totalRides,
      totalBookings,
      totalRevenue,
      averageRating: averageRating._avg.rating || 0,
    };

    return NextResponse.json({
      users,
      rides: ridesReport,
      bookings: bookingsReport,
      revenue: revenueReport,
      summary,
    });
  } catch (error) {
    console.error("Reports API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch report data" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
