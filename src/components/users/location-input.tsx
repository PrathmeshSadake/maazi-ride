"use client";
import { MapPin } from "lucide-react";
import { useContext, useState, useEffect } from "react";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { SourceContext } from "@/context/source-context";
import { DestinationContext } from "@/context/destination-context";
import { useGoogleMaps } from "./google-maps-provider";

type InputItemProps = {
  placeholder: string;
  type: "source" | "destination";
};

const LocationInput = ({ placeholder, type }: InputItemProps) => {
  const [value, setValue] = useState(null);
  const { setSource, source } = useContext(SourceContext);
  const { setDestination, destination } = useContext(DestinationContext);
  const { isLoaded, api } = useGoogleMaps();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

  const getLatLng = (place: any, type: "source" | "destination") => {
    if (!api || !api.maps || !api.maps.places) {
      console.error("Google Maps API not loaded");
      return;
    }

    const placeId = place.value.place_id;
    const service = new api.maps.places.PlacesService(
      document.createElement("div")
    );
    service.getDetails({ placeId }, (place, status) => {
      if (
        status === api.maps.places.PlacesServiceStatus.OK &&
        place?.geometry &&
        place.geometry.location
      ) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        if (type === "source") {
          setSource({
            lat,
            lng,
            name: place.formatted_address,
            label: place.name,
          });
        } else {
          setDestination({
            lat,
            lng,
            name: place.formatted_address,
            label: place.name,
          });
        }
      }
    });
  };

  // For debugging and form submission
  useEffect(() => {
    const locationEl = document.getElementById(
      type === "source" ? "fromLocation" : "toLocation"
    );
    if (locationEl) {
      if (type === "source" && source) {
        locationEl.setAttribute("data-location", JSON.stringify(source));
        locationEl.setAttribute("data-lat", source.lat.toString());
        locationEl.setAttribute("data-lng", source.lng.toString());
      } else if (type === "destination" && destination) {
        locationEl.setAttribute("data-location", JSON.stringify(destination));
        locationEl.setAttribute("data-lat", destination.lat.toString());
        locationEl.setAttribute("data-lng", destination.lng.toString());
      }
    }
  }, [type, source, destination]);

  return (
    <div className='flex items-center space-x-2 bg-gray-100 py-2 px-4 rounded-lg shadow-sm'>
      <MapPin className='h-5 w-5 text-gray-500' />
      {isLoaded ? (
        <GooglePlacesAutocomplete
          selectProps={{
            value,
            onChange: (place: any) => {
              getLatLng(place, type);
              setValue(place);
            },
            placeholder: placeholder,
            isClearable: true,
            className: "w-full",
            components: {
              DropdownIndicator: null,
            },
            styles: {
              control: (provided) => ({
                ...provided,
                backgroundColor: "transparent",
                border: "none",
                boxShadow: "none",
                "&:hover": {
                  border: "none",
                },
              }),
              input: (provided) => ({
                ...provided,
                color: "inherit",
              }),
              option: (provided) => ({
                ...provided,
                color: "black",
              }),
            },
          }}
          apiOptions={{ language: "en", region: "in" }}
          apiKey={apiKey}
        />
      ) : (
        <div className='w-full text-gray-500 text-sm'>
          Loading Google Places...
        </div>
      )}
    </div>
  );
};

export default LocationInput;
