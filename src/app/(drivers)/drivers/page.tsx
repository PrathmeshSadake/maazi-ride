"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Car,
  Clock,
  MapPin,
  TrendingUp,
  DollarSign,
  Navigation,
} from "lucide-react";

export default function DriversHomePage() {
  const rideRequests = [
    {
      id: "1",
      pickup: "San Francisco",
      destination: "Los Angeles",
      estimatedEarning: 120,
      distance: "383 miles",
      timeEstimate: "5h 45m",
    },
    {
      id: "2",
      pickup: "San Francisco",
      destination: "San Diego",
      estimatedEarning: 140,
      distance: "503 miles",
      timeEstimate: "7h 30m",
    },
  ];

  const stats = [
    {
      label: "Today's Earnings",
      value: "$120",
      icon: DollarSign,
      color: "bg-green-100 text-green-800",
    },
    {
      label: "Total Rides",
      value: "8",
      icon: Car,
      color: "bg-blue-100 text-blue-800",
    },
    {
      label: "Acceptance Rate",
      value: "92%",
      icon: TrendingUp,
      color: "bg-purple-100 text-purple-800",
    },
  ];

  return (
    <div className='p-4'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold'>Welcome, Driver</h1>
        <div className='h-10 w-10 rounded-full bg-green-100 flex items-center justify-center'>
          <span className='text-green-800 font-bold'>D</span>
        </div>
      </div>

      <div className='grid grid-cols-3 gap-2 mb-6'>
        {stats.map((stat, index) => (
          <div key={index} className='bg-white rounded-lg p-3 shadow-sm'>
            <div
              className={`w-8 h-8 rounded-full ${stat.color} flex items-center justify-center mb-2`}
            >
              <stat.icon size={16} />
            </div>
            <div className='text-sm text-gray-500'>{stat.label}</div>
            <div className='text-xl font-bold'>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className='mb-6'>
        <h2 className='text-lg font-semibold mb-4'>Available Ride Requests</h2>
        <div className='space-y-4'>
          {rideRequests.map((ride) => (
            <div
              key={ride.id}
              className='bg-white rounded-lg shadow-sm p-4 border border-gray-100'
            >
              <div className='flex justify-between items-center mb-3'>
                <h3 className='font-medium'>Ride Request #{ride.id}</h3>
                <span className='text-green-800 font-bold'>
                  ${ride.estimatedEarning}
                </span>
              </div>

              <div className='flex items-start mb-3'>
                <div className='mr-3 flex flex-col items-center'>
                  <MapPin size={14} className='text-green-600' />
                  <div className='w-0.5 h-8 bg-gray-300 my-1'></div>
                  <Navigation size={14} className='text-red-600' />
                </div>
                <div className='flex-1'>
                  <div className='text-sm'>
                    <div className='font-medium'>{ride.pickup}</div>
                    <div className='text-gray-500 text-xs mb-2'>
                      Pickup location
                    </div>
                    <div className='font-medium'>{ride.destination}</div>
                    <div className='text-gray-500 text-xs'>Destination</div>
                  </div>
                </div>
              </div>

              <div className='flex items-center justify-between text-sm text-gray-500'>
                <div className='flex items-center'>
                  <Clock size={14} className='mr-1' />
                  <span>{ride.timeEstimate}</span>
                </div>
                <div>{ride.distance}</div>
              </div>

              <button className='w-full bg-green-800 text-white py-2 rounded-lg mt-3 text-sm font-medium'>
                Accept Ride
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
