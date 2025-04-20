import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    // Check if user is authenticated and is admin
    const { userId } = auth();

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

    // Get all the bookings since the start date
    const bookings = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        createdAt: true,
        status: true,
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
      dateMap.set(dateString, { date: dateString, bookings: 0, completed: 0 });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Aggregate booking data by date
    bookings.forEach((booking) => {
      const dateString = booking.createdAt.toISOString().split("T")[0];

      if (dateMap.has(dateString)) {
        const dayData = dateMap.get(dateString);
        dayData.bookings += 1;

        if (booking.status === "COMPLETED") {
          dayData.completed += 1;
        }
      }
    });

    // Convert the map to an array for the response
    const chartData = Array.from(dateMap.values());

    return NextResponse.json(chartData);
  } catch (error) {
    console.error("[BOOKING_CHART_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
