"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "./input";
import { Label } from "./label";
import { MapPin } from "lucide-react";

interface Location {
  name: string;
  lat: number;
  lng: number;
}

interface GoogleMapsAutocompleteProps {
  label: string;
  placeholder: string;
  value?: Location | null;
  onChange: (location: Location | null) => void;
  disabled?: boolean;
}

declare global {
  interface Window {
    google: any;
    initGoogleMapsAutocomplete: () => void;
  }
}

export function GoogleMapsAutocomplete({
  label,
  placeholder,
  value,
  onChange,
  disabled = false,
}: GoogleMapsAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [inputValue, setInputValue] = useState(value?.name || "");

  useEffect(() => {
    setInputValue(value?.name || "");
  }, [value]);

  useEffect(() => {
    // Load Google Maps JavaScript API
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsLoaded(true);
      document.head.appendChild(script);
    } else {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && inputRef.current) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        { types: ["geocode"] }
      );

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current.getPlace();
        if (place.geometry) {
          const newLocation = {
            name: place.formatted_address,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };
          setInputValue(newLocation.name);
          onChange(newLocation);
        }
      });
    }
  }, [isLoaded, onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (newValue === "") {
      onChange(null);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative">
        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={inputValue}
          className="pl-10"
          disabled={disabled || !isLoaded}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
}
