"use client";

import { useUser } from "@clerk/nextjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        Loading...
      </div>
    );
  }

  return (
    <div className='container mx-auto py-8 px-4'>
      <h1 className='text-3xl font-bold mb-8'>Admin Dashboard</h1>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Drivers</CardTitle>
            <CardDescription>Manage all drivers</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className='w-full'>View All Drivers</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>Manage all users</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className='w-full'>View All Users</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rides</CardTitle>
            <CardDescription>Manage all rides</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className='w-full'>View All Rides</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>View platform analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className='w-full'>View Analytics</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Manage platform settings</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className='w-full'>Manage Settings</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
