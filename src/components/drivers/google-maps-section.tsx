"use client";
import React, { useEffect } from "react";
import {
  GoogleMap,
  Marker,
  DirectionsService,
  DirectionsRenderer,
  OverlayView,
} from "@react-google-maps/api";
import { useContext, useState } from "react";
import { SourceContext } from "@/context/source-context";
import { DestinationContext } from "@/context/destination-context";
import { useGoogleMaps } from "./google-maps-provider";

// Updated container style for better mobile display
const containerStyle = {
  width: "100%",
  height: "250px", // Smaller default height for mobile
  borderRadius: "8px",
};

const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194,
};

function GoogleMapsSection({
  onDistanceCalculated,
}: {
  onDistanceCalculated?: (distance: string) => void;
}) {
  const { isLoaded } = useGoogleMaps();
  const [map, setMap] = React.useState<google.maps.Map | null>(null);
  const { source } = useContext(SourceContext);
  const { destination } = useContext(DestinationContext);
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);

  // Update map bounds when source or destination changes
  useEffect(() => {
    if (map && source && destination) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(source);
      bounds.extend(destination);
      map.fitBounds(bounds);

      // Add a slight padding to the bounds
      const padding = { top: 50, right: 50, bottom: 50, left: 50 };
      map.fitBounds(bounds, padding);
    } else if (map && source) {
      map.setCenter(source);
      map.setZoom(14);
    }
  }, [map, source, destination]);

  const onLoad = React.useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  const directionsCallback = (
    response: google.maps.DirectionsResult | null,
    status: google.maps.DirectionsStatus
  ) => {
    if (status === google.maps.DirectionsStatus.OK && response) {
      setDirections(response);

      // Calculate and pass the distance
      if (onDistanceCalculated && response.routes[0]?.legs[0]?.distance?.text) {
        const distanceText = response.routes[0].legs[0].distance.text;
        const distanceValue = response.routes[0].legs[0].distance.value / 1000; // Convert to km
        onDistanceCalculated(distanceValue.toFixed(2));
      }
    }
  };

  const center = source || defaultCenter;

  // Improved marker labels for better visibility on mobile
  const markerLabelStyle = {
    background: "white",
    padding: "4px 8px",
    borderRadius: "4px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
    fontSize: "12px",
    fontWeight: "bold",
    border: "1px solid #ccc",
    marginTop: "-40px",
    marginLeft: "-24px",
    position: "absolute" as const,
    zIndex: 1000,
  };

  return isLoaded ? (
    <div className='w-full mt-4 overflow-hidden rounded-lg shadow-sm border border-gray-200'>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          fullscreenControl: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          gestureHandling: "cooperative", // Better touch handling for mobile
        }}
      >
        {source && (
          <>
            <Marker
              position={source}
              icon={{
                url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
                scaledSize: new google.maps.Size(32, 32),
              }}
            />
            <OverlayView
              position={source}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <div style={markerLabelStyle}>Pickup</div>
            </OverlayView>
          </>
        )}
        {destination && (
          <>
            <Marker
              position={destination}
              icon={{
                url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                scaledSize: new google.maps.Size(32, 32),
              }}
            />
            <OverlayView
              position={destination}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <div style={markerLabelStyle}>Dropoff</div>
            </OverlayView>
          </>
        )}
        {source && destination && (
          <DirectionsService
            options={{
              destination: destination,
              origin: source,
              travelMode: google.maps.TravelMode.DRIVING,
            }}
            callback={directionsCallback}
          />
        )}
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              polylineOptions: {
                strokeColor: "#3B82F6", // Changed to blue for better visibility
                strokeWeight: 5,
                strokeOpacity: 0.7,
              },
              suppressMarkers: true,
            }}
          />
        )}
      </GoogleMap>
    </div>
  ) : (
    <div className='h-[250px] bg-gray-100 flex items-center justify-center rounded-lg mt-4 border border-gray-200'>
      <div className='animate-pulse text-gray-500'>Loading Map...</div>
    </div>
  );
}

export default GoogleMapsSection;
