"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Circle, Car } from "lucide-react";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function DriverDetailPage({ params }: Props) {
  const { id } = await params;
  // In a real app, you would fetch this data based on the ID
  const driverDetails = {
    id: id,
    name: "Amanda H.",
    rating: 4.8,
    rides: 120,
    avatar: "/avatars/amanda.png",
    route: {
      from: "San Francisco",
      to: "Los Angeles",
    },
    arrivalTime: "3:00 AM",
    car: "Toyota Prius",
    availableSeats: 1,
    price: 35,
  };

  return (
    <div className='p-4 max-w-md mx-auto'>
      <div className='flex items-center mb-6'>
        <Link href='/rides' className='p-2'>
          <ChevronLeft size={24} />
        </Link>
      </div>

      <div className='flex flex-col items-center mb-8'>
        <div className='w-24 h-24 rounded-full overflow-hidden bg-gray-200 mb-4'>
          {/* Fallback avatar if image fails to load */}
          <div className='w-full h-full flex items-center justify-center bg-green-100 text-green-800 text-xl font-bold'>
            {driverDetails.name.charAt(0)}
          </div>
        </div>
        <h1 className='text-2xl font-bold'>{driverDetails.name}</h1>
        <div className='flex items-center mt-2 text-gray-600'>
          <span className='font-medium'>{driverDetails.rating}</span>
          <span className='mx-2'>•</span>
          <span>{driverDetails.rides} rides</span>
        </div>
      </div>

      <div className='mb-8'>
        <div className='flex items-start mb-6'>
          <div className='mr-4 flex flex-col items-center'>
            <Circle size={12} className='fill-green-800 text-green-800' />
            <div className='w-0.5 h-16 bg-gray-300 my-1'></div>
            <Circle size={12} className='fill-green-800 text-green-800' />
          </div>
          <div className='flex-1 space-y-6'>
            <div>
              <div className='font-medium'>{driverDetails.route.from}</div>
              <div className='text-gray-500'>{driverDetails.route.to}</div>
            </div>
            <div>
              <div className='font-medium'>{driverDetails.route.to}</div>
              <div className='text-gray-500'>{driverDetails.arrivalTime}</div>
            </div>
          </div>
        </div>
      </div>

      <div className='flex items-center mb-6 p-4 bg-gray-100 rounded-lg'>
        <Car size={24} className='text-gray-700 mr-3' />
        <div className='flex-1'>
          <div className='font-medium'>{driverDetails.car}</div>
        </div>
      </div>

      <div className='flex justify-between items-center mb-8'>
        <div className='flex items-center'>
          <span className='text-lg font-medium mr-1'>
            {driverDetails.availableSeats} seat
          </span>
        </div>
        <div className='flex items-center'>
          <span className='text-lg font-medium'>
            {driverDetails.availableSeats}
          </span>
          <ChevronRight size={20} />
        </div>
      </div>

      <button className='w-full bg-green-800 text-white py-4 rounded-lg font-medium'>
        Request ride
      </button>
    </div>
  );
}
