"use client";

import * as React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { useQuery } from "@tanstack/react-query";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface BookingStatusData {
  name: string;
  value: number;
  color: string;
}

const fetchBookingStatusData = async (): Promise<BookingStatusData[]> => {
  const response = await fetch("/api/admin/booking-status");
  if (!response.ok) {
    throw new Error("Failed to fetch booking status data");
  }

  const data = await response.json();

  return [
    { name: "Pending", value: data.pending, color: "#facc15" },
    { name: "Confirmed", value: data.confirmed, color: "#3b82f6" },
    { name: "Completed", value: data.completed, color: "#22c55e" },
    { name: "Cancelled", value: data.cancelled, color: "#ef4444" },
    { name: "Rejected", value: data.rejected, color: "#9f1239" },
  ];
};

export function BookingStatusPieChart() {
  const { data: chartData, isLoading } = useQuery({
    queryKey: ["bookingStatusData"],
    queryFn: fetchBookingStatusData,
    placeholderData: [
      { name: "Pending", value: 0, color: "#facc15" },
      { name: "Confirmed", value: 0, color: "#3b82f6" },
      { name: "Completed", value: 0, color: "#22c55e" },
      { name: "Cancelled", value: 0, color: "#ef4444" },
      { name: "Rejected", value: 0, color: "#9f1239" },
    ],
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Status Distribution</CardTitle>
        <CardDescription>
          Current distribution of booking statuses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              Loading chart data...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value} bookings`, "Count"]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
