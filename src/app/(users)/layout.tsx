"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, User, Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
    },
    {
      label: "Explore",
      href: "/explore",
      icon: Search,
    },
    {
      label: "Rides",
      href: "/rides",
      icon: MapPin,
    },
    {
      label: "Activity",
      href: "/activity",
      icon: Clock,
    },
    {
      label: "Account",
      href: "/account",
      icon: User,
    },
  ];

  return (
    <div className='min-h-screen flex flex-col w-full max-w-sm mx-auto'>
      <main className='flex-1 pb-16'>{children}</main>

      {/* Bottom Navbar */}
      <div className='mx-auto w-full max-w-sm fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white'>
        <nav className='flex justify-between items-center h-16'>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 pt-2 pb-1 text-xs",
                  isActive ? "text-green-700" : "text-slate-600"
                )}
              >
                <item.icon
                  size={24}
                  className={cn(
                    "mb-1",
                    isActive ? "text-green-700" : "text-slate-600"
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
