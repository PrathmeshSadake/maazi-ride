"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import VehicleInfoStep from "@/components/drivers/onboarding/VehicleInfoStep";
import DocumentsStep from "@/components/drivers/onboarding/DocumentsStep";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const OnboardingPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: "",
    licensePlate: "",
    documents: {
      drivingLicense: null,
      vehicleRegistration: null,
      insurance: null,
    },
  });
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { userId } = useAuth();
  const { user } = useUser();

  const validateCurrentStep = () => {
    const errors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.vehicleMake.trim())
        errors.vehicleMake = "Vehicle make is required";
      if (!formData.vehicleModel.trim())
        errors.vehicleModel = "Vehicle model is required";
      if (!formData.vehicleYear.trim())
        errors.vehicleYear = "Vehicle year is required";
      if (!formData.licensePlate.trim())
        errors.licensePlate = "License plate is required";
    } else if (currentStep === 2) {
      if (!formData.documents.drivingLicense)
        errors.drivingLicense = "Driving license is required";
      if (!formData.documents.vehicleRegistration)
        errors.vehicleRegistration = "Vehicle registration is required";
      if (!formData.documents.insurance)
        errors.insurance = "Insurance document is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      // First, let's update the user metadata in Clerk
      if (user) {
        await user.update({
          publicMetadata: {
            ...user.publicMetadata,
            role: "driver",
            isVerified: false,
            onboardingCompleted: true,
          },
        });
      }

      // Then submit vehicle and document information
      const response = await fetch("/api/drivers/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      toast.success(
        "Onboarding completed! Your documents are now under review."
      );

      // Redirect to a pending verification page
      router.push("/drivers/verification-pending");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Error submitting your information. Please try again.");
      setIsLoading(false);
    }
  };

  const progress = (currentStep / 3) * 100;

  const getStepLabel = (step: any) => {
    return currentStep === step ? "font-medium text-primary" : "";
  };

  return (
    <div className='min-h-screen bg-background py-6 sm:py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-3xl mx-auto'>
        <Card className='shadow-lg'>
          <CardHeader className='text-center'>
            <CardTitle className='text-2xl sm:text-3xl font-bold'>
              Driver Onboarding
            </CardTitle>
            <div className='mt-6'>
              <Progress value={progress} className='h-2' />
              <div className='flex justify-between mt-2 text-xs sm:text-sm text-muted-foreground'>
                <span className={getStepLabel(1)}>Vehicle Information</span>
                <span className={getStepLabel(2)}>Documents</span>
                <span className={getStepLabel(3)}>Confirmation</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className='min-h-72 pt-4 sm:pt-6'>
            {Object.keys(formErrors).length > 0 && (
              <Alert variant='destructive' className='mb-4'>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription>
                  Please fill in all required fields
                </AlertDescription>
              </Alert>
            )}

            <Tabs
              value={String(currentStep)}
              onValueChange={(value) => setCurrentStep(Number(value))}
            >
              <TabsContent value='1' className='mt-0'>
                <VehicleInfoStep
                  formData={formData}
                  setFormData={setFormData}
                />
              </TabsContent>
              <TabsContent value='2' className='mt-0'>
                <DocumentsStep formData={formData} setFormData={setFormData} />
              </TabsContent>
              <TabsContent value='3' className='mt-0'>
                <div className='space-y-6'>
                  <div>
                    <h3 className='text-lg font-medium'>
                      Confirm Your Details
                    </h3>
                    <p className='text-sm text-muted-foreground mb-4'>
                      Please review your information before submitting
                    </p>

                    <div className='bg-muted p-4 rounded-md space-y-4'>
                      <div>
                        <h4 className='font-medium mb-2'>
                          Vehicle Information
                        </h4>
                        <dl className='grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2'>
                          <div>
                            <dt className='text-sm text-muted-foreground'>
                              Make
                            </dt>
                            <dd>{formData.vehicleMake}</dd>
                          </div>
                          <div>
                            <dt className='text-sm text-muted-foreground'>
                              Model
                            </dt>
                            <dd>{formData.vehicleModel}</dd>
                          </div>
                          <div>
                            <dt className='text-sm text-muted-foreground'>
                              Year
                            </dt>
                            <dd>{formData.vehicleYear}</dd>
                          </div>
                          <div>
                            <dt className='text-sm text-muted-foreground'>
                              License Plate
                            </dt>
                            <dd>{formData.licensePlate}</dd>
                          </div>
                        </dl>
                      </div>

                      <div>
                        <h4 className='font-medium mb-2'>Documents</h4>
                        <ul className='space-y-1'>
                          <li className='flex items-center'>
                            <Check size={16} className='text-green-500 mr-2' />
                            <span>Driving License</span>
                          </li>
                          <li className='flex items-center'>
                            <Check size={16} className='text-green-500 mr-2' />
                            <span>Vehicle Registration</span>
                          </li>
                          <li className='flex items-center'>
                            <Check size={16} className='text-green-500 mr-2' />
                            <span>Insurance</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className='flex justify-between border-t pt-4 sm:pt-6'>
            <Button
              variant='outline'
              onClick={handleBack}
              className={
                currentStep === 1 ? "opacity-0 pointer-events-none" : ""
              }
            >
              Back
            </Button>

            {currentStep < 3 ? (
              <Button onClick={handleNext} className='ml-auto'>
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className='ml-auto'
                disabled={isLoading}
              >
                {isLoading ? "Submitting..." : "Submit"}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingPage;
