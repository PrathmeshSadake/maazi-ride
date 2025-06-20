import { redirect } from "next/navigation";
import React from "react";
import { getDriverVerificationStatus } from "@/lib/actions/driver-verification";
import prisma from "@/lib/db";
import { auth } from "@/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  CalendarPlus,
  Car,
  IndianRupee,
  Users,
  Menu,
  Bell,
  MessageSquare,
  Settings,
  Home,
} from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import BottomTabs from "@/components/BottomTabs";

const layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();
  const user = session?.user;
  const driver = await prisma.user.findUnique({
    where: {
      id: user!.id,
    },
  });

  // If driver is not verified, redirect based on their status
  if (!driver?.isVerified) {
    console.log("Redirecting to drivers onboarding page");
    redirect("/drivers/onboarding");
  }

  return (
    <div className="min-h-screen w-full max-w-sm mx-auto bg-gray-50">
      {/* Header with Drawer Trigger - Available on all pages */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Menu className="h-6 w-6" />
                </Button>
              </DrawerTrigger>
              <DrawerContent className="max-h-[85vh]">
                <DrawerHeader className="text-left">
                  <DrawerTitle className="text-xl font-bold">
                    Driver Menu
                  </DrawerTitle>
                  <DrawerDescription>
                    Access all your driver features and settings
                  </DrawerDescription>
                </DrawerHeader>

                <div className="px-4 pb-6 space-y-4">
                  {/* Profile Section */}
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-blue-500 text-white">
                        {driver?.name?.charAt(0) || "D"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {driver?.name || "Driver"}
                      </p>
                      <p className="text-sm text-gray-500">Driver</p>
                    </div>
                  </div>

                  {/* Navigation Items */}
                  <div className="space-y-2">
                    <DrawerClose asChild>
                      <Link href="/drivers">
                        <Button
                          variant="ghost"
                          className="w-full justify-start h-12 text-left"
                        >
                          <Home className="h-5 w-5 mr-3" />
                          Dashboard
                        </Button>
                      </Link>
                    </DrawerClose>

                    <DrawerClose asChild>
                      <Link href="/drivers/trips/new">
                        <Button
                          variant="ghost"
                          className="w-full justify-start h-12 text-left"
                        >
                          <CalendarPlus className="h-5 w-5 mr-3" />
                          Schedule a Ride
                        </Button>
                      </Link>
                    </DrawerClose>

                    <DrawerClose asChild>
                      <Link href="/drivers/trips">
                        <Button
                          variant="ghost"
                          className="w-full justify-start h-12 text-left"
                        >
                          <Car className="h-5 w-5 mr-3" />
                          Manage Rides
                        </Button>
                      </Link>
                    </DrawerClose>

                    <DrawerClose asChild>
                      <Link href="/drivers/bookings">
                        <Button
                          variant="ghost"
                          className="w-full justify-start h-12 text-left"
                        >
                          <Users className="h-5 w-5 mr-3" />
                          Booking Requests
                        </Button>
                      </Link>
                    </DrawerClose>

                    <DrawerClose asChild>
                      <Link href="/drivers/earnings">
                        <Button
                          variant="ghost"
                          className="w-full justify-start h-12 text-left"
                        >
                          <IndianRupee className="h-5 w-5 mr-3" />
                          View Earnings
                        </Button>
                      </Link>
                    </DrawerClose>

                    <DrawerClose asChild>
                      <Link href="/drivers/messages">
                        <Button
                          variant="ghost"
                          className="w-full justify-start h-12 text-left"
                        >
                          <MessageSquare className="h-5 w-5 mr-3" />
                          Messages
                        </Button>
                      </Link>
                    </DrawerClose>

                    <DrawerClose asChild>
                      <Link href="/drivers/account">
                        <Button
                          variant="ghost"
                          className="w-full justify-start h-12 text-left"
                        >
                          <Settings className="h-5 w-5 mr-3" />
                          Account Settings
                        </Button>
                      </Link>
                    </DrawerClose>
                  </div>
                </div>
              </DrawerContent>
            </Drawer>

            <div>
              <h1 className="text-lg font-bold text-gray-900">Maazi Ride</h1>
              <p className="text-xs text-gray-500">Driver Portal</p>
            </div>
          </div>

          <Button variant="ghost" size="icon" className="rounded-full relative">
            <Bell className="h-6 w-6" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-red-500">
              3
            </Badge>
          </Button>
        </div>
      </div>

      <main className="flex-1 pb-20">{children}</main>

      {/* Bottom Tabs Navigation */}
      <BottomTabs />
    </div>
  );
};

export default layout;
