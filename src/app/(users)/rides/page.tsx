"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  MapPin,
  Calendar,
  Clock,
  IndianRupee,
  Car,
  Search,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PhoneNumberDialog } from "@/components/ui/phone-number-dialog";
import { toast } from "sonner";

interface Driver {
  id: string;
  firstName: string | null;
  lastName: string | null;
  driverRating: number | null;
  ridesCompleted: number;
}

interface Booking {
  id: string;
  status: string;
}

interface Ride {
  id: string;
  driverId: string;
  driver: Driver;
  fromLocation: string;
  toLocation: string;
  departureDate: string;
  departureTime: string;
  price: number;
  availableSeats: number;
  bookings: Booking[];
}

export default function RidesPage() {
  const router = useRouter();
  const [rides, setRides] = useState<Ride[]>([]);
  const [filteredRides, setFilteredRides] = useState<Ride[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [phoneDialogOpen, setPhoneDialogOpen] = useState(false);
  const [currentRideId, setCurrentRideId] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const response = await fetch("/api/rides");
        if (response.ok) {
          const data = await response.json();
          setRides(data);
          setFilteredRides(data);
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

    const fetchUserProfile = async () => {
      try {
        const response = await fetch("/api/users/me");
        if (response.ok) {
          const userData = await response.json();
          setUserPhone(userData.phone);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchRides();
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredRides(rides);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = rides.filter(
      (ride) =>
        ride.fromLocation.toLowerCase().includes(query) ||
        ride.toLocation.toLowerCase().includes(query)
    );

    setFilteredRides(filtered);
  }, [searchQuery, rides]);

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMM d, yyyy");
    } catch (e) {
      console.error("Error formatting date:", e, dateString);
      return dateString;
    }
  };

  const handleApplyForRide = async (rideId: string) => {
    // Check if user has phone number
    if (!userPhone) {
      // Show dialog to collect phone number
      setCurrentRideId(rideId);
      setPhoneDialogOpen(true);
      return;
    }

    // User has phone number, proceed with booking
    await submitBooking(rideId, userPhone);
  };

  const submitBooking = async (rideId: string, phoneNumber: string) => {
    setIsBooking(true);
    console.log("Submitting booking with phone number:", phoneNumber);
    try {
      const requestBody = {
        rideId,
        numSeats: 1,
        phoneNumber,
      };
      console.log("Request body:", requestBody);

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        toast.success("Ride request sent to the driver!");
        // Refresh the rides list to show updated status
        const updatedResponse = await fetch("/api/rides");
        if (updatedResponse.ok) {
          const data = await updatedResponse.json();
          setRides(data);
          setFilteredRides(
            data.filter(
              (ride: Ride) =>
                ride.fromLocation
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
                ride.toLocation
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase())
            )
          );
        }
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to apply for ride");
      }
    } catch (error) {
      console.error("Error applying for ride:", error);
      toast.error("An error occurred while applying for the ride");
    } finally {
      setIsBooking(false);
      setPhoneDialogOpen(false);
      setCurrentRideId(null);
    }
  };

  const handlePhoneSubmit = (phoneNumber: string) => {
    if (currentRideId) {
      submitBooking(currentRideId, phoneNumber);
    }
  };

  // Helper function to check if user has already applied for the ride
  const hasApplied = (ride: Ride) => {
    return ride.bookings && ride.bookings.length > 0;
  };

  // Helper function to get booking status
  const getBookingStatus = (ride: Ride) => {
    if (!ride.bookings || !ride.bookings.length) return null;
    return ride.bookings[0].status;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Link href="/" className="mr-4">
          <Button variant="ghost" size="icon">
            <ChevronLeft size={20} />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Scheduled Rides</h1>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search by location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading rides...</div>
      ) : filteredRides.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {filteredRides.map((ride) => (
            <Card key={ride.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold">
                      {ride.fromLocation} to {ride.toLocation}
                    </h2>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(ride.departureDate)}
                      </div>
                      <div className="mx-2">•</div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {ride.departureTime}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-lg font-bold text-green-700">
                      <IndianRupee className="h-4 w-4 mr-1" />
                      {ride.price}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Car className="h-4 w-4 mr-1" />
                      {ride.availableSeats} seats available
                    </div>
                  </div>
                </div>

                <div className="flex items-center mb-4">
                  <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <div className="text-sm font-medium">
                      {ride.fromLocation}
                    </div>
                    <div className="text-sm text-gray-500">
                      {ride.toLocation}
                    </div>
                  </div>
                </div>

                <div className="flex items-center mb-2">
                  <div className="flex items-center mr-4">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                      {ride.driver.firstName?.charAt(0) || ""}
                      {ride.driver.lastName?.charAt(0) || ""}
                    </div>
                    <div className="ml-2">
                      <div className="text-sm font-medium">
                        {ride.driver.firstName} {ride.driver.lastName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {ride.driver.ridesCompleted} rides
                      </div>
                    </div>
                  </div>
                  {ride.driver.driverRating && (
                    <Badge variant="outline" className="ml-auto bg-yellow-50">
                      ★ {ride.driver.driverRating.toFixed(1)}
                    </Badge>
                  )}
                </div>
              </CardContent>

              <CardFooter className="px-6 py-4 bg-gray-50 flex justify-between">
                <Link href={`/rides/${ride.id}`}>
                  <Button variant="outline">View Details</Button>
                </Link>

                {hasApplied(ride) ? (
                  <Badge
                    variant={
                      getBookingStatus(ride) === "PENDING"
                        ? "outline"
                        : getBookingStatus(ride) === "CONFIRMED"
                        ? "default"
                        : "destructive"
                    }
                    className={
                      getBookingStatus(ride) === "PENDING"
                        ? "bg-yellow-50 text-yellow-800"
                        : getBookingStatus(ride) === "CONFIRMED"
                        ? "bg-green-50 text-green-800"
                        : "bg-red-50 text-red-800"
                    }
                  >
                    {getBookingStatus(ride) === "PENDING"
                      ? "Request Pending"
                      : getBookingStatus(ride) === "CONFIRMED"
                      ? "Request Approved"
                      : "Request Rejected"}
                  </Badge>
                ) : (
                  <Button
                    onClick={() => handleApplyForRide(ride.id)}
                    disabled={isBooking}
                  >
                    {isBooking ? "Applying..." : "Apply for Ride"}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">No rides found</p>
        </div>
      )}

      <PhoneNumberDialog
        open={phoneDialogOpen}
        onOpenChange={setPhoneDialogOpen}
        onSubmit={handlePhoneSubmit}
        isLoading={isBooking}
      />
    </div>
  );
}
