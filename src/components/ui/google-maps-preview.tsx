"use client";

import { useEffect, useRef, useState } from "react";

interface Location {
  name: string;
  lat: number;
  lng: number;
}

interface GoogleMapsPreviewProps {
  source: Location | null;
  destination: Location | null;
  className?: string;
}

declare global {
  interface Window {
    google: any;
    googleMapsScriptLoaded: boolean;
  }
}

export function GoogleMapsPreview({
  source,
  destination,
  className = "",
}: GoogleMapsPreviewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const directionsRendererRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load Google Maps JavaScript API if not already loaded
    if (!window.google) {
      // Check if script is already being loaded
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        return;
      }

      const script = document.createElement("script");
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

      if (!apiKey) {
        console.error(
          "Google Maps API key is missing. Please check your environment variables."
        );
        return;
      }

      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        setIsLoaded(true);
        window.googleMapsScriptLoaded = true;
      };

      script.onerror = () => {
        console.error(
          "Failed to load Google Maps. Please check your internet connection and API key configuration."
        );
      };

      document.head.appendChild(script);
    } else if (window.googleMapsScriptLoaded) {
      // If Google Maps is already loaded, initialize immediately
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || !source || !destination) return;

    // Initialize map if not already initialized
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        zoom: 12,
        center: { lat: source.lat, lng: source.lng },
        disableDefaultUI: true,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      });

      directionsRendererRef.current = new window.google.maps.DirectionsRenderer(
        {
          suppressMarkers: true,
          preserveViewport: true,
        }
      );
      directionsRendererRef.current.setMap(mapInstanceRef.current);
    }

    // Create markers for source and destination
    const sourceMarker = new window.google.maps.Marker({
      position: { lat: source.lat, lng: source.lng },
      map: mapInstanceRef.current,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: "#22C55E",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2,
      },
    });

    const destinationMarker = new window.google.maps.Marker({
      position: { lat: destination.lat, lng: destination.lng },
      map: mapInstanceRef.current,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: "#EF4444",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2,
      },
    });

    // Calculate and display route
    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: { lat: source.lat, lng: source.lng },
        destination: { lat: destination.lat, lng: destination.lng },
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result: any, status: any) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          directionsRendererRef.current.setDirections(result);

          // Fit bounds to show the entire route
          const bounds = new window.google.maps.LatLngBounds();
          bounds.extend({ lat: source.lat, lng: source.lng });
          bounds.extend({ lat: destination.lat, lng: destination.lng });
          mapInstanceRef.current.fitBounds(bounds);
        }
      }
    );

    return () => {
      sourceMarker.setMap(null);
      destinationMarker.setMap(null);
    };
  }, [isLoaded, source, destination]);

  return (
    <div
      ref={mapRef}
      className={`w-full h-[200px] rounded-lg overflow-hidden ${className}`}
    />
  );
}
