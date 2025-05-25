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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart3, TrendingUp, Calendar, Download } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import Nivo charts
const ResponsiveHeatMap = dynamic(
  () => import("@nivo/heatmap").then((mod) => mod.ResponsiveHeatMap),
  { ssr: false }
);
const ResponsiveCalendar = dynamic(
  () => import("@nivo/calendar").then((mod) => mod.ResponsiveCalendar),
  { ssr: false }
);
const ResponsiveTreeMap = dynamic(
  () => import("@nivo/treemap").then((mod) => mod.ResponsiveTreeMap),
  { ssr: false }
);
const ResponsiveStream = dynamic(
  () => import("@nivo/stream").then((mod) => mod.ResponsiveStream),
  { ssr: false }
);
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

interface AnalyticsData {
  timeRange: string;
  userActivity: Array<{
    date: string;
    users: number;
    drivers: number;
    bookings: number;
  }>;
  locationHeatmap: Array<{ id: string; data: Array<{ x: string; y: number }> }>;
  revenueByMonth: Array<{ month: string; revenue: number; bookings: number }>;
  userDemographics: Array<{ id: string; label: string; value: number }>;
  rideDistribution: Array<{ route: string; count: number; revenue: number }>;
  performanceMetrics: {
    conversionRate: number;
    averageRideValue: number;
    customerSatisfaction: number;
    driverUtilization: number;
  };
  calendarData: Array<{ day: string; value: number }>;
}

const AdminAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`);
      if (!response.ok) {
        throw new Error("Failed to fetch analytics data");
      }
      const data = await response.json();
      setAnalyticsData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    if (!analyticsData) return;

    const dataStr = JSON.stringify(analyticsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analytics-${timeRange}-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading analytics...</div>
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

  if (!analyticsData) return null;

  // Prepare data for different chart types
  const streamData = analyticsData.userActivity.map((item) => ({
    ...item,
    date: item.date,
  }));

  const treeMapData = {
    name: "rides",
    children: analyticsData.rideDistribution.map((item) => ({
      name: item.route,
      value: item.count,
      revenue: item.revenue,
    })),
  };

  const heatMapData = analyticsData.locationHeatmap;

  return (
    <div className="flex flex-1 flex-col space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-8 w-8" />
          <h1 className="text-3xl font-bold tracking-tight">
            Advanced Analytics
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Conversion Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.performanceMetrics.conversionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Booking to completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Ride Value
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analyticsData.performanceMetrics.averageRideValue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per completed booking
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Customer Satisfaction
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.performanceMetrics.customerSatisfaction.toFixed(1)}
              /5
            </div>
            <p className="text-xs text-muted-foreground">Average rating</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Driver Utilization
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.performanceMetrics.driverUtilization.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Active drivers ratio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Activity Stream Chart */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Activity Stream</CardTitle>
            <CardDescription>User activity flow over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ height: "400px" }}>
              <ResponsiveStream
                data={streamData}
                keys={["users", "drivers", "bookings"]}
                margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: "Date",
                  legendOffset: 36,
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: "Activity",
                  legendOffset: -40,
                }}
                enableGridX={true}
                enableGridY={false}
                offsetType="silhouette"
                colors={{ scheme: "nivo" }}
                fillOpacity={0.85}
                borderColor={{ theme: "background" }}
                legends={[
                  {
                    anchor: "bottom-right",
                    direction: "column",
                    translateX: 100,
                    itemWidth: 80,
                    itemHeight: 20,
                    itemTextColor: "#999",
                    symbolSize: 12,
                    symbolShape: "circle",
                    effects: [
                      {
                        on: "hover",
                        style: {
                          itemTextColor: "#000",
                        },
                      },
                    ],
                  },
                ]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Calendar Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Calendar</CardTitle>
            <CardDescription>Daily activity heatmap</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ height: "300px" }}>
              <ResponsiveCalendar
                data={analyticsData.calendarData}
                from={new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)}
                to={new Date()}
                emptyColor="#eeeeee"
                colors={["#61cdbb", "#97e3d5", "#e8c1a0", "#f47560"]}
                margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
                yearSpacing={40}
                monthBorderColor="#ffffff"
                dayBorderWidth={2}
                dayBorderColor="#ffffff"
                legends={[
                  {
                    anchor: "bottom-right",
                    direction: "row",
                    translateY: 36,
                    itemCount: 4,
                    itemWidth: 42,
                    itemHeight: 36,
                    itemsSpacing: 14,
                    itemDirection: "right-to-left",
                  },
                ]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Route TreeMap */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Routes</CardTitle>
            <CardDescription>
              Route distribution by booking volume
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ height: "300px" }}>
              <ResponsiveTreeMap
                data={treeMapData}
                identity="name"
                value="value"
                margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                labelSkipSize={12}
                labelTextColor={{ from: "color", modifiers: [["darker", 1.2]] }}
                parentLabelTextColor={{
                  from: "color",
                  modifiers: [["darker", 2]],
                }}
                borderColor={{ from: "color", modifiers: [["darker", 0.1]] }}
                colors={{ scheme: "spectral" }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>
              Monthly revenue and booking correlation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ height: "300px" }}>
              <ResponsiveBar
                data={analyticsData.revenueByMonth}
                keys={["revenue", "bookings"]}
                indexBy="month"
                margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                padding={0.3}
                valueScale={{ type: "linear" }}
                indexScale={{ type: "band", round: true }}
                colors={{ scheme: "paired" }}
                borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: "Month",
                  legendPosition: "middle",
                  legendOffset: 32,
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: "Value",
                  legendPosition: "middle",
                  legendOffset: -40,
                }}
                labelSkipWidth={12}
                labelSkipHeight={12}
                labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
                legends={[
                  {
                    dataFrom: "keys",
                    anchor: "bottom-right",
                    direction: "column",
                    justify: false,
                    translateX: 120,
                    translateY: 0,
                    itemsSpacing: 2,
                    itemWidth: 100,
                    itemHeight: 20,
                    itemDirection: "left-to-right",
                    itemOpacity: 0.85,
                    symbolSize: 20,
                    effects: [
                      {
                        on: "hover",
                        style: {
                          itemOpacity: 1,
                        },
                      },
                    ],
                  },
                ]}
              />
            </div>
          </CardContent>
        </Card>

        {/* User Demographics */}
        <Card>
          <CardHeader>
            <CardTitle>User Demographics</CardTitle>
            <CardDescription>User type distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ height: "300px" }}>
              <ResponsivePie
                data={analyticsData.userDemographics}
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
                colors={{ scheme: "set2" }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Location Heatmap */}
      {heatMapData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Location Activity Heatmap</CardTitle>
            <CardDescription>
              Activity intensity by location and time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ height: "400px" }}>
              <ResponsiveHeatMap
                data={heatMapData}
                margin={{ top: 60, right: 90, bottom: 60, left: 90 }}
                valueFormat=">-.2s"
                axisTop={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: -90,
                  legend: "",
                  legendOffset: 46,
                }}
                axisRight={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: "Location",
                  legendPosition: "middle",
                  legendOffset: 70,
                }}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: -90,
                  legend: "Time",
                  legendPosition: "middle",
                  legendOffset: 46,
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: "Location",
                  legendPosition: "middle",
                  legendOffset: -72,
                }}
                colors={{
                  type: "diverging",
                  scheme: "red_yellow_blue",
                  divergeAt: 0.5,
                  minValue: 0,
                  maxValue: 100,
                }}
                emptyColor="#555555"
                legends={[
                  {
                    anchor: "bottom",
                    translateX: 0,
                    translateY: 30,
                    length: 400,
                    thickness: 8,
                    direction: "row",
                    tickPosition: "after",
                    tickSize: 3,
                    tickSpacing: 4,
                    tickOverlap: false,
                    tickFormat: ">-.2s",
                    title: "Activity Level →",
                    titleAlign: "start",
                    titleOffset: 4,
                  },
                ]}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminAnalytics;
