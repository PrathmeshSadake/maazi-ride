"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Car,
  Calendar,
  MessageSquare,
  Star,
  Bell,
  TrendingUp,
  DollarSign,
  IndianRupee,
} from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import Nivo charts to avoid SSR issues
const ResponsivePie = dynamic(
  () => import("@nivo/pie").then((mod) => mod.ResponsivePie),
  { ssr: false }
);
const ResponsiveBar = dynamic(
  () => import("@nivo/bar").then((mod) => mod.ResponsiveBar),
  { ssr: false }
);
const ResponsiveLine = dynamic(
  () => import("@nivo/line").then((mod) => mod.ResponsiveLine),
  { ssr: false }
);

interface DashboardData {
  overview: {
    totalUsers: number;
    totalDrivers: number;
    totalRegularUsers: number;
    verifiedDrivers: number;
    totalRides: number;
    pendingRides: number;
    completedRides: number;
    cancelledRides: number;
    totalBookings: number;
    recentUsers: number;
    recentRides: number;
    recentBookings: number;
    totalNotifications: number;
    unreadNotifications: number;
    totalReviews: number;
    averageRating: number;
    totalMessages: number;
    unreadMessages: number;
  };
  charts: {
    bookingStatus: Array<{ id: string; label: string; value: number }>;
    userGrowth: Array<{ x: string; y: number }>;
    rideActivity: Array<{ x: string; y: number }>;
    driverVerification: Array<{ status: string; count: number }>;
    revenue: Array<{ x: string; y: number }>;
  };
  topDrivers: Array<{
    id: string;
    name: string;
    email: string;
    driverRating: number;
    ridesCompleted: number;
    isVerified: boolean;
  }>;
  recentActivity: {
    users: number;
    rides: number;
    bookings: number;
  };
}

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("/api/admin/dashboard");
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }
        const data = await response.json();
        setDashboardData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!dashboardData) return null;

  const { overview, charts, topDrivers } = dashboardData;

  // Prepare data for charts
  const userGrowthData = [
    {
      id: "users",
      data: charts.userGrowth,
    },
  ];

  const rideActivityData = [
    {
      id: "rides",
      data: charts.rideActivity,
    },
  ];

  const revenueData = [
    {
      id: "revenue",
      data: charts.revenue,
    },
  ];

  const driverVerificationBarData = charts.driverVerification.map((item) => ({
    status: item.status,
    count: item.count,
  }));

  return (
    <div className="flex flex-1 flex-col space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <Badge variant="outline" className="text-sm">
          Real-time Data
        </Badge>
      </div>

      {/* Overview Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +{overview.recentUsers} in last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalDrivers}</div>
            <p className="text-xs text-muted-foreground">
              {overview.verifiedDrivers} verified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rides</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalRides}</div>
            <p className="text-xs text-muted-foreground">
              {overview.completedRides} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Bookings
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              +{overview.recentBookings} in last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalMessages}</div>
            <p className="text-xs text-muted-foreground">
              {overview.unreadMessages} unread
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reviews</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalReviews}</div>
            <p className="text-xs text-muted-foreground">
              {overview.averageRating.toFixed(1)} avg rating
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview.totalNotifications}
            </div>
            <p className="text-xs text-muted-foreground">
              {overview.unreadNotifications} unread
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹
              {charts.revenue.reduce((sum, item) => sum + item.y, 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Booking Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Status Distribution</CardTitle>
            <CardDescription>Current booking status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ height: "300px" }}>
              <ResponsivePie
                data={charts.bookingStatus}
                margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                innerRadius={0.5}
                padAngle={0.7}
                cornerRadius={3}
                activeOuterRadiusOffset={8}
                borderWidth={1}
                borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor="#333333"
                arcLinkLabelsThickness={2}
                arcLinkLabelsColor={{ from: "color" }}
                arcLabelsSkipAngle={10}
                arcLabelsTextColor={{
                  from: "color",
                  modifiers: [["darker", 2]],
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Driver Verification Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Driver Verification Status</CardTitle>
            <CardDescription>Verified vs unverified drivers</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ height: "300px" }}>
              <ResponsiveBar
                data={driverVerificationBarData}
                keys={["count"]}
                indexBy="status"
                margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                padding={0.3}
                valueScale={{ type: "linear" }}
                indexScale={{ type: "band", round: true }}
                colors={{ scheme: "nivo" }}
                borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: "Status",
                  legendPosition: "middle",
                  legendOffset: 32,
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: "Count",
                  legendPosition: "middle",
                  legendOffset: -40,
                }}
                labelSkipWidth={12}
                labelSkipHeight={12}
                labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
              />
            </div>
          </CardContent>
        </Card>

        {/* User Growth Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>New user registrations over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ height: "300px" }}>
              <ResponsiveLine
                data={userGrowthData}
                margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                xScale={{ type: "point" }}
                yScale={{
                  type: "linear",
                  min: "auto",
                  max: "auto",
                  stacked: true,
                  reverse: false,
                }}
                yFormat=" >-.2f"
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: "Date",
                  legendOffset: 36,
                  legendPosition: "middle",
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: "Users",
                  legendOffset: -40,
                  legendPosition: "middle",
                }}
                pointSize={10}
                pointColor={{ theme: "background" }}
                pointBorderWidth={2}
                pointBorderColor={{ from: "serieColor" }}
                pointLabelYOffset={-12}
                useMesh={true}
              />
            </div>
          </CardContent>
        </Card>

        {/* Revenue Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>
              Daily revenue from completed bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ height: "300px" }}>
              <ResponsiveLine
                data={revenueData}
                margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                xScale={{ type: "point" }}
                yScale={{
                  type: "linear",
                  min: "auto",
                  max: "auto",
                  stacked: true,
                  reverse: false,
                }}
                yFormat=" >-.2f"
                curve="cardinal"
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: "Date",
                  legendOffset: 36,
                  legendPosition: "middle",
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: "Revenue (₹)",
                  legendOffset: -40,
                  legendPosition: "middle",
                }}
                pointSize={10}
                pointColor={{ theme: "background" }}
                pointBorderWidth={2}
                pointBorderColor={{ from: "serieColor" }}
                pointLabelYOffset={-12}
                useMesh={true}
                colors={{ scheme: "category10" }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Drivers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Rated Drivers</CardTitle>
          <CardDescription>
            Highest rated drivers on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Rating</th>
                  <th className="text-left p-2">Rides Completed</th>
                  <th className="text-left p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {topDrivers.map((driver) => (
                  <tr key={driver.id} className="border-b">
                    <td className="p-2">{driver.name}</td>
                    <td className="p-2">{driver.email}</td>
                    <td className="p-2">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        {driver.driverRating.toFixed(1)}
                      </div>
                    </td>
                    <td className="p-2">{driver.ridesCompleted}</td>
                    <td className="p-2">
                      <Badge
                        variant={driver.isVerified ? "default" : "secondary"}
                      >
                        {driver.isVerified ? "Verified" : "Unverified"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
