"use client";

import { User, Settings, CreditCard, Bell, LogOut, Car } from "lucide-react";

export default function AccountPage() {
  const menuItems = [
    {
      icon: User,
      label: "Personal Information",
      href: "/account/profile",
    },
    {
      icon: Car,
      label: "My Vehicles",
      href: "/account/vehicles",
    },
    {
      icon: CreditCard,
      label: "Payment Methods",
      href: "/account/payment",
    },
    {
      icon: Bell,
      label: "Notifications",
      href: "/account/notifications",
    },
    {
      icon: Settings,
      label: "Settings",
      href: "/account/settings",
    },
    {
      icon: LogOut,
      label: "Log Out",
      href: "/auth/logout",
    },
  ];

  return (
    <div className='p-4 max-w-md mx-auto'>
      <h1 className='text-3xl font-bold mb-8'>Account</h1>

      <div className='flex items-center mb-8'>
        <div className='w-16 h-16 rounded-full overflow-hidden bg-gray-200 mr-4'>
          <div className='w-full h-full flex items-center justify-center bg-green-100 text-green-800 text-xl font-bold'>
            J
          </div>
        </div>
        <div>
          <h2 className='text-xl font-semibold'>John Doe</h2>
          <p className='text-gray-500'>john.doe@example.com</p>
        </div>
      </div>

      <div className='space-y-1'>
        {menuItems.map((item, index) => (
          <a
            key={index}
            href={item.href}
            className='flex items-center p-4 hover:bg-gray-50 rounded-lg transition-colors'
          >
            <item.icon size={20} className='text-gray-500 mr-3' />
            <span className='flex-1'>{item.label}</span>
          </a>
        ))}
      </div>

      <div className='mt-8 text-center text-gray-500 text-sm'>
        <p>Version 1.0.0</p>
      </div>
    </div>
  );
}
