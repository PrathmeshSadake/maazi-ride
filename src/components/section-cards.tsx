"use client";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Types for dashboard stats
interface DashboardStats {
  totalUsers: number;
  totalDrivers: number;
  totalRides: number;
  totalBookings: number;
  completedRides: number;
  pendingApprovalRides: number;
  pendingBookings: number;
  confirmedBookings: number;
  usersTrend: {
    percentage: number;
    isUp: boolean;
  };
  driversTrend: {
    percentage: number;
    isUp: boolean;
  };
  ridesTrend: {
    percentage: number;
    isUp: boolean;
  };
  bookingsTrend: {
    percentage: number;
    isUp: boolean;
  };
}

// Function to fetch dashboard stats
const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const response = await fetch("/api/admin/dashboard-stats");
  if (!response.ok) {
    throw new Error("Failed to fetch dashboard stats");
  }
  return response.json();
};

// Default placeholder data
const defaultStats: DashboardStats = {
  totalUsers: 0,
  totalDrivers: 0,
  totalRides: 0,
  totalBookings: 0,
  completedRides: 0,
  pendingApprovalRides: 0,
  pendingBookings: 0,
  confirmedBookings: 0,
  usersTrend: { percentage: 0, isUp: true },
  driversTrend: { percentage: 0, isUp: true },
  ridesTrend: { percentage: 0, isUp: true },
  bookingsTrend: { percentage: 0, isUp: true },
};

export function SectionCards() {
  // Use React Query to fetch the dashboard stats
  const { data, isLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: fetchDashboardStats,
    // Default values for when data is loading
    placeholderData: defaultStats,
  });

  // Ensure stats is never undefined by using the default stats as fallback
  const stats = data ?? defaultStats;

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Users</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {isLoading ? "Loading..." : stats.totalUsers.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {stats.usersTrend.isUp ? (
                <IconTrendingUp />
              ) : (
                <IconTrendingDown />
              )}
              {stats.usersTrend.isUp ? "+" : "-"}
              {stats.usersTrend.percentage}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.usersTrend.isUp
              ? "Growing user base"
              : "Declining user acquisition"}{" "}
            {stats.usersTrend.isUp ? (
              <IconTrendingUp className="size-4" />
            ) : (
              <IconTrendingDown className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">
            Includes {stats.totalDrivers} verified drivers
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Rides</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {isLoading ? "Loading..." : stats.totalRides.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {stats.ridesTrend.isUp ? (
                <IconTrendingUp />
              ) : (
                <IconTrendingDown />
              )}
              {stats.ridesTrend.isUp ? "+" : "-"}
              {stats.ridesTrend.percentage}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.completedRides} rides completed
          </div>
          <div className="text-muted-foreground">
            {stats.pendingApprovalRides} rides pending approval
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Bookings</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {isLoading ? "Loading..." : stats.totalBookings.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {stats.bookingsTrend.isUp ? (
                <IconTrendingUp />
              ) : (
                <IconTrendingDown />
              )}
              {stats.bookingsTrend.isUp ? "+" : "-"}
              {stats.bookingsTrend.percentage}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.confirmedBookings} confirmed bookings
          </div>
          <div className="text-muted-foreground">
            {stats.pendingBookings} bookings pending approval
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Driver Growth</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {isLoading
              ? "Loading..."
              : ((stats.totalDrivers / stats.totalUsers) * 100).toFixed(1)}
            %
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {stats.driversTrend.isUp ? (
                <IconTrendingUp />
              ) : (
                <IconTrendingDown />
              )}
              {stats.driversTrend.isUp ? "+" : "-"}
              {stats.driversTrend.percentage}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.driversTrend.isUp
              ? "Steady driver acquisition"
              : "Driver onboarding needs attention"}{" "}
            {stats.driversTrend.isUp ? (
              <IconTrendingUp className="size-4" />
            ) : (
              <IconTrendingDown className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">
            {stats.totalDrivers} out of {stats.totalUsers} total users
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
