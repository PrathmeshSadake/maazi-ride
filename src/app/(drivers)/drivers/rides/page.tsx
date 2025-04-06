"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, Clock, MapPin, Navigation, Phone } from "lucide-react";

type Ride = {
  id: string;
  passenger: {
    name: string;
    rating: number;
  };
  pickup: string;
  destination: string;
  dateTime: string;
  status: "current" | "upcoming" | "completed";
  earnings: number;
  distance: string;
  timeEstimate: string;
};

export default function DriverRidesPage() {
  const rides: Ride[] = [
    {
      id: "101",
      passenger: {
        name: "John D.",
        rating: 4.8,
      },
      pickup: "San Francisco",
      destination: "Los Angeles",
      dateTime: "Today, 9:00 AM",
      status: "current",
      earnings: 135,
      distance: "383 miles",
      timeEstimate: "5h 45m",
    },
    {
      id: "102",
      passenger: {
        name: "Sarah M.",
        rating: 4.9,
      },
      pickup: "San Francisco",
      destination: "San Diego",
      dateTime: "Tomorrow, 10:30 AM",
      status: "upcoming",
      earnings: 145,
      distance: "503 miles",
      timeEstimate: "7h 30m",
    },
    {
      id: "103",
      passenger: {
        name: "Michael R.",
        rating: 4.7,
      },
      pickup: "San Francisco",
      destination: "Sacramento",
      dateTime: "Wed, 8:00 AM",
      status: "upcoming",
      earnings: 85,
      distance: "87 miles",
      timeEstimate: "1h 30m",
    },
  ];

  const currentRide = rides.find((ride) => ride.status === "current");
  const upcomingRides = rides.filter((ride) => ride.status === "upcoming");
  const completedRides = rides.filter((ride) => ride.status === "completed");

  return (
    <div className='p-4'>
      <h1 className='text-2xl font-bold mb-6'>Your Rides</h1>

      {currentRide && (
        <div className='mb-6'>
          <h2 className='text-lg font-semibold mb-3'>Current Ride</h2>
          <div className='bg-white rounded-lg shadow-sm p-4 border border-green-100'>
            <div className='flex justify-between items-center mb-3'>
              <div className='flex items-center'>
                <div className='w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3'>
                  <span className='font-bold'>
                    {currentRide.passenger.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className='font-medium'>{currentRide.passenger.name}</h3>
                  <div className='text-sm text-gray-500'>
                    Rating: {currentRide.passenger.rating}
                  </div>
                </div>
              </div>
              <button className='h-10 w-10 rounded-full bg-green-100 flex items-center justify-center'>
                <Phone size={18} className='text-green-800' />
              </button>
            </div>

            <div className='flex items-start mb-4'>
              <div className='mr-3 flex flex-col items-center'>
                <MapPin size={14} className='text-green-600' />
                <div className='w-0.5 h-8 bg-gray-300 my-1'></div>
                <Navigation size={14} className='text-red-600' />
              </div>
              <div className='flex-1'>
                <div className='text-sm'>
                  <div className='font-medium'>{currentRide.pickup}</div>
                  <div className='text-gray-500 text-xs mb-2'>
                    Pickup location
                  </div>
                  <div className='font-medium'>{currentRide.destination}</div>
                  <div className='text-gray-500 text-xs'>Destination</div>
                </div>
              </div>
            </div>

            <div className='flex items-center justify-between text-sm'>
              <div className='text-green-800 font-bold'>
                ${currentRide.earnings}
              </div>
              <div className='flex items-center text-gray-500'>
                <Clock size={14} className='mr-1' />
                <span>{currentRide.timeEstimate}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <Tabs defaultValue='upcoming' className='w-full'>
        <TabsList className='grid w-full grid-cols-2 mb-6'>
          <TabsTrigger value='upcoming'>Upcoming</TabsTrigger>
          <TabsTrigger value='completed'>Completed</TabsTrigger>
        </TabsList>

        <TabsContent value='upcoming' className='space-y-4'>
          {upcomingRides.length > 0 ? (
            upcomingRides.map((ride) => (
              <div
                key={ride.id}
                className='bg-white rounded-lg shadow-sm p-4 border border-gray-100'
              >
                <div className='flex justify-between items-center mb-2'>
                  <div className='text-sm font-medium text-gray-500'>
                    {ride.dateTime}
                  </div>
                  <div className='text-green-800 font-bold'>
                    ${ride.earnings}
                  </div>
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
                    <Car size={14} className='mr-1' />
                    <span>{ride.passenger.name}</span>
                  </div>
                  <div className='flex items-center'>
                    <Clock size={14} className='mr-1' />
                    <span>{ride.timeEstimate}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className='text-center py-8 text-gray-500'>
              No upcoming rides scheduled
            </div>
          )}
        </TabsContent>

        <TabsContent value='completed' className='space-y-4'>
          {completedRides.length > 0 ? (
            completedRides.map((ride) => (
              <div
                key={ride.id}
                className='bg-white rounded-lg shadow-sm p-4 border border-gray-100'
              >
                <div className='flex justify-between items-center mb-2'>
                  <div className='text-sm font-medium text-gray-500'>
                    {ride.dateTime}
                  </div>
                  <div className='text-green-800 font-bold'>
                    ${ride.earnings}
                  </div>
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
                    <Car size={14} className='mr-1' />
                    <span>{ride.passenger.name}</span>
                  </div>
                  <div className='flex items-center'>
                    <Clock size={14} className='mr-1' />
                    <span>{ride.timeEstimate}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className='text-center py-8 text-gray-500'>
              No completed rides yet
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
