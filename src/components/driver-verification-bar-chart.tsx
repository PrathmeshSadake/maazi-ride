"use client";

import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useQuery } from "@tanstack/react-query";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DriverVerificationData {
  name: string;
  verified: number;
  unverified: number;
}

const fetchDriverVerificationData = async (): Promise<
  DriverVerificationData[]
> => {
  const response = await fetch("/api/admin/driver-verification");
  if (!response.ok) {
    throw new Error("Failed to fetch driver verification data");
  }

  const data = await response.json();

  return [
    {
      name: "Driving License",
      verified: data.drivingLicense.verified,
      unverified: data.drivingLicense.unverified,
    },
    {
      name: "Vehicle Registration",
      verified: data.vehicleRegistration.verified,
      unverified: data.vehicleRegistration.unverified,
    },
    {
      name: "Insurance",
      verified: data.insurance.verified,
      unverified: data.insurance.unverified,
    },
    {
      name: "Vehicle Images",
      verified: data.vehicleImages.verified,
      unverified: data.vehicleImages.unverified,
    },
  ];
};

export function DriverVerificationBarChart() {
  const { data: chartData, isLoading } = useQuery({
    queryKey: ["driverVerificationData"],
    queryFn: fetchDriverVerificationData,
    placeholderData: [
      { name: "Driving License", verified: 0, unverified: 0 },
      { name: "Vehicle Registration", verified: 0, unverified: 0 },
      { name: "Insurance", verified: 0, unverified: 0 },
      { name: "Vehicle Images", verified: 0, unverified: 0 },
    ],
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Driver Documentation</CardTitle>
        <CardDescription>
          Verification status of driver documentation
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
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="verified"
                  stackId="a"
                  fill="#22c55e"
                  name="Verified"
                />
                <Bar
                  dataKey="unverified"
                  stackId="a"
                  fill="#ef4444"
                  name="Unverified"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
