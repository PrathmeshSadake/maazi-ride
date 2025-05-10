"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Filter, Calendar, Clock, Search } from "lucide-react";
import RideCard from "@/components/users/ride-card";
import { format, parseISO } from "date-fns";

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
    firstName: string;
    lastName: string;
    driverRating: number | null;
  };
}

export default function ExplorePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [fromLocationName, setFromLocationName] = useState<string>("");
  const [toLocationName, setToLocationName] = useState<string>("");

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
      router.push("/");
      return;
    }

    // Parse the JSON from the URL params
    let fromLocation, toLocation;
    try {
      if (fromParam) fromLocation = JSON.parse(decodeURIComponent(fromParam));
      if (toParam) toLocation = JSON.parse(decodeURIComponent(toParam));

      // Set location names
      setFromLocationName(
        typeof fromLocation === "string" ? fromLocation : fromLocation.name
      );
      setToLocationName(
        typeof toLocation === "string" ? toLocation : toLocation.name
      );
    } catch (e) {
      console.error("Error parsing location data:", e);
      setError("Invalid search parameters");
      setLoading(false);
      return;
    }

    // Fetch rides
    fetchRides(fromLocation, toLocation, dateParam);
  }, [searchParams, router]);

  const fetchRides = async (
    fromLocation: any,
    toLocation: any,
    dateParam: string | null
  ) => {
    setLoading(true);
    try {
      // Build query params
      const queryParams = new URLSearchParams();

      // Get location names from state or extract from parameters
      const fromName =
        fromLocationName ||
        (typeof fromLocation === "string" ? fromLocation : fromLocation.name);
      const toName =
        toLocationName ||
        (typeof toLocation === "string" ? toLocation : toLocation.name);

      // Add from and to location names - encode as JSON and then URL encode
      queryParams.append(
        "from",
        encodeURIComponent(JSON.stringify({ name: fromName }))
      );
      queryParams.append(
        "to",
        encodeURIComponent(JSON.stringify({ name: toName }))
      );

      // Add date if available
      if (dateParam) {
        try {
          // Parse the date first to ensure it's valid
          const date = new Date(decodeURIComponent(dateParam));
          if (isNaN(date.getTime())) {
            throw new Error("Invalid date");
          }
          // Format as ISO string to ensure consistent format
          const formattedDate = date.toISOString();
          queryParams.append("date", formattedDate);
          console.log("Using formatted date for search:", formattedDate);
        } catch (err) {
          console.error("Error formatting date parameter:", err);
          // If date is invalid, don't include it in the request
        }
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
              driverName={`${
                ride.driver.firstName
              } ${ride.driver.lastName.charAt(0)}.`}
              driverRating={ride.driver.driverRating || undefined}
              hasBooking={ride.hasBooking}
            />
          ))}
        </div>
      )}
    </div>
  );
}
