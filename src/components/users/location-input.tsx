"use client";

import { useContext, useEffect } from "react";
import { SourceContext } from "@/context/source-context";
import { DestinationContext } from "@/context/destination-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LocationInputProps {
  placeholder: string;
  type: "source" | "destination";
}

export default function LocationInput({
  placeholder,
  type,
}: LocationInputProps) {
  const { source, setSource } = useContext(SourceContext);
  const { destination, setDestination } = useContext(DestinationContext);

  const handleLocationSelect = (value: string) => {
    const locationData = { name: value };
    
    // Set data attribute on parent element for validation
    if (type === "source") {
      const element = document.getElementById("fromLocation");
      if (element) {
        element.setAttribute("data-location", value);
      }
      setSource(locationData);
    } else {
      const element = document.getElementById("toLocation");
      if (element) {
        element.setAttribute("data-location", value);
      }
      setDestination(locationData);
    }
  };

  // Get current value for the dropdown
  const currentValue = type === "source" 
    ? (source?.name || "") 
    : (destination?.name || "");

  // Get the other location to disable it
  const otherLocation = type === "source"
    ? (destination?.name || "")
    : (source?.name || "");

  return (
    <Select 
      onValueChange={handleLocationSelect} 
      value={currentValue || undefined}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem 
          value="Paithan" 
          disabled={otherLocation === "Paithan"}
        >
          Paithan
        </SelectItem>
        <SelectItem 
          value="Pune" 
          disabled={otherLocation === "Pune"}
        >
          Pune
        </SelectItem>
      </SelectContent>
    </Select>
  );
} 