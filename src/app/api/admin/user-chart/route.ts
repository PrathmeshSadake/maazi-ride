import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    // Check if user is authenticated and is admin
    const { userId } = await auth();

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

    // Get the timeRange from the query string
    const url = new URL(req.url);
    const timeRange = url.searchParams.get("timeRange") || "90d";

    // Calculate the start date based on the timeRange
    const today = new Date();
    const startDate = new Date();

    if (timeRange === "7d") {
      startDate.setDate(today.getDate() - 7);
    } else if (timeRange === "30d") {
      startDate.setDate(today.getDate() - 30);
    } else {
      startDate.setDate(today.getDate() - 90); // Default to 90 days
    }

    // Get all users created since the start date
    const users = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        createdAt: true,
        role: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Generate dates for the chart
    const dateMap = new Map();
    const currentDate = new Date(startDate);

    while (currentDate <= today) {
      const dateString = currentDate.toISOString().split("T")[0]; // YYYY-MM-DD
      dateMap.set(dateString, { date: dateString, users: 0, drivers: 0 });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // For cumulative data, we need to know the count at the start date
    const startCounts = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: {
            lt: startDate,
          },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            lt: startDate,
          },
          role: "driver",
        },
      }),
    ]);

    let totalUsers = startCounts[0];
    let totalDrivers = startCounts[1];

    // Aggregate user data by date for cumulative growth
    const sortedDates = Array.from(dateMap.keys()).sort();

    for (const dateString of sortedDates) {
      const dayUsers = users.filter(
        (user) => user.createdAt.toISOString().split("T")[0] === dateString
      );

      totalUsers += dayUsers.length;

      const newDrivers = dayUsers.filter(
        (user) => user.role === "driver"
      ).length;
      totalDrivers += newDrivers;

      dateMap.set(dateString, {
        date: dateString,
        users: totalUsers,
        drivers: totalDrivers,
      });
    }

    // Convert the map to an array for the response
    const chartData = Array.from(dateMap.values());

    return NextResponse.json(chartData);
  } catch (error) {
    console.error("[USER_CHART_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
