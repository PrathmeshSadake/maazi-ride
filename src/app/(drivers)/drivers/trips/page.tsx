"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import {
  CalendarPlus,
  Car,
  Clock,
  CircleDollarSign,
  MapPin,
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type Ride = {
  id: string;
  fromLocation: string;
  toLocation: string;
  departureDate: string;
  departureTime: string;
  price: number;
  availableSeats: number;
  status: string;
  bookings: Array<{ id: string; status: string }>;
};

export default function TripsPage() {
  const router = useRouter();
  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const response = await fetch("/api/rides");
        if (response.ok) {
          const data = await response.json();
          setRides(data);
        } else {
          toast.error("Failed to load rides");
        }
      } catch (error) {
        console.error("Error fetching rides:", error);
        toast.error("An error occurred while loading rides");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRides();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING_APPROVAL":
        return (
          <Badge variant='outline' className='bg-yellow-50 text-yellow-700'>
            Pending Approval
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge variant='outline' className='bg-green-50 text-green-700'>
            Approved
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant='outline' className='bg-red-50 text-red-700'>
            Rejected
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge variant='outline' className='bg-blue-50 text-blue-700'>
            Completed
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge variant='outline' className='bg-gray-50 text-gray-700'>
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant='outline'>{status}</Badge>;
    }
  };

  // Filter rides by status

  const approvedRides = rides.filter(
    (ride) => ride.status === "APPROVED" || ride.status === "PENDING_APPROVAL"
  );
  const completedRides = rides.filter((ride) =>
    ["COMPLETED", "CANCELLED"].includes(ride.status)
  );

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-3xl font-bold'>My Scheduled Rides</h1>
        <Link href='/drivers/trips/new'>
          <Button>
            <CalendarPlus className='mr-2 h-4 w-4' />
            Schedule New Ride
          </Button>
        </Link>
      </div>

      <Tabs defaultValue='upcoming' className='w-full'>
        <TabsList className='mb-6'>
          <TabsTrigger value='upcoming'>
            Upcoming ({approvedRides.length})
          </TabsTrigger>

          <TabsTrigger value='completed'>
            Completed ({completedRides.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value='upcoming'>
          {isLoading ? (
            <div className='text-center py-10'>Loading rides...</div>
          ) : approvedRides.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {approvedRides.map((ride) => (
                <RideCard
                  key={ride.id}
                  ride={ride}
                  status={getStatusBadge(ride.status)}
                />
              ))}
            </div>
          ) : (
            <div className='text-center py-10'>
              <p className='text-gray-500 mb-4'>
                You don't have any upcoming rides
              </p>
              <Link href='/drivers/trips/new'>
                <Button>Schedule a ride</Button>
              </Link>
            </div>
          )}
        </TabsContent>

        <TabsContent value='completed'>
          {isLoading ? (
            <div className='text-center py-10'>Loading rides...</div>
          ) : completedRides.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {completedRides.map((ride) => (
                <RideCard
                  key={ride.id}
                  ride={ride}
                  status={getStatusBadge(ride.status)}
                />
              ))}
            </div>
          ) : (
            <div className='text-center py-10'>
              <p className='text-gray-500'>No completed rides</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RideCard({ ride, status }: { ride: Ride; status: React.ReactNode }) {
  return (
    <Card className='h-full'>
      <CardHeader className='pb-2'>
        <div className='flex justify-between items-start'>
          <CardTitle className='text-xl'>
            {ride.fromLocation.split(",")[0]} to {ride.toLocation.split(",")[0]}
          </CardTitle>
          {status}
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex gap-4'>
          <div className='flex items-center gap-2 text-gray-600'>
            <Calendar className='h-4 w-4' />
            <span>{formatDate(ride.departureDate)}</span>
          </div>
          <div className='flex items-center gap-2 text-gray-600'>
            <Clock className='h-4 w-4' />
            <span>{ride.departureTime}</span>
          </div>
        </div>

        <div className='flex items-center gap-2 text-gray-600'>
          <MapPin className='h-4 w-4 text-gray-500' />
          <div className='text-sm'>
            <p className='truncate'>{ride.fromLocation}</p>
            <p className='truncate'>{ride.toLocation}</p>
          </div>
        </div>

        <div className='flex justify-between pt-2'>
          <div className='flex items-center gap-2'>
            <CircleDollarSign className='h-4 w-4 text-gray-500' />
            <span className='font-semibold'>${ride.price.toFixed(2)}</span>
          </div>
          <div className='flex items-center gap-2'>
            <Car className='h-4 w-4 text-gray-500' />
            <span>{ride.availableSeats} seats</span>
          </div>
        </div>

        <div className='pt-2'>
          <Link href={`/drivers/trips/${ride.id}`}>
            <Button variant='outline' className='w-full'>
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function formatDate(dateString: string) {
  try {
    return format(new Date(dateString), "MMM d, yyyy");
  } catch (e) {
    return dateString;
  }
}
