"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { RoleManager } from "@/components/RoleManager";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";
import { redirect, useRouter } from "next/navigation";
import axios from "axios";
import { useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";
import { useDriverData } from "@/hooks/useDriverData";
// Types
interface VehicleData {
  make: string;
  model: string;
  year: string;
  color: string;
  licensePlate: string;
}

interface FormData {
  drivingLicenseUrl: string;
  vehicleRegistrationUrl: string;
  insuranceUrl: string;
  vehicle: VehicleData;
}

interface FileState {
  drivingLicense: File | null;
  vehicleRegistration: File | null;
  insurance: File | null;
}

interface UploadingState {
  drivingLicense: boolean;
  vehicleRegistration: boolean;
  insurance: boolean;
}

type FileType = "drivingLicense" | "vehicleRegistration" | "insurance";

export default function DriverOnboarding() {
  const { data: session, status } = useSession();
  const {
    driver,
    loading: driverLoading,
    error: driverError,
    refetch,
  } = useDriverData();

  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileNames, setFileNames] = useState({
    drivingLicense: "",
    vehicleRegistration: "",
    insurance: "",
  });

  // Form data state
  const [formData, setFormData] = useState<FormData>({
    // Document URLs
    drivingLicenseUrl: "",
    vehicleRegistrationUrl: "",
    insuranceUrl: "",
    // Vehicle information
    vehicle: {
      make: "",
      model: "",
      year: "",
      color: "",
      licensePlate: "",
    },
  });

  // File state
  const [files, setFiles] = useState<FileState>({
    drivingLicense: null,
    vehicleRegistration: null,
    insurance: null,
  });

  // Loading states for file uploads
  const [uploading, setUploading] = useState<UploadingState>({
    drivingLicense: false,
    vehicleRegistration: false,
    insurance: false,
  });

  // Add a new state for vehicle images
  const [vehicleImages, setVehicleImages] = useState<File[]>([]);
  const [vehicleImageUrls, setVehicleImageUrls] = useState<string[]>([]);

  // Pre-populate form data when driver data is loaded
  useEffect(() => {
    if (driver) {
      setFormData((prev) => ({
        ...prev,
        drivingLicenseUrl: driver.drivingLicenseUrl || "",
        vehicleRegistrationUrl: driver.vehicleRegistrationUrl || "",
        insuranceUrl: driver.insuranceUrl || "",
        vehicle: driver.vehicle
          ? {
              make: driver.vehicle.make || "",
              model: driver.vehicle.model || "",
              year: driver.vehicle.year?.toString() || "",
              color: driver.vehicle.color || "",
              licensePlate: driver.vehicle.licensePlate || "",
            }
          : prev.vehicle,
      }));

      // Set vehicle images if they exist
      if (driver.vehicle?.vehicleImages) {
        setVehicleImageUrls(driver.vehicle.vehicleImages);
      }
    }
  }, [driver]);

  const handleNextStep = () => {
    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setStep((prev) => prev - 1);
  };

  // Handle form input change
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      if (parent === "vehicle" && parent in formData) {
        setFormData({
          ...formData,
          vehicle: {
            ...formData.vehicle,
            [child]: value,
          },
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      } as FormData);
    }
  };

  // Handle file change
  const handleFileChange = async (
    e: ChangeEvent<HTMLInputElement>,
    fileType: FileType
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Update files state and filename
    setFiles((prev) => ({
      ...prev,
      [fileType]: file,
    }));

    setFileNames((prev) => ({
      ...prev,
      [fileType]: file.name,
    }));

    // Upload the file
    await uploadFile(file, fileType);
  };

  // Upload file to the server
  const uploadFile = async (file: File, fileType: FileType) => {
    // Map fileType to the corresponding URL property in formData
    const urlMap: Record<FileType, keyof FormData> = {
      drivingLicense: "drivingLicenseUrl",
      vehicleRegistration: "vehicleRegistrationUrl",
      insurance: "insuranceUrl",
    };

    setUploading((prev) => ({ ...prev, [fileType]: true }));

    try {
      const formDataObj = new FormData();
      formDataObj.append("file", file);

      // Now try to upload the file
      const { data } = await axios.post("/api/upload-docs", formDataObj);

      // Always try to parse the response as JSON, even if it's an error

      if (!data.url) {
        throw new Error("Server response missing URL for uploaded file");
      }

      // Update formData with the URL
      setFormData((prev) => ({
        ...prev,
        [urlMap[fileType]]: data.url,
      }));

      toast.success(`${fileType} uploaded successfully`);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error(
        `Failed to upload ${fileType}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setUploading((prev) => ({ ...prev, [fileType]: false }));
    }
  };

  // Submit all data to the API
  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      console.log("formData", formData);
      console.log("vehicleImageUrls", vehicleImageUrls);
      const response = await fetch("/api/drivers/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          vehicle: {
            ...formData.vehicle,
            images: vehicleImageUrls,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      toast.success("Profile updated successfully");

      // Refetch verification data to get updated status
      await refetch();

      router.refresh();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if documents step is complete
  const isDocumentsComplete = () => {
    return (
      formData.drivingLicenseUrl &&
      formData.vehicleRegistrationUrl &&
      formData.insuranceUrl
    );
  };

  // Check if vehicle step is complete
  const isVehicleComplete = () => {
    const v = formData.vehicle;
    return v.make && v.model && v.year && v.color && v.licensePlate;
  };

  // Handle vehicle image change
  const handleVehicleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    setVehicleImages((prev) => [...prev, ...newFiles]);

    try {
      // Upload each file and update URLs
      const newUrls = await Promise.all(
        newFiles.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error("Failed to upload image");
          }

          const data = await response.json();
          return data.url;
        })
      );

      // Append new URLs to the existing list
      setVehicleImageUrls((prev) => [...prev, ...newUrls]);
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Failed to upload one or more images");

      // Remove the failed uploads from the vehicleImages array
      setVehicleImages((prev) => prev.slice(0, prev.length - newFiles.length));
    }
  };

  // Remove a vehicle image
  const removeVehicleImage = (index: number) => {
    setVehicleImages((prev) => prev.filter((_, i) => i !== index));
    setVehicleImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Render different steps based on current step
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Upload Required Documents</CardTitle>
              <CardDescription>
                These documents are required for driver verification. All files
                must be clear and legible.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Driver's License</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Upload a photo of your valid driver's license (front and back)
                </p>
                {formData.drivingLicenseUrl ? (
                  <div className="flex flex-col space-y-2">
                    <div className="text-green-600 flex items-center">
                      <span className="mr-2">✓</span>
                      <span className="text-sm truncate">
                        {fileNames.drivingLicense || "File uploaded"}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const element =
                          document.getElementById("drivingLicense");
                        if (element) element.click();
                      }}
                    >
                      Replace
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const element =
                          document.getElementById("drivingLicense");
                        if (element) element.click();
                      }}
                      disabled={uploading.drivingLicense}
                      className="relative"
                    >
                      {uploading.drivingLicense ? (
                        <div className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Uploading...
                        </div>
                      ) : (
                        "Upload License"
                      )}
                    </Button>
                    {files.drivingLicense && uploading.drivingLicense && (
                      <p className="text-sm text-gray-500 truncate">
                        {fileNames.drivingLicense}
                      </p>
                    )}
                  </div>
                )}
                <input
                  id="drivingLicense"
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "drivingLicense")}
                />
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Vehicle Registration</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Upload the vehicle registration document
                </p>
                {formData.vehicleRegistrationUrl ? (
                  <div className="flex flex-col space-y-2">
                    <div className="text-green-600 flex items-center">
                      <span className="mr-2">✓</span>
                      <span className="text-sm truncate">
                        {fileNames.vehicleRegistration || "File uploaded"}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const element = document.getElementById(
                          "vehicleRegistration"
                        );
                        if (element) element.click();
                      }}
                    >
                      Replace
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const element = document.getElementById(
                          "vehicleRegistration"
                        );
                        if (element) element.click();
                      }}
                      disabled={uploading.vehicleRegistration}
                      className="relative"
                    >
                      {uploading.vehicleRegistration ? (
                        <div className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Uploading...
                        </div>
                      ) : (
                        "Upload Registration"
                      )}
                    </Button>
                    {files.vehicleRegistration &&
                      uploading.vehicleRegistration && (
                        <p className="text-sm text-gray-500 truncate">
                          {fileNames.vehicleRegistration}
                        </p>
                      )}
                  </div>
                )}
                <input
                  id="vehicleRegistration"
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "vehicleRegistration")}
                />
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Insurance Document</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Upload proof of valid insurance coverage
                </p>
                {formData.insuranceUrl ? (
                  <div className="flex flex-col space-y-2">
                    <div className="text-green-600 flex items-center">
                      <span className="mr-2">✓</span>
                      <span className="text-sm truncate">
                        {fileNames.insurance || "File uploaded"}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const element = document.getElementById("insurance");
                        if (element) element.click();
                      }}
                    >
                      Replace
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const element = document.getElementById("insurance");
                        if (element) element.click();
                      }}
                      disabled={uploading.insurance}
                      className="relative"
                    >
                      {uploading.insurance ? (
                        <div className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Uploading...
                        </div>
                      ) : (
                        "Upload Insurance"
                      )}
                    </Button>
                    {files.insurance && uploading.insurance && (
                      <p className="text-sm text-gray-500 truncate">
                        {fileNames.insurance}
                      </p>
                    )}
                  </div>
                )}
                <input
                  id="insurance"
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "insurance")}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="default"
                onClick={handleNextStep}
                disabled={!isDocumentsComplete()}
              >
                Next Step
              </Button>
            </CardFooter>
          </Card>
        );
      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Information</CardTitle>
              <CardDescription>
                Provide details about the vehicle you'll be using
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Make</label>
                    <input
                      type="text"
                      name="vehicle.make"
                      className="w-full p-2 border rounded-md"
                      placeholder="e.g. Toyota"
                      value={formData.vehicle.make}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Model</label>
                    <input
                      type="text"
                      name="vehicle.model"
                      className="w-full p-2 border rounded-md"
                      placeholder="e.g. Camry"
                      value={formData.vehicle.model}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Year</label>
                    <input
                      type="number"
                      name="vehicle.year"
                      className="w-full p-2 border rounded-md"
                      placeholder="e.g. 2019"
                      value={formData.vehicle.year}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Color</label>
                    <input
                      type="text"
                      name="vehicle.color"
                      className="w-full p-2 border rounded-md"
                      placeholder="e.g. Silver"
                      value={formData.vehicle.color}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">License Plate</label>
                    <input
                      type="text"
                      name="vehicle.licensePlate"
                      className="w-full p-2 border rounded-md"
                      placeholder="e.g. ABC123"
                      value={formData.vehicle.licensePlate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handlePrevStep}>
                Previous Step
              </Button>
              <Button
                variant="default"
                onClick={handleNextStep}
                disabled={!isVehicleComplete()}
              >
                Next Step
              </Button>
            </CardFooter>
          </Card>
        );
      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Upload Vehicle Images</CardTitle>
              <CardDescription>
                Upload images of your vehicle. At least 2 images are required,
                and you can upload up to 4.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleVehicleImageChange}
                  className="mb-4"
                />
                <div className="grid grid-cols-2 gap-4">
                  {vehicleImageUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Vehicle Image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-md"
                      />
                      <button
                        onClick={() => removeVehicleImage(index)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handlePrevStep}>
                Previous Step
              </Button>
              <Button
                variant="default"
                onClick={handleNextStep}
                disabled={vehicleImageUrls.length < 2}
              >
                Next Step
              </Button>
            </CardFooter>
          </Card>
        );
      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Confirm Your Information</CardTitle>
              <CardDescription>
                Please review all information before submitting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-medium">Documents</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="border rounded-lg p-4">
                      <p className="font-medium">Driver's License</p>
                      {formData.drivingLicenseUrl ? (
                        <p className="text-green-600">✓ Uploaded</p>
                      ) : (
                        <p className="text-red-600">Not uploaded</p>
                      )}
                    </div>
                    <div className="border rounded-lg p-4">
                      <p className="font-medium">Vehicle Registration</p>
                      {formData.vehicleRegistrationUrl ? (
                        <p className="text-green-600">✓ Uploaded</p>
                      ) : (
                        <p className="text-red-600">Not uploaded</p>
                      )}
                    </div>
                    <div className="border rounded-lg p-4">
                      <p className="font-medium">Insurance</p>
                      {formData.insuranceUrl ? (
                        <p className="text-green-600">✓ Uploaded</p>
                      ) : (
                        <p className="text-red-600">Not uploaded</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Vehicle Information</h3>
                  <div className="border rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-2">
                      <p className="text-sm text-gray-500">Make:</p>
                      <p>{formData.vehicle.make}</p>

                      <p className="text-sm text-gray-500">Model:</p>
                      <p>{formData.vehicle.model}</p>

                      <p className="text-sm text-gray-500">Year:</p>
                      <p>{formData.vehicle.year}</p>

                      <p className="text-sm text-gray-500">Color:</p>
                      <p>{formData.vehicle.color}</p>

                      <p className="text-sm text-gray-500">License Plate:</p>
                      <p>{formData.vehicle.licensePlate}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Vehicle Images</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {vehicleImageUrls.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Vehicle Image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-md"
                      />
                    ))}
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-amber-50">
                  <p className="text-amber-800">
                    By submitting this information, you confirm that all
                    provided details are accurate. After submission, your
                    application will be reviewed by our team.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handlePrevStep}>
                Edit Information
              </Button>
              <Button
                variant="default"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </CardFooter>
          </Card>
        );
      default:
        return null;
    }
  };

  // Redirect verified drivers to dashboard
  useEffect(() => {
    if (!driverLoading && driver?.isVerified) {
      // router.push("/drivers");
    }
  }, [driver?.isVerified, driverLoading, router]);

  // Show loading state while driver data is being fetched
  if (status === "loading" || driverLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Loading...</h1>
          <p>Checking your verification status...</p>
        </div>
      </div>
    );
  }

  // Show error state if there's an error
  if (driverError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Error</h1>
          <p className="text-red-600 mb-4">{driverError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Driver Onboarding</h1>

        {driver?.isVerified ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-green-800 mb-2">
              Your account is verified!
            </h2>
            <p className="text-green-700 mb-4">
              You can now start offering rides on the platform.
            </p>
            <Link href="/drivers/main">
              <Button>Go to Driver Dashboard</Button>
            </Link>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-amber-800 mb-2">
              Your account needs verification
            </h2>
            <p className="text-amber-700 mb-4">
              Complete the steps below to get verified as a driver.
            </p>
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="w-full flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= 1 ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}
              >
                1
              </div>
              <div
                className={`flex-1 h-1 mx-2 ${
                  step > 1 ? "bg-blue-500" : "bg-gray-200"
                }`}
              ></div>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= 2 ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}
              >
                2
              </div>
              <div
                className={`flex-1 h-1 mx-2 ${
                  step > 2 ? "bg-blue-500" : "bg-gray-200"
                }`}
              ></div>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= 3 ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}
              >
                3
              </div>
              <div
                className={`flex-1 h-1 mx-2 ${
                  step > 3 ? "bg-blue-500" : "bg-gray-200"
                }`}
              ></div>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= 4 ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}
              >
                4
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <div className="text-center w-20">Documents</div>
            <div className="text-center w-20">Vehicle</div>
            <div className="text-center w-20">Images</div>
            <div className="text-center w-20">Confirm</div>
          </div>
        </div>

        {/* Form Content */}
        {renderStepContent()}
      </div>
    </div>
  );
}
