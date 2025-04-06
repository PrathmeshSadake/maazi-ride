"use client";

import { Search, MapPin, Navigation, Clock } from "lucide-react";

export default function ExplorePage() {
  const popularDestinations = [
    {
      name: "Los Angeles",
      distance: "383 miles",
      time: "5h 45m",
    },
    {
      name: "San Diego",
      distance: "503 miles",
      time: "7h 30m",
    },
    {
      name: "Las Vegas",
      distance: "569 miles",
      time: "8h 15m",
    },
    {
      name: "Sacramento",
      distance: "87 miles",
      time: "1h 30m",
    },
  ];

  return (
    <div className='p-4 max-w-md mx-auto'>
      <h1 className='text-2xl font-bold mb-6'>Explore</h1>

      <div className='relative mb-6'>
        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
          <Search size={20} className='text-gray-400' />
        </div>
        <input
          type='text'
          placeholder='Where to?'
          className='w-full py-3 pl-10 pr-4 bg-gray-100 border-none rounded-full focus:ring-2 focus:ring-green-800 focus:outline-none'
        />
      </div>

      <div className='bg-gray-100 rounded-lg p-4 mb-6'>
        <div className='flex items-center mb-4'>
          <div className='w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3'>
            <MapPin size={16} className='text-green-800' />
          </div>
          <div>
            <h3 className='font-medium'>Set pickup location</h3>
            <p className='text-sm text-gray-500'>Current location</p>
          </div>
        </div>

        <div className='h-px bg-gray-300 my-3 mx-4' />

        <div className='flex items-center'>
          <div className='w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3'>
            <Navigation size={16} className='text-gray-500' />
          </div>
          <div>
            <h3 className='font-medium'>Set destination</h3>
            <p className='text-sm text-gray-500'>Choose destination</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className='text-lg font-semibold mb-4'>Popular destinations</h2>
        <div className='space-y-4'>
          {popularDestinations.map((destination, index) => (
            <div
              key={index}
              className='flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer'
            >
              <div className='flex items-center'>
                <div className='w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3'>
                  <MapPin size={16} className='text-gray-500' />
                </div>
                <div>
                  <h3 className='font-medium'>{destination.name}</h3>
                  <p className='text-sm text-gray-500'>
                    {destination.distance}
                  </p>
                </div>
              </div>
              <div className='flex items-center text-gray-500'>
                <Clock size={14} className='mr-1' />
                <span className='text-sm'>{destination.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
