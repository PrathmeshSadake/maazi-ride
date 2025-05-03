"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  IndianRupee,
  TrendingUp,
  Car,
  Clock,
  Calendar as CalendarIcon,
} from "lucide-react";
import { useState } from "react";

type EarningsPeriod = "daily" | "weekly" | "monthly";

export default function EarningsPage() {
  const [period, setPeriod] = useState<EarningsPeriod>("weekly");

  const earningsData = {
    daily: {
      totalEarnings: 1250,
      rides: 8,
      hours: 6.5,
      avgPerRide: 156.25,
      avgPerHour: 192.31,
      history: [
        {
          id: "1",
          date: "Today",
          amount: 1250,
          rides: 8,
        },
      ],
    },
    weekly: {
      totalEarnings: 7850,
      rides: 42,
      hours: 38,
      avgPerRide: 186.9,
      avgPerHour: 206.58,
      history: [
        {
          id: "1",
          date: "This Week",
          amount: 7850,
          rides: 42,
        },
        {
          id: "2",
          date: "Last Week",
          amount: 6950,
          rides: 36,
        },
        {
          id: "3",
          date: "2 Weeks Ago",
          amount: 8350,
          rides: 45,
        },
      ],
    },
    monthly: {
      totalEarnings: 32500,
      rides: 165,
      hours: 148,
      avgPerRide: 196.97,
      avgPerHour: 219.59,
      history: [
        {
          id: "1",
          date: "This Month",
          amount: 32500,
          rides: 165,
        },
        {
          id: "2",
          date: "Last Month",
          amount: 30200,
          rides: 155,
        },
        {
          id: "3",
          date: "2 Months Ago",
          amount: 28750,
          rides: 148,
        },
      ],
    },
  };

  const currentData = earningsData[period];

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Earnings Dashboard
      </h1>

      <Tabs
        defaultValue="weekly"
        className="w-full mb-6"
        onValueChange={(value) => setPeriod(value as EarningsPeriod)}
      >
        <TabsList className="grid w-full grid-cols-3 mb-8 rounded-xl bg-gray-100 p-1">
          <TabsTrigger
            value="daily"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Daily
          </TabsTrigger>
          <TabsTrigger
            value="weekly"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Weekly
          </TabsTrigger>
          <TabsTrigger
            value="monthly"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Monthly
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 mb-8 shadow-sm border border-green-100">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="text-sm text-gray-500 font-medium">
              Total Earnings
            </div>
            <div className="text-4xl font-bold text-green-800 flex items-center mt-1">
              <span className="text-xl mr-1">₹</span>
              {currentData.totalEarnings.toLocaleString("en-IN")}
            </div>
          </div>
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center shadow-inner">
            <IndianRupee size={24} className="text-green-700" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white/60 p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500 font-medium">Rides</div>
            <div className="text-2xl font-bold flex items-center mt-1 text-gray-800">
              <Car size={20} className="mr-2 text-green-600" />
              {currentData.rides}
            </div>
          </div>
          <div className="bg-white/60 p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500 font-medium">Hours</div>
            <div className="text-2xl font-bold flex items-center mt-1 text-gray-800">
              <Clock size={20} className="mr-2 text-green-600" />
              {currentData.hours}
            </div>
          </div>
          <div className="bg-white/60 p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500 font-medium">
              Avg. per ride
            </div>
            <div className="text-2xl font-bold mt-1 text-gray-800 flex items-center">
              <span className="text-sm mr-1">₹</span>
              {currentData.avgPerRide.toFixed(2)}
            </div>
          </div>
          <div className="bg-white/60 p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500 font-medium">
              Avg. per hour
            </div>
            <div className="text-2xl font-bold mt-1 text-gray-800 flex items-center">
              <span className="text-sm mr-1">₹</span>
              {currentData.avgPerHour.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
          <TrendingUp size={20} className="mr-2 text-green-600" />
          Earnings History
        </h2>
        <div className="space-y-4">
          {currentData.history.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center">
                    <CalendarIcon size={18} className="text-green-600 mr-2" />
                    <span className="font-medium text-gray-800">
                      {item.date}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-2 flex items-center">
                    <Car size={14} className="mr-1 text-gray-400" />
                    {item.rides} rides
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-700 flex items-center">
                  <span className="text-lg mr-1">₹</span>
                  {item.amount.toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
