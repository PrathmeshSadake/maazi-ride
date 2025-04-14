"use client";

import React, { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { TimePicker } from "@/components/ui/time-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SourceProvider, SourceContext } from "@/context/source-context";
import {
  DestinationProvider,
  DestinationContext,
} from "@/context/destination-context";
import LocationInput from "@/components/drivers/location-input";
import GoogleMapsSection from "@/components/drivers/google-maps-section";
import {
  DollarSign,
  Users,
  Calendar as CalendarIcon,
  IndianRupee,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { toast } from "sonner";

const ScheduleRideForm = () => {
  const router = useRouter();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState("09:00");
  const [price, setPrice] = useState("");
  const [seats, setSeats] = useState("4");
  const [description, setDescription] = useState("");
  const [distance, setDistance] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { source } = useContext(SourceContext);
  const { destination } = useContext(DestinationContext);

  const handleDistanceCalculated = (calculatedDistance: string) => {
    setDistance(calculatedDistance);
    // Auto-calculate a suggested price based on distance
    const suggestedPrice = (parseFloat(calculatedDistance) * 10.5).toFixed(2);
    if (!price) {
      setPrice(suggestedPrice);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      toast.error("Please select a departure date");
      return;
    }

    if (!source) {
      toast.error("Please select a pickup location");
      return;
    }

    if (!destination) {
      toast.error("Please select a dropoff location");
      return;
    }

    // Log the location data for debugging
    console.log("Source location:", source);
    console.log("Destination location:", destination);

    setIsSubmitting(true);

    try {
      // Convert location objects to the expected format for the API
      const fromLocationData = {
        lat: source.lat,
        lng: source.lng,
        name: source.name || "",
        label: source.label || "",
      };

      const toLocationData = {
        lat: destination.lat,
        lng: destination.lng,
        name: destination.name || "",
        label: destination.label || "",
      };

      // Log the data being sent to the API
      console.log("Sending to API:", {
        fromLocation: fromLocationData,
        toLocation: toLocationData,
        departureDate: date,
        departureTime: time,
        price: parseFloat(price),
        availableSeats: parseInt(seats),
        description,
      });

      const response = await fetch("/api/rides", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromLocation: fromLocationData,
          toLocation: toLocationData,
          departureDate: date,
          departureTime: time,
          price: parseFloat(price),
          availableSeats: parseInt(seats),
          description,
        }),
      });

      if (response.ok) {
        toast.success("Ride scheduled successfully!");
        router.push("/drivers/trips");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to schedule ride");
      }
    } catch (error) {
      toast.error("An error occurred while scheduling the ride");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold mb-8'>Schedule a Ride</h1>

      <form onSubmit={handleSubmit}>
        <div className='grid grid-cols-1 gap-6'>
          <div className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>Route Details</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-4'>
                  <div>
                    <Label htmlFor='fromLocation'>Pickup Location</Label>
                    <div id='fromLocation'>
                      <LocationInput
                        placeholder='Enter pickup location'
                        type='source'
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor='toLocation'>Dropoff Location</Label>
                    <div id='toLocation'>
                      <LocationInput
                        placeholder='Enter dropoff location'
                        type='destination'
                      />
                    </div>
                  </div>
                </div>

                <div className='mt-4'>
                  <GoogleMapsSection
                    onDistanceCalculated={handleDistanceCalculated}
                  />
                  {distance && (
                    <div className='mt-3 text-sm text-gray-600 flex items-center justify-center'>
                      <span className='font-medium'>Estimated distance:</span>
                      <span className='ml-1'>{distance} km</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Schedule & Pricing</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='date'>Departure Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant='outline'
                          className='w-full justify-start text-left font-normal'
                          id='date'
                        >
                          <CalendarIcon className='mr-2 h-4 w-4' />
                          {date ? format(date, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0'>
                        <Calendar
                          mode='single'
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='time'>Departure Time</Label>
                    <div id='time'>
                      <TimePicker value={time} onChange={setTime} />
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='price'>Price (INR)</Label>
                    <div className='relative'>
                      <IndianRupee className='absolute left-3 top-3 h-4 w-4 text-gray-500' />
                      <Input
                        id='price'
                        placeholder='0.00'
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        type='number'
                        step='0.01'
                        min='0'
                        className='pl-10'
                        required
                      />
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='seats'>Available Seats</Label>
                    <div className='relative'>
                      <Users className='absolute left-3 top-3 h-4 w-4 text-gray-500' />
                      <Input
                        id='seats'
                        placeholder='4'
                        value={seats}
                        onChange={(e) => setSeats(e.target.value)}
                        type='number'
                        min='1'
                        max='10'
                        className='pl-10'
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='description'>Additional Information</Label>
                  <Textarea
                    id='description'
                    placeholder='Add any details about the ride, vehicle, etc.'
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className='sticky top-6'>
              <CardHeader>
                <CardTitle>Ride Summary</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-1'>
                  <p className='text-sm font-medium'>Date & Time</p>
                  <p className='text-lg'>
                    {date ? format(date, "PPP") : "Not selected"} at {time}
                  </p>
                </div>

                <div className='space-y-1'>
                  <p className='text-sm font-medium'>Price</p>
                  <p className='text-lg font-semibold'>INR {price || "0.00"}</p>
                </div>

                <div className='space-y-1'>
                  <p className='text-sm font-medium'>Available Seats</p>
                  <p className='text-lg'>{seats}</p>
                </div>

                {distance && (
                  <div className='space-y-1'>
                    <p className='text-sm font-medium'>Estimated Distance</p>
                    <p className='text-lg'>{distance} km</p>
                  </div>
                )}

                {source && (
                  <div className='space-y-1'>
                    <p className='text-sm font-medium'>From</p>
                    <p className='text-lg'>{source.name || source.label}</p>
                    <p className='text-xs text-gray-500'>
                      Coordinates: {source.lat.toFixed(6)},{" "}
                      {source.lng.toFixed(6)}
                    </p>
                  </div>
                )}

                {destination && (
                  <div className='space-y-1'>
                    <p className='text-sm font-medium'>To</p>
                    <p className='text-lg'>
                      {destination.name || destination.label}
                    </p>
                    <p className='text-xs text-gray-500'>
                      Coordinates: {destination.lat.toFixed(6)},{" "}
                      {destination.lng.toFixed(6)}
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className='flex-col gap-4'>
                <Button
                  className='w-full'
                  size='lg'
                  disabled={isSubmitting}
                  type='submit'
                >
                  {isSubmitting ? "Scheduling..." : "Schedule Ride"}
                </Button>
                <Button
                  variant='outline'
                  className='w-full'
                  type='button'
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

const ScheduleRidePage = () => {
  return (
    <SourceProvider>
      <DestinationProvider>
        <ScheduleRideForm />
      </DestinationProvider>
    </SourceProvider>
  );
};

export default ScheduleRidePage;
