"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";


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

  if (isLoading)
    return (
      <div className='flex justify-center items-center min-h-screen'>
        Loading...
      </div>
    );
  if (error)
    return (
      <div className='flex justify-center items-center min-h-screen'>
        Error: {error.message}
      </div>
    );
  if (!driver)
    return (
      <div className='flex justify-center items-center min-h-screen'>
        Driver not found
      </div>
    );

  const handleVerify = () => {
    setShowConfirmModal(true);
  };

  const confirmVerify = () => {
    verifyMutation.mutate({ id: driverId, verified: !driver.isVerified });
  };

  return (
    <div className='p-6'>
      <button
        onClick={() => router.back()}
        className='mb-6 inline-flex items-center text-blue-600 hover:text-blue-800'
      >
        ← Back to Drivers List
      </button>

      <div className='bg-white rounded-lg shadow-md overflow-hidden'>
        <div className='p-6 border-b'>
          <div className='flex justify-between items-center'>
            <h1 className='text-2xl font-bold'>
              {driver.firstName} {driver.lastName}
            </h1>
            <button
              onClick={handleVerify}
              className={`px-4 py-2 rounded-md ${
                driver.isVerified
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {driver.isVerified ? "Unverify Driver" : "Verify Driver"}
            </button>
          </div>

          <div className='mt-2'>
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                driver.isVerified
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {driver.isVerified ? "Verified" : "Unverified"}
            </span>
          </div>
        </div>

        <div className='p-6 grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <h2 className='text-lg font-semibold mb-4'>Driver Information</h2>
            <div className='space-y-3'>
              <div>
                <p className='text-sm text-gray-500'>Email</p>
                <p>{driver.email || "N/A"}</p>
              </div>
              <div>
                <p className='text-sm text-gray-500'>Phone Number</p>
                <p>{driver.phoneNumber || "N/A"}</p>
              </div>
              <div>
                <p className='text-sm text-gray-500'>Member Since</p>
                <p>{new Date(driver.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className='text-sm text-gray-500'>Rides Completed</p>
                <p>{driver.ridesCompleted}</p>
              </div>
              <div>
                <p className='text-sm text-gray-500'>Rating</p>
                <p>
                  {driver.driverRating
                    ? `${driver.driverRating.toFixed(1)} / 5.0`
                    : "No ratings yet"}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className='text-lg font-semibold mb-4'>Vehicle Information</h2>
            {driver.vehicle ? (
              <div className='space-y-3'>
                <div>
                  <p className='text-sm text-gray-500'>Vehicle</p>
                  <p>
                    {driver.vehicle.make} {driver.vehicle.model}
                  </p>
                </div>
                {driver.vehicle.year && (
                  <div>
                    <p className='text-sm text-gray-500'>Year</p>
                    <p>{driver.vehicle.year}</p>
                  </div>
                )}
                {driver.vehicle.color && (
                  <div>
                    <p className='text-sm text-gray-500'>Color</p>
                    <p>{driver.vehicle.color}</p>
                  </div>
                )}
                {driver.vehicle.licensePlate && (
                  <div>
                    <p className='text-sm text-gray-500'>License Plate</p>
                    <p>{driver.vehicle.licensePlate}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className='text-gray-500'>No vehicle information</p>
            )}
          </div>
        </div>

        <div className='p-6 border-t'>
          <h2 className='text-lg font-semibold mb-4'>Verification Documents</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='border rounded-lg p-4'>
              <h3 className='font-medium mb-2'>Driving License</h3>
              {driver.drivingLicenseUrl ? (
                <a
                  href={driver.drivingLicenseUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-600 hover:text-blue-800'
                >
                  View Document
                </a>
              ) : (
                <p className='text-gray-500'>Not submitted</p>
              )}
            </div>

            <div className='border rounded-lg p-4'>
              <h3 className='font-medium mb-2'>Vehicle Registration</h3>
              {driver.vehicleRegistrationUrl ? (
                <a
                  href={driver.vehicleRegistrationUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-600 hover:text-blue-800'
                >
                  View Document
                </a>
              ) : (
                <p className='text-gray-500'>Not submitted</p>
              )}
            </div>

            <div className='border rounded-lg p-4'>
              <h3 className='font-medium mb-2'>Insurance</h3>
              {driver.insuranceUrl ? (
                <a
                  href={driver.insuranceUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-600 hover:text-blue-800'
                >
                  View Document
                </a>
              ) : (
                <p className='text-gray-500'>Not submitted</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 max-w-md w-full'>
            <h2 className='text-xl font-semibold mb-4'>
              {driver.isVerified ? "Unverify Driver" : "Verify Driver"}
            </h2>
            <p className='mb-6'>
              Are you sure you want to{" "}
              {driver.isVerified ? "unverify" : "verify"} this driver?
            </p>
            <div className='flex justify-end space-x-4'>
              <button
                onClick={() => setShowConfirmModal(false)}
                className='px-4 py-2 text-gray-600 hover:text-gray-800'
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
    </div>
  );
};

export default DriverDetailPage;
