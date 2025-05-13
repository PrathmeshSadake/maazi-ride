"use client";

import Loader from "@/components/loader";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  isVerified: boolean;
  createdAt: string;
  drivingLicenseUrl: string | null;
  vehicleRegistrationUrl: string | null;
  insuranceUrl: string | null;
  ridesCompleted: number;
  driverRating: number | null;
  vehicle: {
    make: string;
    model: string;
    year: number | null;
    color: string | null;
    licensePlate: string | null;
    vehicleImages: string[] | null;
  } | null;
}

const fetchDriver = async (id: string): Promise<Driver> => {
  const response = await fetch(`/api/drivers/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch driver");
  }

  return response.json();
};

const verifyDriver = async ({
  id,
  verified,
}: {
  id: string;
  verified: boolean;
}) => {
  const response = await fetch(`/api/drivers/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ verified }),
  });

  if (!response.ok) {
    throw new Error("Failed to update driver");
  }

  return response.json();
};

const DriverDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const driverId = params.id as string;

  const {
    data: driver,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["driver", driverId],
    queryFn: () => fetchDriver(driverId),
  });

  const verifyMutation = useMutation({
    mutationFn: verifyDriver,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driver", driverId] });
      setShowConfirmModal(false);
    },
  });

  if (isLoading) return <Loader />;
  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p>{error.message}</p>
        </div>
      </div>
    );
  if (!driver)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Not Found</h2>
          <p>Driver not found</p>
        </div>
      </div>
    );

  const handleVerify = () => {
    setShowConfirmModal(true);
  };

  const confirmVerify = () => {
    verifyMutation.mutate({ id: driverId, verified: !driver.isVerified });
  };

  const openImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Drivers List
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {driver.firstName} {driver.lastName}
                </h1>
                <div className="mt-2 flex items-center">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      driver.isVerified
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {driver.isVerified ? "Verified" : "Unverified"}
                  </span>
                  {driver.driverRating && (
                    <div className="ml-4 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-yellow-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 15.585l-5.995 3.158 1.146-6.67L.293 7.24l6.676-.97L10 0l3.03 6.27 6.677.97-4.858 4.834 1.146 6.67L10 15.585z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="ml-1 font-medium">
                        {driver.driverRating.toFixed(1)}
                      </span>
                    </div>
                  )}
                  <div className="ml-4 text-gray-500 text-sm">
                    ID: {driver.id}
                  </div>
                </div>
              </div>
              <button
                onClick={handleVerify}
                className={`px-5 py-2 rounded-md font-medium shadow-sm ${
                  driver.isVerified
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {driver.isVerified ? "Unverify Driver" : "Verify Driver"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg border p-5 h-full">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
                  Driver Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="mt-1">{driver.email || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Phone Number
                    </p>
                    <p className="mt-1">{driver.phoneNumber || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Member Since
                    </p>
                    <p className="mt-1">
                      {new Date(driver.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Rides Completed
                    </p>
                    <p className="mt-1 font-semibold text-lg">
                      {driver.ridesCompleted}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="bg-white rounded-lg border p-5 h-full">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
                  Vehicle Information
                </h2>
                {driver.vehicle ? (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Vehicle
                            </p>
                            <p className="mt-1 font-medium">
                              {driver.vehicle.make} {driver.vehicle.model}
                            </p>
                          </div>
                          {driver.vehicle.year && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">
                                Year
                              </p>
                              <p className="mt-1">{driver.vehicle.year}</p>
                            </div>
                          )}
                          {driver.vehicle.color && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">
                                Color
                              </p>
                              <div className="flex items-center mt-1">
                                <div
                                  className="w-6 h-6 rounded-full mr-2"
                                  style={{
                                    backgroundColor:
                                      driver.vehicle.color.toLowerCase(),
                                  }}
                                ></div>
                                <span>{driver.vehicle.color}</span>
                              </div>
                            </div>
                          )}
                          {driver.vehicle.licensePlate && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">
                                License Plate
                              </p>
                              <p className="mt-1">
                                {driver.vehicle.licensePlate}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <p className="text-sm font-medium text-gray-500">
                          Vehicle Images
                        </p>
                        {driver.vehicle.vehicleImages &&
                        driver.vehicle.vehicleImages.length > 0 ? (
                          <div className="grid grid-cols-2 gap-2">
                            {driver.vehicle.vehicleImages.map(
                              (imageUrl, index) => (
                                <div
                                  key={index}
                                  className="relative h-32 rounded-lg overflow-hidden cursor-pointer border hover:border-blue-500 transition-colors"
                                  onClick={() => openImageModal(imageUrl)}
                                >
                                  <Image
                                    src={imageUrl}
                                    alt={`Vehicle image ${index + 1}`}
                                    fill
                                    style={{ objectFit: "cover" }}
                                  />
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500">No images available</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No vehicle information</p>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 border-t">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Verification Documents
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DocumentCard
                title="Driving License"
                url={driver.drivingLicenseUrl}
              />
              <DocumentCard
                title="Vehicle Registration"
                url={driver.vehicleRegistrationUrl}
              />
              <DocumentCard title="Insurance" url={driver.insuranceUrl} />
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h2 className="text-xl font-semibold mb-4">
              {driver.isVerified ? "Unverify Driver" : "Verify Driver"}
            </h2>
            <p className="mb-6">
              Are you sure you want to{" "}
              {driver.isVerified ? "unverify" : "verify"} this driver?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmVerify}
                className={`px-4 py-2 rounded-md ${
                  driver.isVerified
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
                disabled={verifyMutation.isPending}
              >
                {verifyMutation.isPending ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={closeImageModal}
        >
          <div className="relative max-w-4xl w-full h-full max-h-screen p-4 flex items-center justify-center">
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 p-2 rounded-full bg-white text-gray-800 hover:bg-gray-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={selectedImage}
                alt="Vehicle image full view"
                width={1000}
                height={800}
                className="object-contain max-h-screen"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Document Card Component
const DocumentCard = ({
  title,
  url,
}: {
  title: string;
  url: string | null;
}) => {
  return (
    <div className="border rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-md bg-blue-50 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>
          <div className="ml-4">
            <h3 className="font-medium">{title}</h3>
            {url ? (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center mt-2 text-blue-600 hover:text-blue-800"
              >
                <span className="mr-1">View Document</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            ) : (
              <p className="text-gray-500 text-sm mt-2">Not submitted</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDetailPage;
