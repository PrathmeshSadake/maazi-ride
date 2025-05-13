"use client";

import { useState, useEffect, createContext } from "react";
import { Calendar, Car, Search, AlertCircle } from "lucide-react";
import DatePicker from "@/components/users/date-picker";
import { useRouter } from "next/navigation";
import { GoogleMapsAutocomplete } from "@/components/ui/google-maps-autocomplete";

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

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="flex items-center justify-center mt-6 mb-4">
        <div className="bg-blue-600 text-white rounded-full p-3">
          <Car size={28} className="text-white" />
        </div>
      </div>

      <h1 className="text-2xl font-bold text-center mb-6">Find a Ride</h1>

      <div className="space-y-4">
        <div>
          <GoogleMapsAutocomplete
            label="From"
            placeholder="Enter pickup location"
            value={source}
            onChange={setSource}
          />
        </div>

        <div>
          <GoogleMapsAutocomplete
            label="To"
            placeholder="Enter destination"
            value={destination}
            onChange={setDestination}
          />
        </div>

        <div>
          <div className="mb-1.5 text-sm font-medium">Date</div>
          <DatePicker
            onDateSelect={(date) => {
              console.log("HomePage - Date selected:", date);
              if (date) {
                setSelectedDate(date);
              }
            }}
            initialDate={selectedDate}
          />
        </div>

        {validationError && (
          <div className="flex items-start gap-2 p-2 rounded bg-red-50 text-red-600 text-sm">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{validationError}</span>
          </div>
        )}
      </div>

      <button
        onClick={handleSearch}
        disabled={isSubmitting || (!isFormValid && !validationError)}
        className={`w-full py-3 rounded-lg mt-6 font-medium flex items-center justify-center gap-2 ${
          isSubmitting
            ? "bg-blue-400 text-white cursor-not-allowed"
            : isFormValid
            ? "bg-blue-600 text-white"
            : "bg-gray-300 text-gray-600 cursor-not-allowed"
        }`}
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Searching...
          </>
        ) : (
          <>
            <Search size={18} />
            Find Rides
          </>
        )}
      </button>
    </div>
  );
}
