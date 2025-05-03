"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Car, FileText, AlertTriangle } from "lucide-react";
import { useUser } from "@clerk/nextjs";

// Temporary type for vehicle data
interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  vehicleImages: string[];
}

export default function VehiclePage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVehicleData = async () => {
      if (!isLoaded || !user) return;

      try {
        // Fetch vehicle data from your API
        const response = await fetch(`/api/drivers/${user.id}/vehicle`);

        if (!response.ok) {
          if (response.status === 404) {
            // No vehicle found, but not an error
            setVehicle(null);
          } else {
            throw new Error("Failed to load vehicle information");
          }
        } else {
          const data = await response.json();
          setVehicle(data);
        }
      } catch (err) {
        console.error("Error fetching vehicle:", err);
        setError("Failed to load vehicle information. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicleData();
  }, [isLoaded, user]);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 mr-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">My Vehicle</h1>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p>Loading vehicle information...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 rounded-lg shadow p-6">
          <div className="flex items-center">
            <AlertTriangle className="text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      ) : vehicle ? (
        <div className="bg-white rounded-lg shadow">
          {/* Vehicle Images */}
          <div className="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden">
            {vehicle.vehicleImages && vehicle.vehicleImages.length > 0 ? (
              <img
                src={vehicle.vehicleImages[0]}
                alt={`${vehicle.make} ${vehicle.model}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                <Car size={64} />
              </div>
            )}
          </div>

          {/* Vehicle Details */}
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {vehicle.make} {vehicle.model} ({vehicle.year})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-gray-500 text-sm mb-1">Make</div>
                <p className="font-medium">{vehicle.make}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-gray-500 text-sm mb-1">Model</div>
                <p className="font-medium">{vehicle.model}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-gray-500 text-sm mb-1">Year</div>
                <p className="font-medium">{vehicle.year}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-gray-500 text-sm mb-1">Color</div>
                <p className="font-medium">{vehicle.color}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-gray-500 text-sm mb-1">License Plate</div>
                <p className="font-medium">{vehicle.licensePlate}</p>
              </div>
            </div>

            {/* Additional Images */}
            {vehicle.vehicleImages && vehicle.vehicleImages.length > 1 && (
              <div className="mt-4">
                <h3 className="text-md font-medium text-gray-700 mb-2">
                  Additional Photos
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {vehicle.vehicleImages.slice(1).map((image, index) => (
                    <div
                      key={index}
                      className="h-24 bg-gray-200 rounded-lg overflow-hidden"
                    >
                      <img
                        src={image}
                        alt={`Vehicle image ${index + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Update button */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => router.push("/drivers/onboarding/vehicle")}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Update Vehicle Information
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Car size={64} className="text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              No Vehicle Information
            </h2>
            <p className="text-gray-500 mb-6">
              You haven't added any vehicle information yet. Please add your
              vehicle details to continue.
            </p>
            <button
              onClick={() => router.push("/drivers/onboarding/vehicle")}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Add Vehicle
            </button>
          </div>
        </div>
      )}

      {/* Documents Section */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <FileText className="text-gray-500 mr-2" />
          <h2 className="text-xl font-semibold">Vehicle Documents</h2>
        </div>

        <div className="flex flex-col items-center justify-center py-6 text-center">
          <p className="text-gray-500 mb-4">
            View and manage your vehicle-related documents in the Documents
            section.
          </p>
          <button
            onClick={() => router.push("/drivers/account/documents")}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Go to Documents
          </button>
        </div>
      </div>
    </div>
  );
}
