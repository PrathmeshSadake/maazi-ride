"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import Script from "next/script";

type GoogleMapsContextType = {
  isLoaded: boolean;
  api: typeof google | null;
};

const GoogleMapsContext = createContext<GoogleMapsContextType>({
  isLoaded: false,
  api: null,
});

export const useGoogleMaps = () => useContext(GoogleMapsContext);

export const GoogleMapsProvider = ({ children }: { children: ReactNode }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [api, setApi] = useState<typeof google | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

  useEffect(() => {
    // Check if Google API is already loaded
    if (typeof window !== "undefined" && window.google) {
      setIsLoaded(true);
      setApi(window.google);
    }
  }, []);

  const handleScriptLoad = () => {
    if (typeof window !== "undefined" && window.google) {
      setIsLoaded(true);
      setApi(window.google);
      console.log("Google Maps API loaded successfully");
    }
  };

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, api }}>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`}
        onLoad={handleScriptLoad}
        onError={() => console.error("Google Maps script failed to load")}
        strategy='afterInteractive'
      />
      {children}
    </GoogleMapsContext.Provider>
  );
};

export default GoogleMapsProvider;
