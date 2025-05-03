"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  CheckCircle,
  AlertCircle,
  FileText,
  Shield,
} from "lucide-react";

interface DocumentStatus {
  drivingLicense: {
    url: string | null;
    verified: boolean;
  };
  vehicleRegistration: {
    url: string | null;
    verified: boolean;
  };
  insurance: {
    url: string | null;
    verified: boolean;
  };
}

export default function DocumentsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState<DocumentStatus>({
    drivingLicense: { url: null, verified: false },
    vehicleRegistration: { url: null, verified: false },
    insurance: { url: null, verified: false },
  });

  // Fetch document status
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!isLoaded || !user) return;

      try {
        const response = await fetch(`/api/drivers/${user.id}/documents`);
        if (!response.ok)
          throw new Error("Failed to fetch document information");

        const data = await response.json();
        setDocuments({
          drivingLicense: {
            url: data.drivingLicenseUrl,
            verified: data.isVerified, // This could be more granular in a real app
          },
          vehicleRegistration: {
            url: data.vehicleRegistrationUrl,
            verified: data.isVerified,
          },
          insurance: {
            url: data.insuranceUrl,
            verified: data.isVerified,
          },
        });
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, [isLoaded, user]);

  // Go to document upload page
  const handleUpload = (documentType: string) => {
    router.push(`/drivers/onboarding/documents?type=${documentType}`);
  };

  // Verification status card
  const VerificationStatus = () => {
    const allDocumentsUploaded =
      documents.drivingLicense.url &&
      documents.vehicleRegistration.url &&
      documents.insurance.url;

    const allDocumentsVerified =
      documents.drivingLicense.verified &&
      documents.vehicleRegistration.verified &&
      documents.insurance.verified;

    if (allDocumentsVerified) {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <Shield className="text-green-600 mr-3" />
            <div>
              <h3 className="font-medium text-green-800">
                Verification Complete
              </h3>
              <p className="text-sm text-green-600">
                All your documents are verified and approved.
              </p>
            </div>
          </div>
        </div>
      );
    } else if (allDocumentsUploaded) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="text-yellow-600 mr-3" />
            <div>
              <h3 className="font-medium text-yellow-800">
                Verification In Progress
              </h3>
              <p className="text-sm text-yellow-600">
                Your documents are under review. This may take 1-2 business
                days.
              </p>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="text-red-600 mr-3" />
            <div>
              <h3 className="font-medium text-red-800">
                Verification Incomplete
              </h3>
              <p className="text-sm text-red-600">
                Please upload all required documents to complete verification.
              </p>
            </div>
          </div>
        </div>
      );
    }
  };

  // Document card component
  const DocumentCard = ({
    title,
    description,
    documentUrl,
    isVerified,
    documentType,
  }: {
    title: string;
    description: string;
    documentUrl: string | null;
    isVerified: boolean;
    documentType: string;
  }) => {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4">
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium">{title}</h3>
            {documentUrl && (
              <div
                className={`px-2 py-1 rounded-full text-xs ${
                  isVerified
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {isVerified ? "Verified" : "Pending"}
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-4">{description}</p>

          {documentUrl ? (
            <div className="space-y-3">
              <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                <div className="flex items-center">
                  <FileText size={16} className="text-gray-500 mr-2" />
                  <span className="text-sm truncate">Document uploaded</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => window.open(documentUrl, "_blank")}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  View
                </button>
                <button
                  onClick={() => handleUpload(documentType)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Replace
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => handleUpload(documentType)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <Upload size={16} className="mr-2" />
              Upload Document
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 mr-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Documents & Verification</h1>
      </div>

      {isLoading ? (
        <div className="py-8 text-center">Loading document information...</div>
      ) : (
        <>
          <VerificationStatus />

          <div className="space-y-6">
            <DocumentCard
              title="Driving License"
              description="Upload a clear photo or scan of your valid driving license (front and back)."
              documentUrl={documents.drivingLicense.url}
              isVerified={documents.drivingLicense.verified}
              documentType="drivingLicense"
            />

            <DocumentCard
              title="Vehicle Registration"
              description="Upload your vehicle registration certificate (RC)."
              documentUrl={documents.vehicleRegistration.url}
              isVerified={documents.vehicleRegistration.verified}
              documentType="vehicleRegistration"
            />

            <DocumentCard
              title="Insurance Documents"
              description="Upload your valid vehicle insurance policy document."
              documentUrl={documents.insurance.url}
              isVerified={documents.insurance.verified}
              documentType="insurance"
            />
          </div>

          <div className="mt-8 bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
            <div className="flex items-start">
              <AlertCircle
                size={16}
                className="text-gray-500 mt-0.5 mr-2 flex-shrink-0"
              />
              <p>
                All documents must be valid, clearly visible, and in JPG, PNG,
                or PDF format. Documents will be verified by our team, which may
                take 1-2 business days.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
