"use client";

import Link from "next/link";
import { Home, Car, User, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface DriverNavigationProps {
  isVerified: boolean;
}

export default function DriverNavigation({
  isVerified,
}: DriverNavigationProps) {
  const pathname = usePathname();
  const isOnboardingPage = pathname.includes("/onboarding");

  const navItems = [
    {
      label: "Home",
      href: "/drivers",
      icon: Home,
    },
    {
      label: "My Trips",
      href: "/drivers/trips",
      icon: Car,
    },
    {
      label: "Messages",
      href: "/drivers/messages",
      icon: MessageSquare,
    },
    {
      label: "Account",
      href: "/drivers/account",
      icon: User,
    },
  ];

  // Don't show navigation if not verified or on onboarding page
  // if (!isVerified || isOnboardingPage) {
  //   return null;
  // }

  return (
    <div className="mx-auto w-full max-w-sm fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white">
      <nav className="flex justify-between items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center flex-1 pt-2 pb-1 text-xs",
              "text-slate-600"
            )}
            prefetch={false}
          >
            <item.icon size={24} className="mb-1 text-slate-600" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
