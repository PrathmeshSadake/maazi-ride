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

interface DriverVerificationBarChartProps {
  data: DriverVerificationData[];
}

export function DriverVerificationBarChart({
  data,
}: DriverVerificationBarChartProps) {
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
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
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
        </div>
      </CardContent>
    </Card>
  );
}
