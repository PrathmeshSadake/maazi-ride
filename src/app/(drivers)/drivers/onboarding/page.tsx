import { requireRole } from "@/lib/auth";
import { currentUser } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { RoleManager } from "@/components/RoleManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

// Admin verification API endpoint (protected by role in the middleware)
async function verifyDriverAccount(userId: string) {
  "use server";

  // Only admins will be able to call this in a real implementation
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-driver?userId=${userId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return response.json();
}

export default async function DriverOnboarding() {
  // Ensure the user has the driver role
  const { userId } = await requireRole("driver");

  // Get the current user to check their verification status
  const user = await currentUser();

  // Extract verification status from metadata
  const isVerified = (user?.publicMetadata?.isVerified as boolean) || false;

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-3xl font-bold mb-2'>Driver Onboarding</h1>

        {isVerified ? (
          <div className='bg-green-50 border border-green-200 rounded-lg p-6 mb-8'>
            <h2 className='text-xl font-semibold text-green-800 mb-2'>
              Your account is verified!
            </h2>
            <p className='text-green-700 mb-4'>
              You can now start offering rides on the platform.
            </p>
            <Link href='/drivers'>
              <Button>Go to Driver Dashboard</Button>
            </Link>
          </div>
        ) : (
          <div className='bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8'>
            <h2 className='text-xl font-semibold text-amber-800 mb-2'>
              Your account needs verification
            </h2>
            <p className='text-amber-700 mb-4'>
              Complete the steps below to get verified as a driver.
            </p>
          </div>
        )}

        <Tabs defaultValue='documents' className='w-full'>
          <TabsList className='grid w-full grid-cols-3 mb-8'>
            <TabsTrigger value='documents'>Documents</TabsTrigger>
            <TabsTrigger value='vehicle'>Vehicle</TabsTrigger>
            <TabsTrigger value='verification'>Verification</TabsTrigger>
          </TabsList>

          <TabsContent value='documents'>
            <Card>
              <CardHeader>
                <CardTitle>Upload Required Documents</CardTitle>
                <CardDescription>
                  These documents are required for driver verification. All
                  files must be clear and legible.
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='border rounded-lg p-4'>
                  <h3 className='font-medium mb-2'>Driver's License</h3>
                  <p className='text-sm text-gray-500 mb-4'>
                    Upload a photo of your valid driver's license (front and
                    back)
                  </p>
                  <Button variant='outline'>Upload License</Button>
                </div>

                <div className='border rounded-lg p-4'>
                  <h3 className='font-medium mb-2'>Vehicle Registration</h3>
                  <p className='text-sm text-gray-500 mb-4'>
                    Upload the vehicle registration document
                  </p>
                  <Button variant='outline'>Upload Registration</Button>
                </div>

                <div className='border rounded-lg p-4'>
                  <h3 className='font-medium mb-2'>Insurance Document</h3>
                  <p className='text-sm text-gray-500 mb-4'>
                    Upload proof of valid insurance coverage
                  </p>
                  <Button variant='outline'>Upload Insurance</Button>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant='default'>Save and Continue</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value='vehicle'>
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Information</CardTitle>
                <CardDescription>
                  Provide details about the vehicle you'll be using
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className='space-y-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <label className='text-sm font-medium'>Make</label>
                      <input
                        type='text'
                        className='w-full p-2 border rounded-md'
                        placeholder='e.g. Toyota'
                      />
                    </div>
                    <div className='space-y-2'>
                      <label className='text-sm font-medium'>Model</label>
                      <input
                        type='text'
                        className='w-full p-2 border rounded-md'
                        placeholder='e.g. Camry'
                      />
                    </div>
                    <div className='space-y-2'>
                      <label className='text-sm font-medium'>Year</label>
                      <input
                        type='number'
                        className='w-full p-2 border rounded-md'
                        placeholder='e.g. 2019'
                      />
                    </div>
                    <div className='space-y-2'>
                      <label className='text-sm font-medium'>Color</label>
                      <input
                        type='text'
                        className='w-full p-2 border rounded-md'
                        placeholder='e.g. Silver'
                      />
                    </div>
                    <div className='space-y-2'>
                      <label className='text-sm font-medium'>
                        License Plate
                      </label>
                      <input
                        type='text'
                        className='w-full p-2 border rounded-md'
                        placeholder='e.g. ABC123'
                      />
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter>
                <Button variant='default'>Save Vehicle Information</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value='verification'>
            <Card>
              <CardHeader>
                <CardTitle>Verification Status</CardTitle>
                <CardDescription>
                  Track your verification progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-6'>
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <h3 className='font-medium'>Documents Submission</h3>
                      <span className='px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800'>
                        Incomplete
                      </span>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-2.5'>
                      <div className='bg-amber-400 h-2.5 rounded-full w-0'></div>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <h3 className='font-medium'>Vehicle Information</h3>
                      <span className='px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800'>
                        Incomplete
                      </span>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-2.5'>
                      <div className='bg-amber-400 h-2.5 rounded-full w-0'></div>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <h3 className='font-medium'>Admin Verification</h3>
                      <span className='px-2 py-1 text-xs rounded-full bg-red-100 text-red-800'>
                        Pending
                      </span>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-2.5'>
                      <div className='bg-red-400 h-2.5 rounded-full w-0'></div>
                    </div>
                  </div>

                  <div className='p-4 border rounded-lg bg-gray-50'>
                    <h3 className='font-medium mb-2'>Overall Status</h3>
                    <div className='flex items-center gap-2'>
                      <div className='w-3 h-3 rounded-full bg-amber-500'></div>
                      <p>
                        Your application is incomplete. Please complete all
                        required steps.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className='flex justify-between'>
                <div>
                  <RoleManager showSwitcher={false} />
                </div>
                <Button variant='outline'>Contact Support</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
