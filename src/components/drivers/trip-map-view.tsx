"use client";
import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  Marker,
  DirectionsService,
  DirectionsRenderer,
  OverlayView,
  InfoWindow,
} from "@react-google-maps/api";
import { useGoogleMaps } from "./google-maps-provider";

// Container style for map
const containerStyle = {
  width: "100%",
  height: "400px", // Taller for detailed view
  borderRadius: "8px",
};

// Default center if locations not provided
const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194,
};

interface TripMapViewProps {
  source: {
    lat: number;
    lng: number;
    name?: string;
  } | null;
  destination: {
    lat: number;
    lng: number;
    name?: string;
  } | null;
  isDetailView?: boolean;
}

function TripMapView({
  source,
  destination,
  isDetailView = false,
}: TripMapViewProps) {
  const { isLoaded } = useGoogleMaps();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  const [distance, setDistance] = useState<string | null>(null);
  const [duration, setDuration] = useState<string | null>(null);
  const [showInfoWindow, setShowInfoWindow] = useState(false);

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

  const onUnmount = React.useCallback(function callback() {
    setMap(null);
  }, []);

  const directionsCallback = (
    response: google.maps.DirectionsResult | null,
    status: google.maps.DirectionsStatus
  ) => {
    if (status === google.maps.DirectionsStatus.OK && response) {
      setDirections(response);

      // Extract route information
      if (response.routes[0]?.legs[0]) {
        const leg = response.routes[0].legs[0];
        setDistance(leg.distance?.text || null);
        setDuration(leg.duration?.text || null);
      }
    }
  };

  const center = source || defaultCenter;

  // Marker label style
  const markerLabelStyle = {
    background: "white",
    padding: "4px 8px",
    borderRadius: "4px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
    fontSize: "12px",
    fontWeight: "bold" as const,
    border: "1px solid #ccc",
    marginTop: "-40px",
    marginLeft: "-24px",
    position: "absolute" as const,
    zIndex: 1000,
  };

  // Enhanced map options for detail view
  const mapOptions = {
    fullscreenControl: isDetailView,
    zoomControl: true,
    streetViewControl: isDetailView,
    mapTypeControl: isDetailView,
    gestureHandling: "cooperative" as const,
  };

  return isLoaded ? (
    <div className='w-full overflow-hidden rounded-lg shadow-sm border border-gray-200'>
      {distance && duration && isDetailView && (
        <div className='bg-white p-3 border-b border-gray-200 flex gap-4'>
          <div>
            <span className='text-sm text-gray-500'>Distance:</span>{" "}
            <span className='font-medium'>{distance}</span>
          </div>
          <div>
            <span className='text-sm text-gray-500'>Est. travel time:</span>{" "}
            <span className='font-medium'>{duration}</span>
          </div>
        </div>
      )}

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
      >
        {source && (
          <>
            <Marker
              position={source}
              icon={{
                url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
                scaledSize: new google.maps.Size(32, 32),
              }}
              onClick={() => setShowInfoWindow(true)}
            />
            <OverlayView
              position={source}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <div style={markerLabelStyle}>Pickup</div>
            </OverlayView>

            {showInfoWindow && isDetailView && (
              <InfoWindow
                position={source}
                onCloseClick={() => setShowInfoWindow(false)}
              >
                <div className='p-1'>
                  <h3 className='font-medium text-sm'>Pickup Location</h3>
                  <p className='text-xs'>
                    {source.name ||
                      `${source.lat.toFixed(6)}, ${source.lng.toFixed(6)}`}
                  </p>
                </div>
              </InfoWindow>
            )}
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
                strokeColor: "#3B82F6",
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
    <div className='h-[400px] bg-gray-100 flex items-center justify-center rounded-lg border border-gray-200'>
      <div className='animate-pulse text-gray-500'>Loading Map...</div>
    </div>
  );
}

export default TripMapView;
