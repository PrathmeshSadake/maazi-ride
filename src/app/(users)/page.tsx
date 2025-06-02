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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      // Format as YYYY-MM-DD for better compatibility
      const formattedDate = selectedDate.toISOString().split("T")[0];
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-md mx-auto flex items-center p-2 gap-2">
          <div className="flex items-center justify-center">
            <div className="text-white rounded-2xl">
              <img src="/images/logo2.png" alt="" className="h-16" />
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-gray-900">Find Your Ride</h1>
            <p className="text-gray-600 text-sm">
              Safe, reliable, and affordable rides
            </p>
          </div>
        </div>
      </div>

      <div className="relative w-full max-h-[200px] aspect-video">
        <Image src="/images/car.svg" alt="" className="" fill />
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4">
        {/* Search Card */}
        <Card className="border-0 shadow rounded-lg bg-white">
          <CardHeader className="py-0 text-center">
            <CardTitle>Find Your Ride</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="space-y-4">
              {/* Location Inputs */}
              <div className="relative">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <MapPin size={18} className="text-green-600" />
                      </div>
                    </div>
                    <GoogleMapsAutocomplete
                      label="From"
                      placeholder="Select location"
                      value={source}
                      onChange={setSource}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                        <MapPin size={18} className="text-red-600" />
                      </div>
                    </div>
                    <GoogleMapsAutocomplete
                      label="To"
                      placeholder="Select location"
                      value={destination}
                      onChange={setDestination}
                    />
                  </div>
                </div>
              </div>

              {/* Date & Time Select */}
              <div className="relative">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-between py-6 border bg-white"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                >
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-gray-500" />
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
                        : "Date & time"}
                    </span>
                  </div>
                  <div>
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-gray-500"
                    >
                      <path
                        d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z"
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </div>
                </Button>
                {showDatePicker && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
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
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-between py-6 border bg-white"
                  onClick={() => setShowSeatSelector(!showSeatSelector)}
                >
                  <div className="flex items-center gap-2">
                    <Users size={18} className="text-gray-500" />
                    <span
                      className={
                        numberOfSeats !== 1 ? "text-gray-900" : "text-gray-500"
                      }
                    >
                      {numberOfSeats === 1
                        ? "No of seat"
                        : `${numberOfSeats} seats`}
                    </span>
                  </div>
                  <div>
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-gray-500"
                    >
                      <path
                        d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z"
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </div>
                </Button>
                {showSeatSelector && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                    <div className="p-2">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          className={`w-full text-left px-4 py-2 hover:bg-gray-100 rounded-md ${
                            numberOfSeats === num
                              ? "bg-blue-50 text-blue-600"
                              : ""
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
              <Button
                onClick={handleSearch}
                disabled={isSubmitting || (!isFormValid && !validationError)}
                className="w-full py-6 rounded-md font-semibold text-base bg-[#0099cc] hover:bg-[#007aa3] text-white"
              >
                Find ride
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Validation Error */}
        {validationError && (
          <div className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100">
            <AlertCircle
              size={20}
              className="flex-shrink-0 mt-0.5 text-red-500"
            />
            <span className="text-red-700 text-sm font-medium">
              {validationError}
            </span>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 py-6">
          <div className="bg-white backdrop-blur-sm rounded-xl p-4 text-center border border-gray-200">
            <div className="bg-blue-100 rounded-full p-2 w-10 h-10 mx-auto mb-2 flex items-center justify-center">
              <Clock size={18} className="text-blue-600" />
            </div>
            <p className="text-xs text-gray-600 font-medium">Quick</p>
            <p className="text-xs text-gray-500">Booking</p>
          </div>

          <div className="bg-white backdrop-blur-sm rounded-xl p-4 text-center border border-gray-200">
            <div className="bg-green-100 rounded-full p-2 w-10 h-10 mx-auto mb-2 flex items-center justify-center">
              <Users size={18} className="text-green-600" />
            </div>
            <p className="text-xs text-gray-600 font-medium">Verified</p>
            <p className="text-xs text-gray-500">Drivers</p>
          </div>

          <div className="bg-white backdrop-blur-sm rounded-xl p-4 text-center border border-gray-200">
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
