"use client";
import React from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ChevronRight,
  IndianRupee,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

interface RideCardProps {
  id: string;
  fromLocation: string;
  toLocation: string;
  departureDate: Date;
  departureTime: string;
  price: number;
  availableSeats: number;
  driverName?: string;
  driverRating?: number;
  hasBooking?: boolean;
}

const RideCard = ({
  id,
  fromLocation,
  toLocation,
  departureDate,
  departureTime,
  price,
  availableSeats,
  driverName,
  driverRating,
  hasBooking,
}: RideCardProps) => {
  const router = useRouter();

  const viewRideDetails = () => {
    router.push(`/rides/${id}`);
  };

  // Ensure departureDate is a valid Date object
  const parsedDate = (() => {
    try {
      if (departureDate instanceof Date && !isNaN(departureDate.getTime())) {
        return departureDate;
      }
      const dateFromString = new Date(departureDate);
      if (!isNaN(dateFromString.getTime())) {
        return dateFromString;
      }
      console.error("Invalid date provided to RideCard:", departureDate);
      return new Date(); // Fallback to current date if invalid
    } catch (err) {
      console.error("Error parsing departure date:", err);
      return new Date(); // Fallback to current date
    }
  })();

  // Safely format the date
  const formattedDate = (() => {
    try {
      return format(parsedDate, "dd MMM yyyy");
    } catch (err) {
      console.error("Error formatting date:", err);
      return "Unknown date";
    }
  })();

  // Safely format the price
  const formattedPrice = (() => {
    try {
      if (typeof price !== "number" || isNaN(price)) {
        return "0.00";
      }
      return price.toFixed(2);
    } catch (err) {
      console.error("Error formatting price:", err);
      return "0.00";
    }
  })();

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 hover:shadow-md transition-shadow"
      onClick={viewRideDetails}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-1.5 text-gray-700 mb-1">
            <Calendar size={14} className="text-gray-500" />
            <span className="text-xs">{formattedDate}</span>
            <Clock size={14} className="text-gray-500 ml-2" />
            <span className="text-xs">{departureTime}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-700 mb-1">
            <Users size={14} className="text-gray-500" />
            <span className="text-xs">
              {availableSeats} {availableSeats === 1 ? "seat" : "seats"}{" "}
              available
            </span>
          </div>
          {hasBooking && (
            <div className="text-xs text-blue-600 font-medium mt-1">
              You have a booking for this ride
            </div>
          )}
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1 text-green-700 font-semibold">
            <IndianRupee size={16} />
            <span>{formattedPrice}</span>
          </div>
          {driverName && (
            <div className="text-xs text-gray-600 mt-1">
              {driverName} {driverRating ? `⭐ ${driverRating.toFixed(1)}` : ""}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center mb-1">
        <div className="w-1 h-1 rounded-full bg-green-500 mr-2"></div>
        <div className="text-sm font-medium text-gray-800 truncate flex-1">
          {fromLocation}
        </div>
      </div>

      <div className="w-0.5 h-3 bg-gray-300 ml-2.5 my-0.5"></div>

      <div className="flex items-center mb-2">
        <div className="w-1 h-1 rounded-full bg-red-500 mr-2"></div>
        <div className="text-sm font-medium text-gray-800 truncate flex-1">
          {toLocation}
        </div>
      </div>

      <div className="mt-3 flex justify-end">
        <button
          className="text-xs text-blue-600 flex items-center"
          onClick={(e) => {
            e.stopPropagation();
            viewRideDetails();
          }}
        >
          View details
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default RideCard;
