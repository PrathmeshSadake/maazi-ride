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
  isCommercial: boolean;
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
      isCommercial: false,
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
              isCommercial: (driver.vehicle as any).isCommercial || false,
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
            isCommercial: formData.vehicle.isCommercial,
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

                {/* Vehicle Type Selection */}
                <div className="space-y-4 mt-6">
                  <h3 className="text-lg font-medium">Vehicle Type</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id="non-commercial"
                        name="vehicle.isCommercial"
                        value="false"
                        checked={!formData.vehicle.isCommercial}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            vehicle: {
                              ...formData.vehicle,
                              isCommercial: false,
                            },
                          });
                        }}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="non-commercial"
                        className="text-sm font-medium"
                      >
                        Non-Commercial Vehicle
                      </label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id="commercial"
                        name="vehicle.isCommercial"
                        value="true"
                        checked={formData.vehicle.isCommercial}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            vehicle: {
                              ...formData.vehicle,
                              isCommercial: true,
                            },
                          });
                        }}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="commercial"
                        className="text-sm font-medium"
                      >
                        Commercial Vehicle
                      </label>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Commercial vehicles</strong> include taxis,
                      ride-sharing vehicles, delivery trucks, etc.
                      <br />
                      <strong>Non-commercial vehicles</strong> are personal
                      vehicles used for ridesharing.
                    </p>
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
                Upload clear, high-quality images of your vehicle. At least 2
                images are required (maximum 4).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Upload Guidelines */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">
                  Photo Guidelines
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Take photos in good lighting conditions</li>
                  <li>• Include front, back, and side views of your vehicle</li>
                  <li>• Ensure license plate is clearly visible</li>
                  <li>• Avoid blurry or dark images</li>
                </ul>
              </div>

              {/* Upload Zone */}
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        Upload Vehicle Photos
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Drag and drop your images here, or click to browse
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const element =
                            document.getElementById("vehicle-images");
                          if (element) element.click();
                        }}
                        className="mb-2"
                      >
                        Choose Files
                      </Button>
                      <p className="text-xs text-gray-400">
                        Supports: JPG, PNG, HEIC (Max 10MB each)
                      </p>
                    </div>
                  </div>
                  <input
                    id="vehicle-images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleVehicleImageChange}
                    className="hidden"
                  />
                </div>

                {/* Progress Indicator */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {vehicleImageUrls.length} of 4 images uploaded
                  </span>
                  <span className="text-gray-500">Minimum 2 required</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        (vehicleImageUrls.length / 4) * 100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Image Preview Grid */}
              {vehicleImageUrls.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Uploaded Images</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                    {vehicleImageUrls.map((url, index) => (
                      <div
                        key={index}
                        className="relative group bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="aspect-video relative">
                          <img
                            src={url}
                            alt={`Vehicle Image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {/* Remove Button */}
                          <button
                            onClick={() => removeVehicleImage(index)}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            title="Remove image"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                          {/* Image Number Badge */}
                          <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                            {index + 1}
                          </div>
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-medium text-gray-900">
                            Image {index + 1}
                          </p>
                          <p className="text-xs text-gray-500">
                            Click to view full size
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Empty slots */}
                    {Array.from({ length: 4 - vehicleImageUrls.length }).map(
                      (_, index) => (
                        <div
                          key={`empty-${index}`}
                          className="relative bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg overflow-hidden"
                        >
                          <div className="aspect-video flex items-center justify-center">
                            <div className="text-center">
                              <svg
                                className="w-8 h-8 text-gray-400 mx-auto mb-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              <p className="text-xs text-gray-400">
                                {index === 0 && vehicleImageUrls.length === 0
                                  ? "Add your first image"
                                  : "Optional"}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Status Messages */}
              {vehicleImageUrls.length > 0 && (
                <div className="space-y-2">
                  {vehicleImageUrls.length < 2 && (
                    <div className="flex items-center space-x-2 text-amber-600">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm">
                        Upload at least {2 - vehicleImageUrls.length} more
                        image(s) to continue
                      </span>
                    </div>
                  )}
                  {vehicleImageUrls.length >= 2 && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm">
                        Great! You have enough images to proceed
                      </span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handlePrevStep}>
                Previous Step
              </Button>
              <Button
                variant="default"
                onClick={handleNextStep}
                disabled={vehicleImageUrls.length < 2}
                className={
                  vehicleImageUrls.length >= 2
                    ? "bg-green-600 hover:bg-green-700"
                    : ""
                }
              >
                {vehicleImageUrls.length >= 2
                  ? "Continue"
                  : `Upload ${2 - vehicleImageUrls.length} more image(s)`}
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

                      <p className="text-sm text-gray-500">Vehicle Type:</p>
                      <p>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            formData.vehicle.isCommercial
                              ? "bg-orange-100 text-orange-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {formData.vehicle.isCommercial
                            ? "Commercial"
                            : "Non-Commercial"}
                        </span>
                      </p>
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

  // Check if driver has submitted all documents for verification
  const hasSubmittedAllDocuments = () => {
    if (!driver) return false;

    const hasDocuments =
      driver.drivingLicenseUrl &&
      driver.vehicleRegistrationUrl &&
      driver.insuranceUrl;

    const hasVehicleInfo =
      driver.vehicle &&
      driver.vehicle.make &&
      driver.vehicle.model &&
      driver.vehicle.year &&
      driver.vehicle.color &&
      driver.vehicle.licensePlate;

    const hasVehicleImages =
      driver.vehicle?.vehicleImages && driver.vehicle.vehicleImages.length >= 2;

    return hasDocuments && hasVehicleInfo && hasVehicleImages;
  };

  // Redirect verified drivers to dashboard
  useEffect(() => {
    if (!driverLoading && driver?.isVerified) {
      router.push("/drivers");
    }
  }, [driver?.isVerified, driverLoading, router]);

  // Redirect to verification pending page if documents are submitted but not verified
  useEffect(() => {
    if (
      !driverLoading &&
      driver &&
      !driver.isVerified &&
      hasSubmittedAllDocuments()
    ) {
      router.push("/drivers/verification-pending");
    }
  }, [driver, driverLoading, router]);

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
            <Link href="/drivers">
              <Button>Go to Driver Dashboard</Button>
            </Link>
          </div>
        ) : hasSubmittedAllDocuments() ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-blue-800 mb-2">
              Verification in Progress
            </h2>
            <p className="text-blue-700 mb-4">
              Your documents have been submitted and are under review. This
              process usually takes 1-3 business days.
            </p>
            <Link href="/drivers/verification-pending">
              <Button variant="outline">View Status</Button>
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

        {/* Only show onboarding form if not verified and haven't submitted all documents */}
        {!driver?.isVerified && !hasSubmittedAllDocuments() && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
