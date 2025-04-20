"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { useQuery } from "@tanstack/react-query";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export const description = "An interactive area chart";

// Type definitions for API responses
interface BookingChartData {
  date: string;
  bookings: number;
  completed: number;
}

interface UserChartData {
  date: string;
  users: number;
  drivers: number;
}

// Function to fetch booking data
const fetchBookingChartData = async (
  timeRange: string
): Promise<BookingChartData[]> => {
  const response = await fetch(
    `/api/admin/booking-chart?timeRange=${timeRange}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch booking chart data");
  }
  return response.json();
};

// Function to fetch user growth data
const fetchUserChartData = async (
  timeRange: string
): Promise<UserChartData[]> => {
  const response = await fetch(`/api/admin/user-chart?timeRange=${timeRange}`);
  if (!response.ok) {
    throw new Error("Failed to fetch user chart data");
  }
  return response.json();
};

// Chart configs based on chart type
const bookingChartConfig = {
  bookings: {
    label: "Bookings",
    color: "var(--primary)",
  },
  completed: {
    label: "Completed",
    color: "var(--primary)",
  },
} as const;

const userChartConfig = {
  users: {
    label: "Users",
    color: "var(--primary)",
  },
  drivers: {
    label: "Drivers",
    color: "var(--primary)",
  },
} as const;

interface ChartAreaInteractiveProps {
  chartType?: "bookings" | "users";
}

export function ChartAreaInteractive({
  chartType = "bookings",
}: ChartAreaInteractiveProps) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");

  // Select the appropriate chart config based on chartType
  const chartConfig =
    chartType === "bookings" ? bookingChartConfig : userChartConfig;

  // Fetch chart data based on chart type
  const { data: chartData, isLoading } = useQuery({
    queryKey: [
      chartType === "bookings" ? "bookingChartData" : "userChartData",
      timeRange,
    ],
    queryFn: () =>
      chartType === "bookings"
        ? fetchBookingChartData(timeRange)
        : fetchUserChartData(timeRange),
    placeholderData: [],
  });

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>
          {chartType === "bookings" ? "Booking Activity" : "User Growth"}
        </CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Total for the last{" "}
            {timeRange === "90d"
              ? "3 months"
              : timeRange === "30d"
              ? "30 days"
              : "7 days"}
          </span>
          <span className="@[540px]/card:hidden">
            Last{" "}
            {timeRange === "90d"
              ? "3 months"
              : timeRange === "30d"
              ? "30 days"
              : "7 days"}
          </span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {isLoading ? (
          <div className="flex h-[250px] w-full items-center justify-center">
            Loading chart data...
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={chartData}>
              <defs>
                {chartType === "bookings" ? (
                  <>
                    <linearGradient
                      id="fillBookings"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--color-bookings)"
                        stopOpacity={1.0}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-bookings)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient
                      id="fillCompleted"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--color-completed)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-completed)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </>
                ) : (
                  <>
                    <linearGradient id="fillUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--color-users)"
                        stopOpacity={1.0}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-users)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient
                      id="fillDrivers"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--color-drivers)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-drivers)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </>
                )}
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <ChartTooltip
                cursor={false}
                defaultIndex={isMobile ? -1 : 10}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                    }}
                    indicator="dot"
                  />
                }
              />
              {chartType === "bookings" ? (
                <>
                  <Area
                    dataKey="completed"
                    type="natural"
                    fill="url(#fillCompleted)"
                    stroke="var(--color-completed)"
                    stackId="a"
                  />
                  <Area
                    dataKey="bookings"
                    type="natural"
                    fill="url(#fillBookings)"
                    stroke="var(--color-bookings)"
                    stackId="a"
                  />
                </>
              ) : (
                <>
                  <Area
                    dataKey="drivers"
                    type="natural"
                    fill="url(#fillDrivers)"
                    stroke="var(--color-drivers)"
                    stackId="a"
                  />
                  <Area
                    dataKey="users"
                    type="natural"
                    fill="url(#fillUsers)"
                    stroke="var(--color-users)"
                    stackId="a"
                  />
                </>
              )}
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
