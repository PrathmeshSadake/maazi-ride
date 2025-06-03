"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Input } from "./input";
import { Label } from "./label";
import { MapPin, Loader2 } from "lucide-react";

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
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState(value?.name || "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setInputValue(value?.name || "");
  }, [value]);

  const initializeAutocomplete = useCallback(() => {
    if (!window.google || !inputRef.current) return;

    try {
      // Clear any existing autocomplete
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(
          autocompleteRef.current
        );
      }

      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ["geocode"],
          componentRestrictions: { country: "in" }, // Restrict to India for better results
        }
      );

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current.getPlace();

        if (!place.geometry) {
          setError("Please select a valid location from the dropdown");
          return;
        }

        try {
          const newLocation = {
            name: place.formatted_address || place.name,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };

          setInputValue(newLocation.name);
          onChange(newLocation);
          setError(null);
        } catch (err) {
          console.error("Error processing place:", err);
          setError("Error processing location. Please try again.");
        }
      });

      setIsLoaded(true);
      setError(null);
    } catch (err) {
      console.error("Error initializing autocomplete:", err);
      setError("Failed to initialize location search");
    }
  }, [onChange]);

  useEffect(() => {
    // Load Google Maps JavaScript API
    if (!window.google) {
      setIsLoading(true);
      const script = document.createElement("script");
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

      if (!apiKey) {
        setIsLoading(false);
        setError(
          "Google Maps API key is missing. Please check your environment variables."
        );
        return;
      }

      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMapsAutocomplete`;
      script.async = true;
      script.defer = true;

      // Set up global callback
      window.initGoogleMapsAutocomplete = () => {
        setIsLoading(false);
        initializeAutocomplete();
      };

      script.onerror = () => {
        setIsLoading(false);
        setError(
          "Failed to load Google Maps. Please check your internet connection and API key configuration."
        );
      };

      document.head.appendChild(script);
    } else {
      initializeAutocomplete();
    }

    // Cleanup function
    return () => {
      if (autocompleteRef.current) {
        try {
          window.google?.maps?.event?.clearInstanceListeners(
            autocompleteRef.current
          );
        } catch (err) {
          console.error("Error cleaning up autocomplete:", err);
        }
      }
    };
  }, [initializeAutocomplete]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setError(null);

    if (newValue === "") {
      onChange(null);
    }
  };

  const handleInputFocus = () => {
    // Re-initialize autocomplete if it's not working
    if (isLoaded && !autocompleteRef.current && window.google) {
      initializeAutocomplete();
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      <div className="relative">
        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500 z-10" />
        {isLoading && (
          <Loader2 className="absolute right-3 top-3 h-4 w-4 text-gray-500 animate-spin z-10" />
        )}
        <Input
          ref={inputRef}
          type="text"
          placeholder={isLoading ? "Loading..." : placeholder}
          value={inputValue}
          className={`pl-10 pr-10 ${
            error ? "border-red-300 focus:border-red-500" : ""
          }`}
          disabled={disabled || isLoading}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          autoComplete="off"
        />
      </div>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
