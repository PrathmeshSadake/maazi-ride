"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Car, MessageSquare, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function BottomTabs() {
  const pathname = usePathname();

  const tabs = [
    {
      href: "/drivers",
      icon: Home,
      label: "Dashboard",
      isActive: pathname === "/drivers",
    },
    {
      href: "/drivers/trips",
      icon: Car,
      label: "Rides",
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
      icon: Settings,
      label: "Account",
      isActive: pathname.startsWith("/drivers/account"),
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-30">
      <div className="max-w-sm mx-auto">
        <nav className="flex justify-around items-center h-16 px-2">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-2 text-xs transition-colors relative",
                tab.isActive
                  ? "text-blue-600"
                  : "text-gray-600 hover:text-blue-500"
              )}
            >
              <tab.icon
                className={cn(
                  "h-5 w-5 mb-1",
                  tab.isActive ? "text-blue-600" : "text-gray-600"
                )}
              />
              <span
                className={cn(
                  "text-xs",
                  tab.isActive ? "text-blue-600 font-medium" : "text-gray-600"
                )}
              >
                {tab.label}
              </span>
              {tab.badge && (
                <Badge className="absolute -top-1 right-0 h-4 w-4 rounded-full p-0 text-xs bg-red-500 flex items-center justify-center">
                  {tab.badge}
                </Badge>
              )}
              {tab.isActive && (
                <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
              )}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
