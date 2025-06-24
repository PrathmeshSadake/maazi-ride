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
  ArrowRight,
} from "lucide-react";
import DatePicker from "@/components/users/date-picker";
import { useRouter } from "next/navigation";
import { GoogleMapsAutocomplete } from "@/components/ui/google-maps-autocomplete";
import { Button } from "@/components/ui/button";
import Image from "next/image";

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
  const [numberOfSeats, setNumberOfSeats] = useState<number>(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSeatSelector, setShowSeatSelector] = useState(false);
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
      numberOfSeats,
    });

    setIsFormValid(
      hasSource &&
        hasDestination &&
        hasDifferentLocations &&
        hasDate &&
        numberOfSeats > 0
    );

    // Clear validation errors when input changes
    setValidationError(null);
  }, [source, destination, selectedDate, numberOfSeats]);

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
      // Format as ISO string for better compatibility
      const formattedDate = selectedDate.toISOString();
      console.log("Setting date parameter:", formattedDate);
      queryParams.append("date", formattedDate);
    }

    if (numberOfSeats > 0) {
      queryParams.append("seats", numberOfSeats.toString());
    }

    console.log("Navigation with params:", queryParams.toString());
    router.push(`/explore?${queryParams.toString()}`);

    // Reset submitting state after navigation
    setIsSubmitting(false);
  };

  const swapLocations = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="px-4 pt-8 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Find Your Ride
              </h1>
              <p className="text-sm text-gray-600">
                Safe, reliable, and affordable rides
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative w-full max-h-[200px] aspect-video">
        <Image src="/images/car.svg" alt="" className="" fill />
      </div>

      {/* Main Content */}
      <div className="px-4 pb-6 space-y-4 -mt-4">
        {/* Search Card */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              Plan Your Journey
            </h2>
          </div>
          <div className="p-4 space-y-4">
            {/* Location Inputs */}
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Pickup Location
                </label>
                <GoogleMapsAutocomplete
                  label=""
                  placeholder="Enter pickup location"
                  value={source}
                  onChange={setSource}
                />
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <button
                  onClick={swapLocations}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 active:bg-gray-300 transition-colors"
                >
                  <ArrowUpDown className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  Destination
                </label>
                <GoogleMapsAutocomplete
                  label=""
                  placeholder="Enter destination"
                  value={destination}
                  onChange={setDestination}
                />
              </div>
            </div>

            {/* Date & Time Select */}
            <div className="relative">
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Travel Date
              </label>
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span
                      className={
                        selectedDate ? "text-gray-900" : "text-gray-500"
                      }
                    >
                      {selectedDate
                        ? selectedDate.toLocaleDateString("en-US", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "Select travel date"}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </button>
              {showDatePicker && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                  <DatePicker
                    onDateSelect={(date) => {
                      console.log("HomePage - Date selected:", date);
                      if (date) {
                        setSelectedDate(date);
                        setShowDatePicker(false);
                      }
                    }}
                    initialDate={selectedDate}
                  />
                </div>
              )}
            </div>

            {/* Seats Select */}
            <div className="relative">
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Number of Seats
              </label>
              <button
                onClick={() => setShowSeatSelector(!showSeatSelector)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span
                      className={
                        numberOfSeats > 1 ? "text-gray-900" : "text-gray-500"
                      }
                    >
                      {numberOfSeats === 1
                        ? "1 seat"
                        : `${numberOfSeats} seats`}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </button>
              {showSeatSelector && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  <div className="py-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors ${
                          numberOfSeats === num
                            ? "bg-blue-50 text-blue-600 border-r-2 border-blue-500"
                            : "text-gray-900"
                        }`}
                        onClick={() => {
                          setNumberOfSeats(num);
                          setShowSeatSelector(false);
                        }}
                      >
                        {num} {num === 1 ? "seat" : "seats"}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Find Ride Button */}
            <button
              onClick={handleSearch}
              disabled={isSubmitting || (!isFormValid && !validationError)}
              className="w-full px-4 py-4 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 active:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Search className="w-5 h-5" />
              <span>{isSubmitting ? "Searching..." : "Find Rides"}</span>
              {!isSubmitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Validation Error */}
        {validationError && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-600 mt-1">{validationError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              Why Choose Us
            </h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-xs font-medium text-gray-900">Quick</p>
                <p className="text-xs text-gray-500">Booking</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-xs font-medium text-gray-900">Verified</p>
                <p className="text-xs text-gray-500">Drivers</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-xs font-medium text-gray-900">Live</p>
                <p className="text-xs text-gray-500">Tracking</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
