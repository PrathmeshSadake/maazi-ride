import { Shield, Clock, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { getDriverData } from "@/lib/actions/driver-verification";

export default async function VerificationPendingPage() {
  const driver = await getDriverData();

  if (!driver) {
    return <div>Error loading driver data</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="h-10 w-10 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Verification Pending
          </CardTitle>
          <CardDescription>
            Your driver account is awaiting verification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700">
              Our team is reviewing your documents and information. This process
              usually takes 1-3 business days. You'll receive an email
              notification once your account is verified.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start">
              <FileCheck className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium">Documents Submitted</h3>
                <p className="text-sm text-gray-600">
                  {driver.drivingLicenseUrl &&
                  driver.vehicleRegistrationUrl &&
                  driver.insuranceUrl
                    ? "All required documents have been received and are under review"
                    : "Some documents may be missing"}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <Shield className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium">Background Check</h3>
                <p className="text-sm text-gray-600">
                  We're processing your background verification
                </p>
              </div>
            </div>

            {driver.vehicle && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium text-sm mb-2">
                  Vehicle Information
                </h4>
                <p className="text-xs text-gray-600">
                  {driver.vehicle.year} {driver.vehicle.make}{" "}
                  {driver.vehicle.model} ({driver.vehicle.color})
                </p>
                <p className="text-xs text-gray-600">
                  License Plate: {driver.vehicle.licensePlate}
                </p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <Button className="w-full" asChild>
            <Link href="/drivers/account">View Profile</Link>
          </Button>
          <div className="text-center text-sm text-gray-500">
            <p>
              Need help?{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Contact Support
              </a>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
