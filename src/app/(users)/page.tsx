"use client";

import { useState, useEffect, useContext } from "react";
import { Calendar, Car, Search } from "lucide-react";
import { SourceProvider, SourceContext } from "@/context/source-context";
import { DestinationProvider, DestinationContext } from "@/context/destination-context";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import DatePicker from "@/components/users/date-picker";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isFormValid, setIsFormValid] = useState(false);
  const router = useRouter();
  const { source, setSource } = useContext(SourceContext);
  const { destination, setDestination } = useContext(DestinationContext);

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

    if (fromLocation) {
      const fromLocationData = { name: fromLocation };
      queryParams.append("from", JSON.stringify(fromLocationData));
    }
    
    if (toLocation) {
      const toLocationData = { name: toLocation };
      queryParams.append("to", JSON.stringify(toLocationData));
    }
    
    if (selectedDate) queryParams.append("date", selectedDate.toISOString());

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

      <SourceProvider>
        <DestinationProvider>
          <div className='space-y-4'>
            <div>
              <div className='mb-1.5 text-sm font-medium'>From</div>
              <div id='fromLocation'>
                <Select 
                  onValueChange={(value) => {
                    const locationData = { name: value };
                    const element = document.getElementById("fromLocation");
                    if (element) {
                      element.setAttribute("data-location", value);
                    }
                    setSource(locationData);
                  }} 
                  value={source?.name || undefined}
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
              <div className='mb-1.5 text-sm font-medium'>To</div>
              <div id='toLocation'>
                <Select 
                  onValueChange={(value) => {
                    const locationData = { name: value };
                    const element = document.getElementById("toLocation");
                    if (element) {
                      element.setAttribute("data-location", value);
                    }
                    setDestination(locationData);
                  }} 
                  value={destination?.name || undefined}
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
                    <SelectItem 
                      value="Pune" 
                      disabled={source?.name === "Pune"}
                    >
                      Pune
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

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
    </div>
  );
}
