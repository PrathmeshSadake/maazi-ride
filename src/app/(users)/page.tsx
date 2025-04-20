"use client";

import { useState, useEffect, createContext } from "react";
import { Calendar, Car, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DatePicker from "@/components/users/date-picker";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [source, setSource] = useState<{ name: string } | null>(null);
  const [destination, setDestination] = useState<{ name: string } | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);
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
  }, [source, destination, selectedDate]);

  const handleSearch = () => {
    // Double-check that source and destination are not the same
    if (source?.name === destination?.name) {
      console.log("Source:", source);
      console.log("Destination:", destination);
      console.log("Source and destination are the same");
      console.error("Source and destination cannot be the same");
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
          <div className="mb-1.5 text-sm font-medium">From</div>
          <div id="fromLocation">
            <Select
              onValueChange={(value) => {
                console.log("From location selected:", value);
                const locationData = { name: value };
                setSource(locationData);
              }}
              value={source?.name || ""}
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
          <div className="mb-1.5 text-sm font-medium">To</div>
          <div id="toLocation">
            <Select
              onValueChange={(value) => {
                console.log("To location selected:", value);
                const locationData = { name: value };
                setDestination(locationData);
              }}
              value={destination?.name || ""}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Enter destination" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value="Paithan"
                  disabled={source?.name === "Paithan"}
                >
                  Paithan
                </SelectItem>
                <SelectItem value="Pune" disabled={source?.name === "Pune"}>
                  Pune
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
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
      </div>

      <button
        onClick={handleSearch}
        className="w-full py-3 rounded-lg mt-6 font-medium flex items-center justify-center gap-2 bg-blue-600 text-white"
      >
        <Search size={18} />
        Find Rides
      </button>
    </div>
  );
}
