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
import { GoogleMapsAutocomplete } from "@/components/ui/google-maps-autocomplete";
import { GoogleMapsPreview } from "@/components/ui/google-maps-preview";
import { Users, Calendar as CalendarIcon, IndianRupee } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

interface Location {
  name: string;
  lat: number;
  lng: number;
}

const ScheduleRideForm = () => {
  const router = useRouter();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState("09:00");
  const [price, setPrice] = useState("");
  const [seats, setSeats] = useState("4");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [source, setSource] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);

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
      const response = await fetch("/api/rides", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromLocation: source.name,
          fromLatitude: source.lat,
          fromLongitude: source.lng,
          toLocation: destination.name,
          toLatitude: destination.lat,
          toLongitude: destination.lng,
          departureDate: date,
          departureTime: time,
          price: parseFloat(price),
          availableSeats: parseInt(seats),
          description,
          isScheduled,
        }),
      });

      if (response.ok) {
        toast.success(
          isScheduled
            ? "Ride scheduled successfully!"
            : "Ride created successfully!"
        );
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
    <div className="container mx-auto px-4 py-8 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Schedule a Ride</h1>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Route Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <GoogleMapsAutocomplete
                label="Dropoff Location"
                placeholder="Enter dropoff location"
                value={source}
                onChange={setSource}
              />

              <GoogleMapsAutocomplete
                label="Dropoff Location"
                placeholder="Enter dropoff location"
                value={destination}
                onChange={setDestination}
              />

              {source && destination && (
                <GoogleMapsPreview
                  source={source}
                  destination={destination}
                  className="mt-4"
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Schedule & Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Departure Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                        id="date"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Departure Time</Label>
                  <div id="time">
                    <TimePicker value={time} onChange={setTime} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (INR)</Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="price"
                      placeholder="0.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      type="number"
                      className="pl-10"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seats">Available Seats</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="seats"
                      placeholder="1"
                      value={seats}
                      onChange={(e) => setSeats(e.target.value)}
                      type="number"
                      className="pl-10"
                      min="1"
                      max="10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="isScheduled">Schedule for booking</Label>
                  <Switch
                    id="isScheduled"
                    checked={isScheduled}
                    onCheckedChange={setIsScheduled}
                  />
                </div>
                <p className="text-sm text-gray-500">
                  When enabled, users can request to book this ride and you'll
                  need to approve each request.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Add any additional details about your ride..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/drivers/trips")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Scheduling..." : "Schedule Ride"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

const ScheduleRidePage = () => {
  return <ScheduleRideForm />;
};

export default ScheduleRidePage;
