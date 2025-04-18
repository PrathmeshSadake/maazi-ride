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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { source, setSource } = useContext(SourceContext);
  const { destination, setDestination } = useContext(DestinationContext);

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

    setIsSubmitting(true);

    try {
      // Convert location objects to the expected format for the API
      const fromLocationData = {
        name: source.name || "",
      };

      const toLocationData = {
        name: destination.name || "",
      };

      const response = await fetch("/api/rides", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromLocation: fromLocationData.name,
          toLocation: toLocationData.name,
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
                      <Select 
                        onValueChange={(value) => {
                          const locationData = { name: value };
                          const element = document.getElementById("fromLocation");
                          if (element) {
                            element.setAttribute("data-location", value);
                          }
                          setSource(locationData);
                        }} 
                        value={source?.name || undefined}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Enter pickup location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem 
                            value="Paithan" 
                            disabled={destination?.name === "Paithan"}
                          >
                            Paithan
                          </SelectItem>
                          <SelectItem 
                            value="Pune" 
                            disabled={destination?.name === "Pune"}
                          >
                            Pune
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor='toLocation'>Dropoff Location</Label>
                    <div id='toLocation'>
                      <Select 
                        onValueChange={(value) => {
                          const locationData = { name: value };
                          const element = document.getElementById("toLocation");
                          if (element) {
                            element.setAttribute("data-location", value);
                          }
                          setDestination(locationData);
                        }} 
                        value={destination?.name || undefined}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Enter dropoff location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem 
                            value="Paithan" 
                            disabled={source?.name === "Paithan"}
                          >
                            Paithan
                          </SelectItem>
                          <SelectItem 
                            value="Pune" 
                            disabled={source?.name === "Pune"}
                          >
                            Pune
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
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

                {source && (
                  <div className='space-y-1'>
                    <p className='text-sm font-medium'>From</p>
                    <p className='text-lg'>{source.name}</p>
                  </div>
                )}

                {destination && (
                  <div className='space-y-1'>
                    <p className='text-sm font-medium'>To</p>
                    <p className='text-lg'>{destination.name}</p>
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
