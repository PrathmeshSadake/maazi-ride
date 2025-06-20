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
import {
  Users,
  Calendar as CalendarIcon,
  IndianRupee,
  ArrowLeft,
  MapPin,
  Navigation,
  Clock,
  DollarSign,
} from "lucide-react";
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white">
        <div className="flex items-center px-4 pt-8 pb-4">
          <button
            onClick={() => router.push("/drivers/trips")}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">
            Create New Trip
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-6 space-y-3">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Route Details Card */}
          <div className="bg-white rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <MapPin className="w-3 h-3 text-blue-600" />
                </div>
                <h2 className="text-base font-semibold text-gray-900">
                  Route Details
                </h2>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <GoogleMapsAutocomplete
                  label="Pickup Location"
                  placeholder="Enter pickup location"
                  value={source}
                  onChange={setSource}
                />
              </div>

              <div className="space-y-2">
                <GoogleMapsAutocomplete
                  label="Dropoff Location"
                  placeholder="Enter dropoff location"
                  value={destination}
                  onChange={setDestination}
                />
              </div>

              {source && destination && (
                <div className="mt-3">
                  <GoogleMapsPreview
                    source={source}
                    destination={destination}
                    className="rounded-lg overflow-hidden"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Date & Time Card */}
          <div className="bg-white rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <Clock className="w-3 h-3 text-purple-600" />
                </div>
                <h2 className="text-base font-semibold text-gray-900">
                  Schedule
                </h2>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Departure Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
                      <div className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-3 text-gray-500" />
                        <span
                          className={date ? "text-gray-900" : "text-gray-500"}
                        >
                          {date ? format(date, "PPP") : "Select departure date"}
                        </span>
                      </div>
                    </button>
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
                <label className="text-sm font-medium text-gray-700">
                  Departure Time
                </label>
                <TimePicker value={time} onChange={setTime} />
              </div>
            </div>
          </div>

          {/* Pricing & Seats Card */}
          <div className="bg-white rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <DollarSign className="w-3 h-3 text-green-600" />
                </div>
                <h2 className="text-base font-semibold text-gray-900">
                  Pricing & Capacity
                </h2>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Price (INR)
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                    <input
                      type="number"
                      placeholder="0.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Available Seats
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                    <input
                      type="number"
                      placeholder="1"
                      value={seats}
                      onChange={(e) => setSeats(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      min="1"
                      max="10"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Options Card */}
          <div className="bg-white rounded-xl overflow-hidden">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">
                    Accept Booking Requests
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Users can request to book this ride and you'll approve each
                    request
                  </p>
                </div>
                <Switch
                  checked={isScheduled}
                  onCheckedChange={setIsScheduled}
                />
              </div>
            </div>
          </div>

          {/* Description Card */}
          <div className="bg-white rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">
                Additional Details
              </h2>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Description (Optional)
                </label>
                <textarea
                  placeholder="Add any additional details about your ride..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={() => router.push("/drivers/trips")}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 active:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 active:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Trip"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ScheduleRidePage = () => {
  return <ScheduleRideForm />;
};

export default ScheduleRidePage;
