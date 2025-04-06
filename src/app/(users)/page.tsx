"use client";

import { useState } from "react";
import { Calendar, Car, MapPin } from "lucide-react";

export default function HomePage() {
  const [fromLocation, setFromLocation] = useState("San Francisco");
  const [toLocation, setToLocation] = useState("Los Angeles");
  const [date, setDate] = useState("Feb 20, 2024");

  return (
    <div className='p-6 max-w-md mx-auto'>
      <div className='flex items-center justify-center mt-8 mb-6'>
        <div className='bg-green-800 text-white rounded-full p-3'>
          <Car size={32} className='text-white' />
        </div>
      </div>

      <h1 className='text-3xl font-bold text-center mb-8'>Carpooling</h1>

      <div className='space-y-4'>
        <div className='space-y-2'>
          <label className='text-sm font-medium'>From</label>
          <div className='border border-gray-300 rounded-lg p-4 flex items-center'>
            <MapPin size={20} className='text-gray-500 mr-2' />
            <input
              type='text'
              value={fromLocation}
              onChange={(e) => setFromLocation(e.target.value)}
              className='w-full outline-none'
            />
          </div>
        </div>

        <div className='space-y-2'>
          <label className='text-sm font-medium'>To</label>
          <div className='border border-gray-300 rounded-lg p-4 flex items-center'>
            <MapPin size={20} className='text-gray-500 mr-2' />
            <input
              type='text'
              value={toLocation}
              onChange={(e) => setToLocation(e.target.value)}
              className='w-full outline-none'
            />
          </div>
        </div>

        <div className='space-y-2'>
          <label className='text-sm font-medium'>Date</label>
          <div className='border border-gray-300 rounded-lg p-4 flex items-center'>
            <Calendar size={20} className='text-gray-500 mr-2' />
            <input
              type='text'
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className='w-full outline-none'
            />
          </div>
        </div>
      </div>

      <button className='w-full bg-green-800 text-white py-4 rounded-lg mt-8 font-medium'>
        Find a ride
      </button>
    </div>
  );
}
