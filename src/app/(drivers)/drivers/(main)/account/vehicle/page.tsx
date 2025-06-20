"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Car,
  FileText,
  AlertTriangle,
  ChevronRight,
  Plus,
  Edit3,
} from "lucide-react";
import { useSession } from "next-auth/react";

// Type for vehicle data from database
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
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVehicleData = async () => {
      if (status === "loading") return;

      if (status === "unauthenticated") {
        router.push("/auth/signin");
        return;
      }

      try {
        // Fetch vehicle data from API
        const response = await fetch(
          `/api/drivers/${session?.user?.id}/vehicle`
        );

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
  }, [status, session, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white px-4 pt-8 pb-4">
          <div className="h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
        </div>
        <div className="px-4 space-y-4">
          <div className="bg-white rounded-xl p-4">
            <div className="h-32 bg-gray-200 rounded-lg animate-pulse mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white px-4 pt-8 pb-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.back()}
              className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">My Vehicle</h1>
          </div>
        </div>

        <div className="px-4">
          <div className="bg-red-50 rounded-xl p-4 border border-red-100">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-red-800 font-medium text-sm">
                  Error Loading Vehicle
                </p>
                <p className="text-red-600 text-xs mt-0.5">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white">
        <div className="flex items-center justify-between px-4 pt-8 pb-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.back()}
              className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">My Vehicle</h1>
          </div>

          {vehicle && (
            <button
              onClick={() => router.push("/drivers/onboarding/vehicle")}
              className="px-3 py-1.5 text-sm text-blue-500 bg-blue-50 rounded-full flex items-center space-x-1"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          )}
        </div>
      </div>

      <div className="px-4 pb-6 space-y-4">
        {vehicle ? (
          <>
            {/* Vehicle Main Card */}
            <div className="bg-white rounded-xl overflow-hidden">
              {/* Vehicle Image */}
              <div className="relative h-48 bg-gray-200">
                {vehicle.vehicleImages && vehicle.vehicleImages.length > 0 ? (
                  <img
                    src={vehicle.vehicleImages[0]}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                    <Car size={48} />
                  </div>
                )}

                {/* Overlay with vehicle name */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <h2 className="text-white text-lg font-semibold">
                    {vehicle.make} {vehicle.model}
                  </h2>
                  <p className="text-white/80 text-sm">{vehicle.year}</p>
                </div>
              </div>

              {/* Vehicle Details */}
              <div className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-gray-500 text-xs mb-1">Make</div>
                    <p className="font-medium text-sm">{vehicle.make}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-gray-500 text-xs mb-1">Model</div>
                    <p className="font-medium text-sm">{vehicle.model}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-gray-500 text-xs mb-1">Year</div>
                    <p className="font-medium text-sm">{vehicle.year}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-gray-500 text-xs mb-1">Color</div>
                    <p className="font-medium text-sm">{vehicle.color}</p>
                  </div>
                </div>

                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-gray-500 text-xs mb-1">
                    License Plate
                  </div>
                  <p className="font-medium text-sm">{vehicle.licensePlate}</p>
                </div>
              </div>
            </div>

            {/* Additional Images */}
            {vehicle.vehicleImages && vehicle.vehicleImages.length > 1 && (
              <div className="bg-white rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h3 className="text-base font-semibold text-gray-900">
                    Additional Photos
                  </h3>
                </div>

                <div className="p-4">
                  <div className="grid grid-cols-3 gap-2">
                    {vehicle.vehicleImages.slice(1).map((image, index) => (
                      <div
                        key={index}
                        className="aspect-square bg-gray-200 rounded-lg overflow-hidden"
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
              </div>
            )}
          </>
        ) : (
          /* No Vehicle State */
          <div className="bg-white rounded-xl p-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Car size={32} className="text-gray-400" />
              </div>
              <h2 className="text-lg font-semibold mb-2 text-gray-900">
                No Vehicle Information
              </h2>
              <p className="text-gray-500 mb-6 text-sm">
                You haven't added any vehicle information yet. Please add your
                vehicle details to continue.
              </p>
              <button
                onClick={() => router.push("/drivers/onboarding/vehicle")}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium flex items-center space-x-2 hover:bg-blue-600 active:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Vehicle</span>
              </button>
            </div>
          </div>
        )}

        {/* Documents Section */}
        <div className="bg-white rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Vehicle Documents
            </h3>
          </div>

          <button
            onClick={() => router.push("/drivers/account/documents")}
            className="w-full flex items-center p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
              <FileText className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium text-gray-900 text-sm">
                Manage Documents
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                View and manage vehicle-related documents
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Quick Actions */}
        {vehicle && (
          <div className="bg-white rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">
                Quick Actions
              </h3>
            </div>

            <div className="p-4 space-y-3">
              <button
                onClick={() => router.push("/drivers/onboarding/vehicle")}
                className="w-full flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 active:bg-blue-200 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <Edit3 className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-blue-900 text-sm">
                    Update Vehicle Info
                  </div>
                  <div className="text-xs text-blue-600 mt-0.5">
                    Edit vehicle details and photos
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-blue-400" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
