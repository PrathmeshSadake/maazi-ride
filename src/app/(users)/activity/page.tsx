"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Ride = {
  id: string;
  driver: {
    id: string;
    name: string;
    avatar: string;
  };
  route: {
    from: string;
    to: string;
  };
  date: string;
  time: string;
  price: number;
  status: "upcoming" | "completed" | "cancelled";
};

export default function ActivityPage() {
  const rides: Ride[] = [
    {
      id: "1",
      driver: {
        id: "101",
        name: "Amanda H",
        avatar: "/avatars/amanda.png",
      },
      route: {
        from: "San Francisco",
        to: "Los Angeles",
      },
      date: "FEB 20",
      time: "9:04 M",
      price: 35,
      status: "upcoming",
    },
    {
      id: "2",
      driver: {
        id: "102",
        name: "Daniel K",
        avatar: "/avatars/daniel.png",
      },
      route: {
        from: "San Francisco",
        to: "Los Angeles",
      },
      date: "OCT 15",
      time: "11:39 AM",
      price: 28,
      status: "completed",
    },
  ];

  const upcomingRides = rides.filter((ride) => ride.status === "upcoming");
  const pastRides = rides.filter(
    (ride) => ride.status === "completed" || ride.status === "cancelled"
  );

  return (
    <div className='p-4 max-w-md mx-auto'>
      <h1 className='text-3xl font-bold mb-6'>Your rides</h1>

      <Tabs defaultValue='upcoming' className='w-full'>
        <TabsList className='grid w-full grid-cols-2 mb-6'>
          <TabsTrigger value='upcoming'>Upcoming</TabsTrigger>
          <TabsTrigger value='past'>Past</TabsTrigger>
        </TabsList>

        <TabsContent value='upcoming' className='space-y-4'>
          {upcomingRides.map((ride) => (
            <div key={ride.id} className='border-b border-gray-200 pb-4'>
              <div className='flex items-start'>
                <div className='mr-3'>
                  <div className='text-sm font-medium text-gray-500'>
                    {ride.date}
                  </div>
                </div>
                <div className='flex-1'>
                  <div className='flex items-center mb-2'>
                    <div className='mr-3 w-10 h-10 rounded-full bg-gray-200 overflow-hidden'>
                      <div className='w-full h-full flex items-center justify-center bg-green-100 text-green-800 font-bold'>
                        {ride.driver.name.charAt(0)}
                      </div>
                    </div>
                    <div className='flex-1'>
                      <div className='flex justify-between'>
                        <div>
                          <div className='font-medium'>Uppgining</div>
                          <div className='text-gray-600'>
                            {ride.driver.name}
                          </div>
                        </div>
                        <div className='text-right'>
                          <div className='font-medium'>${ride.price}</div>
                        </div>
                      </div>
                      <div className='text-gray-500'>{ride.route.to}</div>
                    </div>
                  </div>
                  <div className='pl-12 text-gray-600'>{ride.time}</div>
                </div>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value='past' className='space-y-4'>
          {pastRides.map((ride) => (
            <div key={ride.id} className='border-b border-gray-200 pb-4'>
              <div className='flex items-start'>
                <div className='mr-3'>
                  <div className='text-sm font-medium text-gray-500'>
                    {ride.date}
                  </div>
                </div>
                <div className='flex-1'>
                  <div className='flex items-center mb-2'>
                    <div className='mr-3 w-10 h-10 rounded-full bg-gray-200 overflow-hidden'>
                      <div className='w-full h-full flex items-center justify-center bg-green-100 text-green-800 font-bold'>
                        {ride.driver.name.charAt(0)}
                      </div>
                    </div>
                    <div className='flex-1'>
                      <div className='flex justify-between'>
                        <div>
                          <div className='font-medium'>{ride.driver.name}</div>
                        </div>
                        <div className='text-right'>
                          <div className='font-medium'>
                            <span className='mr-1'>${ride.price}</span>
                            <span className='line-through text-gray-400'>
                              ${ride.price}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className='text-gray-500'>{ride.route.to}</div>
                    </div>
                  </div>
                  <div className='pl-12 text-gray-600'>{ride.time}</div>
                </div>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
