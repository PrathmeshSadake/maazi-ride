"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Car,
  Search,
  AlertCircle,
  MapPin,
  ArrowUpDown,
  Clock,
  Users,
} from "lucide-react";
import DatePicker from "@/components/users/date-picker";
import { useRouter } from "next/navigation";
import { GoogleMapsAutocomplete } from "@/components/ui/google-maps-autocomplete";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Define Location type to match GoogleMapsAutocomplete component
interface Location {
  name: string;
  lat: number;
  lng: number;
}

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [source, setSource] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Check if both locations are set and form is valid
  useEffect(() => {
    const hasSource = source !== null;
    const hasDestination = destination !== null;

    // Only check for different locations if both are selected
    let hasDifferentLocations = true;
    if (hasSource && hasDestination) {
      hasDifferentLocations = source?.name !== destination?.name;
    }

    const hasDate = selectedDate !== undefined;

    console.log("DEBUG - Form validation:", {
      hasSource,
      hasDestination,
      hasDifferentLocations,
      hasDate,
      source,
      destination,
      selectedDate,
    });

    setIsFormValid(
      hasSource && hasDestination && hasDifferentLocations && hasDate
    );

    // Clear validation errors when input changes
    setValidationError(null);
  }, [source, destination, selectedDate]);

  const handleSearch = () => {
    setIsSubmitting(true);

    // Validate inputs
    if (!source) {
      setValidationError("Please enter a pickup location");
      setIsSubmitting(false);
      return;
    }

    if (!destination) {
      setValidationError("Please enter a destination");
      setIsSubmitting(false);
      return;
    }

    // Double-check that source and destination are not the same
    if (source?.name === destination?.name) {
      setValidationError("Pickup and destination cannot be the same location");
      setIsSubmitting(false);
      return;
    }

    const queryParams = new URLSearchParams();

    if (source) {
      queryParams.append("from", encodeURIComponent(JSON.stringify(source)));
    }

    if (destination) {
      queryParams.append("to", encodeURIComponent(JSON.stringify(destination)));
    }

    if (selectedDate) {
      // Format as YYYY-MM-DD for better compatibility
      const formattedDate = selectedDate.toISOString().split("T")[0];
      console.log("Setting date parameter:", formattedDate);
      queryParams.append("date", formattedDate);
    }

    console.log("Navigation with params:", queryParams.toString());
    router.push(`/explore?${queryParams.toString()}`);
  };

  const swapLocations = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="flex items-center justify-center mb-2">
            <div className="text-white rounded-2xl p-4">
              <img src="/images/logo.png" alt="" className="h-24" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-1">
            Find Your Ride
          </h1>
          <p className="text-center text-gray-600 text-sm">
            Safe, reliable, and affordable rides
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Search Card */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Location Inputs */}
              <div className="relative">
                <div className="space-y-4">
                  <GoogleMapsAutocomplete
                    label="From"
                    placeholder="Enter pickup location"
                    value={source}
                    onChange={setSource}
                  />

                  <GoogleMapsAutocomplete
                    label="To"
                    placeholder="Enter destination"
                    value={destination}
                    onChange={setDestination}
                  />
                </div>

                {/* Swap Button */}
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10">
                  <button
                    onClick={swapLocations}
                    className="bg-white border border-gray-200 rounded-full p-2 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-gray-50"
                    disabled={!source && !destination}
                  >
                    <ArrowUpDown size={16} className="text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Date Picker */}
              <DatePicker
                onDateSelect={(date) => {
                  console.log("HomePage - Date selected:", date);
                  if (date) {
                    setSelectedDate(date);
                  }
                }}
                initialDate={selectedDate}
              />

              {/* Validation Error */}
              {validationError && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100">
                  <AlertCircle
                    size={20}
                    className="flex-shrink-0 mt-0.5 text-red-500"
                  />
                  <span className="text-red-700 text-sm font-medium">
                    {validationError}
                  </span>
                </div>
              )}

              {/* Search Button */}
              <Button
                onClick={handleSearch}
                disabled={isSubmitting || (!isFormValid && !validationError)}
                className={`w-full py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-3 transition-all duration-200 ${
                  isSubmitting
                    ? "bg-blue-400 text-white cursor-not-allowed"
                    : isFormValid
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Searching for rides...
                  </>
                ) : (
                  <>
                    <Search size={20} />
                    Find Available Rides
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-100">
            <div className="bg-blue-100 rounded-full p-2 w-10 h-10 mx-auto mb-2 flex items-center justify-center">
              <Clock size={18} className="text-blue-600" />
            </div>
            <p className="text-xs text-gray-600 font-medium">Quick</p>
            <p className="text-xs text-gray-500">Booking</p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-100">
            <div className="bg-green-100 rounded-full p-2 w-10 h-10 mx-auto mb-2 flex items-center justify-center">
              <Users size={18} className="text-green-600" />
            </div>
            <p className="text-xs text-gray-600 font-medium">Verified</p>
            <p className="text-xs text-gray-500">Drivers</p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-100">
            <div className="bg-purple-100 rounded-full p-2 w-10 h-10 mx-auto mb-2 flex items-center justify-center">
              <MapPin size={18} className="text-purple-600" />
            </div>
            <p className="text-xs text-gray-600 font-medium">Live</p>
            <p className="text-xs text-gray-500">Tracking</p>
          </div>
        </div>
      </div>
    </div>
  );
}
