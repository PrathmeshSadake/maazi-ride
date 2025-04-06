import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BellRing,
  ChevronRight,
  Wallet2,
  UserCog,
  Car,
  ShieldAlert,
} from "lucide-react";

export default function ProfilePage() {
  return (
    <div className='space-y-6'>
      {/* Profile Header */}
      <div className='flex items-center gap-4'>
        <Avatar className='h-20 w-20'>
          <AvatarImage src='https://i.pravatar.cc/150?img=32' alt='Profile' />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <div>
          <h2 className='text-2xl font-bold'>John Driver</h2>
          <p className='text-muted-foreground'>Driver since October 2023</p>
          <div className='flex items-center gap-1 mt-1'>
            <div className='flex items-center text-amber-500'>
              {"★".repeat(4)}
              {"☆".repeat(1)}
            </div>
            <span className='text-sm text-muted-foreground'>(4.8)</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue='account' className='w-full'>
        <TabsList className='grid grid-cols-3 mb-4'>
          <TabsTrigger value='account'>Account</TabsTrigger>
          <TabsTrigger value='vehicle'>Vehicle</TabsTrigger>
          <TabsTrigger value='earnings'>Earnings</TabsTrigger>
        </TabsList>

        <TabsContent value='account' className='space-y-4'>
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your account details</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='first-name'>First name</Label>
                  <Input id='first-name' defaultValue='John' />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='last-name'>Last name</Label>
                  <Input id='last-name' defaultValue='Driver' />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <Input id='email' defaultValue='john.driver@example.com' />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='phone'>Phone number</Label>
                <Input id='phone' defaultValue='+1 234 567 8900' />
              </div>

              <Button className='w-full'>Save Changes</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-3'>
              <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div className='space-y-0.5'>
                  <Label htmlFor='notifications'>Push notifications</Label>
                  <p className='text-sm text-muted-foreground'>
                    Receive ride alerts and updates
                  </p>
                </div>
                <Switch id='notifications' defaultChecked />
              </div>

              <div className='flex items-center justify-between'>
                <div className='space-y-0.5'>
                  <Label htmlFor='dark-mode'>Dark mode</Label>
                  <p className='text-sm text-muted-foreground'>
                    Toggle between light and dark
                  </p>
                </div>
                <Switch id='dark-mode' />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='vehicle' className='space-y-4'>
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle>Vehicle Information</CardTitle>
              <CardDescription>Your registered vehicle details</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='make'>Make & Model</Label>
                <Input id='make' defaultValue='Toyota Camry' />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='year'>Year</Label>
                  <Input id='year' defaultValue='2020' />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='color'>Color</Label>
                  <Input id='color' defaultValue='Silver' />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='license'>License Plate</Label>
                <Input id='license' defaultValue='ABC-1234' />
              </div>

              <Button className='w-full'>Update Vehicle</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-3'>
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                Vehicle registration and insurance
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex justify-between items-center p-2 border rounded-md'>
                <div className='flex items-center gap-3'>
                  <Car className='h-5 w-5 text-muted-foreground' />
                  <div>
                    <p className='font-medium'>Vehicle Registration</p>
                    <p className='text-xs text-muted-foreground'>
                      Expires: Dec 15, 2024
                    </p>
                  </div>
                </div>
                <Button variant='ghost' size='icon'>
                  <ChevronRight className='h-4 w-4' />
                </Button>
              </div>

              <div className='flex justify-between items-center p-2 border rounded-md'>
                <div className='flex items-center gap-3'>
                  <ShieldAlert className='h-5 w-5 text-muted-foreground' />
                  <div>
                    <p className='font-medium'>Insurance Document</p>
                    <p className='text-xs text-muted-foreground'>
                      Expires: Aug 30, 2024
                    </p>
                  </div>
                </div>
                <Button variant='ghost' size='icon'>
                  <ChevronRight className='h-4 w-4' />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='earnings' className='space-y-4'>
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle>Earnings Summary</CardTitle>
              <CardDescription>Your earnings history and stats</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='grid grid-cols-3 gap-4 text-center'>
                  <div className='bg-muted p-3 rounded-md'>
                    <p className='text-xs text-muted-foreground'>Today</p>
                    <p className='text-xl font-bold'>$45.50</p>
                  </div>
                  <div className='bg-muted p-3 rounded-md'>
                    <p className='text-xs text-muted-foreground'>This Week</p>
                    <p className='text-xl font-bold'>$328.75</p>
                  </div>
                  <div className='bg-muted p-3 rounded-md'>
                    <p className='text-xs text-muted-foreground'>This Month</p>
                    <p className='text-xl font-bold'>$1,245.50</p>
                  </div>
                </div>

                <div className='h-48 bg-slate-200 rounded-md flex items-center justify-center'>
                  <span className='text-sm text-muted-foreground'>
                    Earnings Chart
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-3'>
              <CardTitle>Payment Methods</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex justify-between items-center p-2 border rounded-md'>
                <div className='flex items-center gap-3'>
                  <Wallet2 className='h-5 w-5 text-muted-foreground' />
                  <div>
                    <p className='font-medium'>Bank Account</p>
                    <p className='text-xs text-muted-foreground'>
                      ••••4567 | Default
                    </p>
                  </div>
                </div>
                <Button variant='ghost' size='icon'>
                  <ChevronRight className='h-4 w-4' />
                </Button>
              </div>

              <Button className='w-full'>Add Payment Method</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
