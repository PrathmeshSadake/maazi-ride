"use client";

import { useState } from "react";
import { SignUp } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function SignUpPage() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  // Show role selection screen if role not selected yet
  if (!selectedRole) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-gray-50'>
        <Card className='w-full max-w-md'>
          <CardHeader className='text-center'>
            <CardTitle className='text-2xl font-bold'>
              Join Maazi Ride
            </CardTitle>
            <CardDescription>
              Choose how you want to use Maazi Ride
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <Button
              onClick={() => setSelectedRole("user")}
              className='w-full h-24 text-lg flex flex-col items-center justify-center'
              variant='outline'
            >
              <span className='text-xl font-semibold'>Passenger</span>
              <span className='text-sm text-gray-500'>
                Book rides and travel
              </span>
            </Button>

            <Button
              onClick={() => setSelectedRole("driver")}
              className='w-full h-24 text-lg flex flex-col items-center justify-center'
              variant='outline'
            >
              <span className='text-xl font-semibold'>Driver</span>
              <span className='text-sm text-gray-500'>
                Offer rides and earn
              </span>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // After selecting role, show the SignUp component with appropriate redirects
  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-50'>
      <div className='w-full max-w-md p-4'>
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-bold mb-2'>Create Account</h1>
          <p className='text-gray-600'>
            Sign up as a {selectedRole === "driver" ? "Driver" : "Passenger"}
          </p>
          <button
            onClick={() => setSelectedRole(null)}
            className='mt-2 text-sm text-blue-600 hover:underline'
          >
            Change role
          </button>
          <div className='mt-2 p-3 bg-blue-50 rounded-md text-sm'>
            <p className='font-semibold text-blue-800 mb-1'>
              Selected Role:{" "}
              {selectedRole === "driver" ? "Driver" : "Passenger"}
            </p>
            <p className='text-blue-700'>
              After signing up, your account will be configured as a{" "}
              {selectedRole === "driver" ? "Driver" : "Passenger"}.
              {selectedRole === "driver" &&
                " You'll need to complete verification after registration."}
            </p>
          </div>
        </div>

        <SignUp
          // path='/sign-up'
          // forceRedirectUrl={`/api/auth/role?role=${selectedRole}&redirect=redirect`}
          // signInUrl='/sign-in'
          unsafeMetadata={{
            role: selectedRole,
            isVerified: selectedRole === "user", // Users are verified by default, drivers need verification
          }}
        />
      </div>
    </div>
  );
}
