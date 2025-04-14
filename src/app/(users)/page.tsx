"use client";

import { useState, useEffect } from "react";
import { Calendar, Car, Search } from "lucide-react";
import { SourceProvider } from "@/context/source-context";
import { DestinationProvider } from "@/context/destination-context";
import LocationInput from "@/components/users/location-input";
import GoogleMapsSection from "@/components/users/google-maps-section";
import GoogleMapsProvider from "@/components/users/google-maps-provider";
import DatePicker from "@/components/users/date-picker";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [distance, setDistance] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isFormValid, setIsFormValid] = useState(false);
  const router = useRouter();

  // Check if both locations are set and form is valid
  useEffect(() => {
    const fromLocationEl = document.getElementById("fromLocation");
    const toLocationEl = document.getElementById("toLocation");

    const hasSource = fromLocationEl?.getAttribute("data-location") !== null;
    const hasDestination = toLocationEl?.getAttribute("data-location") !== null;

    setIsFormValid(hasSource && hasDestination && selectedDate !== undefined);
  }, [selectedDate]);

  const handleSearch = () => {
    if (!isFormValid) return;

    const fromLocationEl = document.getElementById("fromLocation");
    const toLocationEl = document.getElementById("toLocation");

    const fromLocation = fromLocationEl?.getAttribute("data-location");
    const toLocation = toLocationEl?.getAttribute("data-location");

    const queryParams = new URLSearchParams();

    if (fromLocation) queryParams.append("from", fromLocation);
    if (toLocation) queryParams.append("to", toLocation);
    if (selectedDate) queryParams.append("date", selectedDate.toISOString());
    if (distance) queryParams.append("distance", distance);

    router.push(`/explore?${queryParams.toString()}`);
  };

  return (
    <div className='p-4 max-w-md mx-auto'>
      <div className='flex items-center justify-center mt-6 mb-4'>
        <div className='bg-blue-600 text-white rounded-full p-3'>
          <Car size={28} className='text-white' />
        </div>
      </div>

      <h1 className='text-2xl font-bold text-center mb-6'>Find a Ride</h1>

      <GoogleMapsProvider>
        <SourceProvider>
          <DestinationProvider>
            <div className='space-y-4'>
              <div>
                <div className='mb-1.5 text-sm font-medium'>From</div>
                <div id='fromLocation'>
                  <LocationInput
                    placeholder='Enter pickup location'
                    type='source'
                  />
                </div>
              </div>

              <div>
                <div className='mb-1.5 text-sm font-medium'>To</div>
                <div id='toLocation'>
                  <LocationInput
                    placeholder='Enter destination'
                    type='destination'
                  />
                </div>
              </div>

              <GoogleMapsSection
                onDistanceCalculated={(value) => setDistance(value)}
              />

              <div>
                <div className='mb-1.5 text-sm font-medium'>Date</div>
                <DatePicker onDateSelect={(date) => setSelectedDate(date)} />
              </div>
            </div>

            <button
              onClick={handleSearch}
              disabled={!isFormValid}
              className={`w-full py-3 rounded-lg mt-6 font-medium flex items-center justify-center gap-2
                ${
                  isFormValid
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
            >
              <Search size={18} />
              Find Rides
            </button>
          </DestinationProvider>
        </SourceProvider>
      </GoogleMapsProvider>
    </div>
  );
}
