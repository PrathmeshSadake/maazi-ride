"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, IndianRupee, TrendingUp, Car, Clock } from "lucide-react";
import { useState } from "react";

type EarningsPeriod = "daily" | "weekly" | "monthly";

export default function EarningsPage() {
  const [period, setPeriod] = useState<EarningsPeriod>("weekly");

  const earningsData = {
    daily: {
      totalEarnings: 85,
      rides: 5,
      hours: 4.5,
      avgPerRide: 17,
      avgPerHour: 18.89,
      history: [
        {
          id: "1",
          date: "Today",
          amount: 85,
          rides: 5,
        },
      ],
    },
    weekly: {
      totalEarnings: 620,
      rides: 32,
      hours: 28,
      avgPerRide: 19.38,
      avgPerHour: 22.14,
      history: [
        {
          id: "1",
          date: "This Week",
          amount: 620,
          rides: 32,
        },
        {
          id: "2",
          date: "Last Week",
          amount: 580,
          rides: 28,
        },
        {
          id: "3",
          date: "2 Weeks Ago",
          amount: 645,
          rides: 35,
        },
      ],
    },
    monthly: {
      totalEarnings: 2570,
      rides: 135,
      hours: 120,
      avgPerRide: 19.04,
      avgPerHour: 21.42,
      history: [
        {
          id: "1",
          date: "This Month",
          amount: 2570,
          rides: 135,
        },
        {
          id: "2",
          date: "Last Month",
          amount: 2640,
          rides: 140,
        },
        {
          id: "3",
          date: "2 Months Ago",
          amount: 2350,
          rides: 125,
        },
      ],
    },
  };

  const currentData = earningsData[period];

  return (
    <div className='p-4'>
      <h1 className='text-2xl font-bold mb-6'>Earnings</h1>

      <Tabs
        defaultValue='weekly'
        className='w-full mb-6'
        onValueChange={(value) => setPeriod(value as EarningsPeriod)}
      >
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='daily'>Daily</TabsTrigger>
          <TabsTrigger value='weekly'>Weekly</TabsTrigger>
          <TabsTrigger value='monthly'>Monthly</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className='bg-green-50 rounded-lg p-6 mb-6'>
        <div className='flex justify-between items-start mb-4'>
          <div>
            <div className='text-sm text-gray-500'>Total Earnings</div>
            <div className='text-3xl font-bold'>
              ${currentData.totalEarnings}
            </div>
          </div>
          <div className='h-10 w-10 rounded-full bg-green-100 flex items-center justify-center'>
            <IndianRupee size={20} className='text-green-800' />
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div>
            <div className='text-sm text-gray-500'>Rides</div>
            <div className='text-xl font-bold flex items-center'>
              <Car size={16} className='mr-1 text-gray-400' />
              {currentData.rides}
            </div>
          </div>
          <div>
            <div className='text-sm text-gray-500'>Hours</div>
            <div className='text-xl font-bold flex items-center'>
              <Clock size={16} className='mr-1 text-gray-400' />
              {currentData.hours}
            </div>
          </div>
          <div>
            <div className='text-sm text-gray-500'>Avg. per ride</div>
            <div className='text-xl font-bold'>${currentData.avgPerRide}</div>
          </div>
          <div>
            <div className='text-sm text-gray-500'>Avg. per hour</div>
            <div className='text-xl font-bold'>${currentData.avgPerHour}</div>
          </div>
        </div>
      </div>

      <div>
        <h2 className='text-lg font-semibold mb-4'>Earnings History</h2>
        <div className='space-y-3'>
          {currentData.history.map((item) => (
            <div
              key={item.id}
              className='bg-white rounded-lg shadow-sm p-4 border border-gray-100'
            >
              <div className='flex justify-between items-center'>
                <div>
                  <div className='flex items-center'>
                    <Calendar size={16} className='text-gray-500 mr-2' />
                    <span className='font-medium'>{item.date}</span>
                  </div>
                  <div className='text-sm text-gray-500 mt-1'>
                    {item.rides} rides
                  </div>
                </div>
                <div className='text-xl font-bold text-green-800'>
                  ${item.amount}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
