"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DriverOnboarding() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    vehicleType: "",
    vehicleNumber: "",
    licenseNumber: "",
  });

  if (!isLoaded) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        Loading...
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Update user metadata
      await user?.update({
        publicMetadata: {
          ...user.publicMetadata,
          role: "driver",
          onboardingComplete: true,
          fullName: formData.fullName,
          vehicleType: formData.vehicleType,
          vehicleNumber: formData.vehicleNumber,
          licenseNumber: formData.licenseNumber,
        },
      });

      // Redirect to driver dashboard
      router.push("/drivers");
    } catch (error) {
      console.error("Error updating user data:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-50'>
      <Card className='w-full max-w-md shadow-lg'>
        <CardHeader>
          <CardTitle className='text-2xl font-bold'>
            Driver Onboarding
          </CardTitle>
          <CardDescription>
            Complete your profile to get started as a driver
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='fullName'>Full Name</Label>
              <Input
                id='fullName'
                name='fullName'
                placeholder='Enter your full name'
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='vehicleType'>Vehicle Type</Label>
              <Input
                id='vehicleType'
                name='vehicleType'
                placeholder='Car, Bike, etc.'
                value={formData.vehicleType}
                onChange={handleChange}
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='vehicleNumber'>Vehicle Number</Label>
              <Input
                id='vehicleNumber'
                name='vehicleNumber'
                placeholder='Enter your vehicle number'
                value={formData.vehicleNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='licenseNumber'>License Number</Label>
              <Input
                id='licenseNumber'
                name='licenseNumber'
                placeholder='Enter your license number'
                value={formData.licenseNumber}
                onChange={handleChange}
                required
              />
            </div>
          </CardContent>

          <CardFooter>
            <Button type='submit' className='w-full' disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Complete Onboarding"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
