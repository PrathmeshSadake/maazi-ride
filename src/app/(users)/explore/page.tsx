"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Filter,
  Calendar,
  Clock,
  Search,
  Edit,
  Check,
  Loader2,
} from "lucide-react";
import RideCard from "@/components/users/ride-card";
import { format, parseISO } from "date-fns";
import { GoogleMapsAutocomplete } from "@/components/ui/google-maps-autocomplete";

interface Ride {
  id: string;
  fromLocation: string;
  toLocation: string;
  departureDate: string;
  departureTime: string;
  price: number;
  availableSeats: number;
  hasBooking?: boolean;
  driver: {
    name: string;
    driverRating: number | null;
  };
  fromLatitude: number;
  fromLongitude: number;
  toLatitude: number;
  toLongitude: number;
}

// Define Location type to match GoogleMapsAutocomplete component
interface Location {
  name: string;
  lat: number;
  lng: number;
}

function ExplorePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [fromLocationName, setFromLocationName] = useState<string>("");
  const [toLocationName, setToLocationName] = useState<string>("");
  const [isEditingLocations, setIsEditingLocations] = useState(false);
  const [fromLocation, setFromLocation] = useState<Location | null>(null);
  const [toLocation, setToLocation] = useState<Location | null>(null);

  // Parse search parameters
  useEffect(() => {
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");
    const dateParam = searchParams.get("date");

    if (dateParam) {
      try {
        setSelectedDate(new Date(decodeURIComponent(dateParam)));
      } catch (e) {
        console.error("Invalid date format:", e);
      }
    }

    // If not enough search params, redirect back to home
    if (!fromParam || !toParam) {
      // router.push("/");
      return;
    }

    // Parse the JSON from the URL params
    try {
      if (fromParam) {
        const parsedFrom = JSON.parse(decodeURIComponent(fromParam));
        setFromLocation(parsedFrom);
        // Set location names
        setFromLocationName(
          typeof parsedFrom === "string" ? parsedFrom : parsedFrom.name
        );
      }

      if (toParam) {
        const parsedTo = JSON.parse(decodeURIComponent(toParam));
        setToLocation(parsedTo);
        setToLocationName(
          typeof parsedTo === "string" ? parsedTo : parsedTo.name
        );
      }
    } catch (e) {
      console.error("Error parsing location data:", e);
      setError("Invalid search parameters");
      setLoading(false);
      return;
    }

    // Fetch rides
    fetchRides(fromParam, toParam, dateParam);
  }, [searchParams, router]);

  const fetchRides = async (
    fromParam: string,
    toParam: string,
    dateParam: string | null
  ) => {
    setLoading(true);
    try {
      // Build query params - just reuse the existing params
      const queryParams = new URLSearchParams();
      queryParams.append("from", fromParam);
      queryParams.append("to", toParam);

      // Add date if available
      if (dateParam) {
        queryParams.append("date", dateParam);
      }

      console.log(
        "Sending search request with params:",
        queryParams.toString()
      );

      const response = await fetch(
        `/api/rides/search?${queryParams.toString()}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("API error response:", errorData);
        throw new Error(`Error fetching rides: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`Received API response with ${data.length} rides`);

      // Log the first ride data for debugging
      if (data.length > 0) {
        console.log("First ride data sample:", {
          id: data[0].id,
          fromLocation: data[0].fromLocation,
          toLocation: data[0].toLocation,
          fromLatitude: data[0].fromLatitude,
          fromLongitude: data[0].fromLongitude,
          toLatitude: data[0].toLatitude,
          toLongitude: data[0].toLongitude,
          departureDate: data[0].departureDate,
          departureTime: data[0].departureTime,
          price: data[0].price,
          availableSeats: data[0].availableSeats,
        });
      }

      // Validate response data
      if (!Array.isArray(data)) {
        console.error("API returned non-array response:", data);
        throw new Error("Invalid response format from API");
      }

      // Filter out invalid rides (missing required fields)
      const validRides = data.filter(
        (ride) =>
          ride &&
          typeof ride.id === "string" &&
          typeof ride.fromLocation === "string" &&
          typeof ride.toLocation === "string" &&
          ride.departureDate &&
          ride.departureTime
      );

      if (validRides.length < data.length) {
        console.warn(
          `Filtered out ${data.length - validRides.length} invalid rides`
        );
      }

      setRides(validRides);
    } catch (err) {
      console.error("Error fetching rides:", err);
      setError("Failed to load rides. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    router.back();
  };

  // Function to update search with new date
  const updateSearchWithDate = (newDate: Date) => {
    // Get current params
    const params = new URLSearchParams(searchParams.toString());
    // Update date param
    params.set("date", newDate.toISOString());
    // Navigate with new params
    router.push(`/explore?${params.toString()}`);
  };

  // Function to update search with new locations
  const updateLocations = () => {
    if (!fromLocation || !toLocation) return;

    // Validation: check if from and to are the same
    if (fromLocation.name === toLocation.name) {
      alert("Pickup and destination cannot be the same location");
      return;
    }

    // Show loading state
    setLoading(true);

    // Get current params
    const params = new URLSearchParams(searchParams.toString());
    // Update location params
    params.set("from", encodeURIComponent(JSON.stringify(fromLocation)));
    params.set("to", encodeURIComponent(JSON.stringify(toLocation)));

    // Keep the date if it exists
    if (selectedDate) {
      params.set("date", selectedDate.toISOString());
    }

    // Navigate with new params
    router.push(`/explore?${params.toString()}`);
    // Exit editing mode
    setIsEditingLocations(false);
  };

  return (
    <div className="p-4 max-w-md mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={goBack} className="p-2 rounded-full hover:bg-gray-100">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold">Available Rides</h1>
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="p-2 rounded-full hover:bg-gray-100 relative"
        >
          <Filter size={20} className={isFilterOpen ? "text-blue-600" : ""} />
        </button>
      </div>

      {/* Search Info */}
      <div className="bg-white rounded-lg shadow-md mb-4 p-4">
        {isEditingLocations ? (
          <div className="space-y-4">
            <GoogleMapsAutocomplete
              label="From"
              placeholder="Enter pickup location"
              value={fromLocation}
              onChange={setFromLocation}
            />
            <GoogleMapsAutocomplete
              label="To"
              placeholder="Enter destination"
              value={toLocation}
              onChange={setToLocation}
            />
            <div className="flex justify-end">
              <button
                onClick={updateLocations}
                className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm"
                disabled={!fromLocation || !toLocation}
              >
                <Check size={16} />
                Update
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start mb-3">
              <div className="w-10 flex-shrink-0 flex justify-center">
                <div className="w-2.5 h-2.5 mt-1.5 rounded-full bg-green-500"></div>
              </div>
              <div className="flex-1">
                <p className="font-medium">{fromLocationName}</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-10 flex-shrink-0 flex justify-center">
                <div className="w-2.5 h-2.5 mt-1.5 rounded-full bg-red-500"></div>
              </div>
              <div className="flex-1">
                <p className="font-medium">{toLocationName}</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditingLocations(true)}
              className="flex items-center gap-1 mt-2 text-xs text-blue-600"
            >
              <Edit size={12} />
              Edit locations
            </button>
          </>
        )}

        {/* Date filter */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar size={16} />
              <span>
                {selectedDate
                  ? format(selectedDate, "dd MMMM yyyy")
                  : "Any date"}
              </span>
            </div>

            {selectedDate && (
              <button
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete("date");
                  router.push(`/explore?${params.toString()}`);
                }}
                className="text-xs text-blue-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Date Filter UI - Conditional */}
      {isFilterOpen && (
        <div className="bg-white rounded-lg shadow-md mb-4 p-4">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Calendar size={16} />
            Choose travel date
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {[0, 1, 2, 3, 4, 5, 6].map((dayOffset) => {
              const date = new Date();
              date.setDate(date.getDate() + dayOffset);
              const isSelected =
                selectedDate &&
                format(date, "yyyy-MM-dd") ===
                  format(selectedDate, "yyyy-MM-dd");

              return (
                <button
                  key={dayOffset}
                  onClick={() => updateSearchWithDate(date)}
                  className={`p-2 rounded-lg text-center ${
                    isSelected
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  <p className="text-xs mb-1">{format(date, "EEE")}</p>
                  <p
                    className={`font-medium ${isSelected ? "text-white" : ""}`}
                  >
                    {format(date, "d")}
                  </p>
                </button>
              );
            })}
            <button
              onClick={() => {
                const datePicker = document.getElementById("date-picker");
                if (datePicker) datePicker.click();
              }}
              className="p-2 rounded-lg text-center bg-gray-100 hover:bg-gray-200"
            >
              <p className="text-xs mb-1">More</p>
              <p className="font-medium">...</p>
            </button>
          </div>

          <input
            id="date-picker"
            type="date"
            className="hidden"
            onChange={(e) => {
              if (e.target.value) {
                updateSearchWithDate(new Date(e.target.value));
              }
            }}
          />
        </div>
      )}

      {/* Results count */}
      {!loading && !error && (
        <div className="mb-4 px-1">
          <p className="text-sm text-gray-600">
            {rides.length} {rides.length === 1 ? "ride" : "rides"} available
          </p>
        </div>
      )}

      {loading ? (
        <div className="py-10 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-2 border-t-blue-600 border-r-transparent border-b-blue-600 border-l-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500">Finding rides for you...</p>
        </div>
      ) : error ? (
        <div className="py-10 text-center">
          <p className="text-red-500">{error}</p>
          <button onClick={goBack} className="mt-4 text-blue-600 underline">
            Go back to search
          </button>
        </div>
      ) : rides.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-gray-500">
            No rides found for this route and date.
          </p>
          <p className="text-gray-400 mt-2 text-sm">
            Try changing your search criteria.
          </p>
          <button
            onClick={goBack}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            New Search
          </button>
        </div>
      ) : (
        <div className="mt-2">
          {rides.map((ride) => (
            <RideCard
              key={ride.id}
              id={ride.id}
              fromLocation={ride.fromLocation}
              toLocation={ride.toLocation}
              departureDate={new Date(ride.departureDate)}
              departureTime={ride.departureTime}
              price={ride.price}
              availableSeats={ride.availableSeats}
              driverName={ride.driver.name}
              driverRating={ride.driver.driverRating || undefined}
              hasBooking={ride.hasBooking}
              fromLatitude={ride.fromLatitude}
              fromLongitude={ride.fromLongitude}
              toLatitude={ride.toLatitude}
              toLongitude={ride.toLongitude}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="p-4 max-w-md mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 rounded-full">
          <ArrowLeft size={20} className="text-gray-400" />
        </div>
        <h1 className="text-lg font-semibold">Available Rides</h1>
        <div className="p-2 rounded-full">
          <Filter size={20} className="text-gray-400" />
        </div>
      </div>

      {/* Search Info Skeleton */}
      <div className="bg-white rounded-lg shadow-md mb-4 p-4">
        <div className="flex items-start mb-3">
          <div className="w-10 flex-shrink-0 flex justify-center">
            <div className="w-2.5 h-2.5 mt-1.5 rounded-full bg-gray-300 animate-pulse"></div>
          </div>
          <div className="flex-1">
            <div className="h-4 bg-gray-300 rounded animate-pulse w-3/4"></div>
          </div>
        </div>
        <div className="flex items-start mb-3">
          <div className="w-10 flex-shrink-0 flex justify-center">
            <div className="w-2.5 h-2.5 mt-1.5 rounded-full bg-gray-300 animate-pulse"></div>
          </div>
          <div className="flex-1">
            <div className="h-4 bg-gray-300 rounded animate-pulse w-2/3"></div>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-400" />
            <div className="h-4 bg-gray-300 rounded animate-pulse w-24"></div>
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      <div className="py-10 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500">Loading rides...</p>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ExplorePageContent />
    </Suspense>
  );
}
