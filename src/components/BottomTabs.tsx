"use client";

import { cn } from "@/lib/utils";
import { Car, Home, MessageSquare, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomTabs() {
  const pathname = usePathname();

  const tabs = [
    {
      href: "/drivers",
      icon: Home,
      label: "Home",
      isActive: pathname === "/drivers",
    },
    {
      href: "/drivers/trips",
      icon: Car,
      label: "Trips",
      isActive: pathname.startsWith("/drivers/trips"),
    },
    {
      href: "/drivers/messages",
      icon: MessageSquare,
      label: "Messages",
      isActive: pathname.startsWith("/drivers/messages"),
      badge: 2,
    },
    {
      href: "/drivers/account",
      icon: User,
      label: "Account",
      isActive: pathname.startsWith("/drivers/account"),
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200/50 shadow-lg z-50">
      <div className="safe-area-bottom">
        <nav className="flex justify-around items-center h-20 px-4">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center justify-center flex-1 py-2 relative group"
            >
              <div className="relative">
                {/* Icon Container */}
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
                    tab.isActive
                      ? "bg-blue-100"
                      : "group-hover:bg-gray-50 group-active:bg-gray-100"
                  )}
                >
                  <tab.icon
                    className={cn(
                      "w-5 h-5 transition-colors duration-200",
                      tab.isActive
                        ? "text-blue-600"
                        : "text-gray-500 group-hover:text-gray-700"
                    )}
                  />
                </div>

                {/* Badge */}
                {tab.badge && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {tab.badge}
                    </span>
                  </div>
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  "text-xs font-medium mt-1 transition-colors duration-200",
                  tab.isActive
                    ? "text-blue-600"
                    : "text-gray-500 group-hover:text-gray-700"
                )}
              >
                {tab.label}
              </span>

              {/* Active Indicator */}
              {tab.isActive && (
                <div className="absolute bottom-0 w-1 h-1 bg-blue-600 rounded-full" />
              )}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
