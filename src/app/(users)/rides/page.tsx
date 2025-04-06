"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";

type Driver = {
  id: string;
  name: string;
  avatar: string;
  price: number;
  departureTime: string;
  route: {
    from: string;
    to: string;
  };
};

export default function RidesPage() {
  const drivers: Driver[] = [
    {
      id: "1",
      name: "Amanda H.",
      avatar: "/avatars/amanda.png",
      price: 35,
      departureTime: "9:00 AM",
      route: {
        from: "San Francisco",
        to: "Los Angeles",
      },
    },
    {
      id: "2",
      name: "John",
      avatar: "/avatars/john.png",
      price: 40,
      departureTime: "10:30 AM",
      route: {
        from: "San Francisco",
        to: "Los Angeles",
      },
    },
    {
      id: "3",
      name: "Emily R",
      avatar: "/avatars/emily.png",
      price: 30,
      departureTime: "2:45 PM",
      route: {
        from: "San Francisco",
        to: "Los Angeles",
      },
    },
  ];

  return (
    <div className='p-4 max-w-md mx-auto'>
      <div className='flex items-center mb-6'>
        <Link href='/' className='p-2'>
          <ChevronLeft size={24} />
        </Link>
        <div className='flex-1 flex justify-center mr-8'>
          <h1 className='text-2xl font-bold'>Rides available</h1>
        </div>
      </div>

      <div className='space-y-4'>
        {drivers.map((driver) => (
          <div key={driver.id} className='border-b border-gray-200 pb-4'>
            <div className='flex items-center mb-3'>
              <div className='w-12 h-12 rounded-full overflow-hidden bg-gray-200 mr-3'>
                {/* Fallback avatar if image fails to load */}
                <div className='w-full h-full flex items-center justify-center bg-green-100 text-green-800 font-bold'>
                  {driver.name.charAt(0)}
                </div>
              </div>
              <div className='flex-1'>
                <div className='flex justify-between items-center'>
                  <div className='text-lg font-medium'>{driver.route.from}</div>
                  <div className='text-lg font-bold text-green-800'>
                    ${driver.price}
                  </div>
                </div>
                <div className='text-gray-500'>{driver.route.to}</div>
              </div>
            </div>

            <div className='flex justify-between items-center pl-14'>
              <div>
                <div className='font-medium'>{driver.route.from}</div>
                <div className='text-gray-500'>{driver.route.to}</div>
              </div>
              <div className='text-right font-medium'>
                {driver.departureTime}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
