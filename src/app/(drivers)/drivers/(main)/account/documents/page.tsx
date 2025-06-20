"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  CheckCircle,
  AlertCircle,
  FileText,
  Shield,
  Eye,
  RefreshCw,
  Clock,
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
  const { data: session, status } = useSession();
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
      if (status === "loading") return;

      if (status === "unauthenticated") {
        router.push("/auth/signin");
        return;
      }

      try {
        const response = await fetch(
          `/api/drivers/${session?.user?.id}/documents`
        );
        if (!response.ok)
          throw new Error("Failed to fetch document information");

        const data = await response.json();
        setDocuments({
          drivingLicense: {
            url: data.drivingLicenseUrl,
            verified: data.isVerified,
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
  }, [status, session, router]);

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
        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <Shield className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-green-800 text-sm">
                Verification Complete
              </h3>
              <p className="text-xs text-green-600 mt-0.5">
                All your documents are verified and approved.
              </p>
            </div>
          </div>
        </div>
      );
    } else if (allDocumentsUploaded) {
      return (
        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
              <Clock className="w-4 h-4 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-medium text-yellow-800 text-sm">
                Verification In Progress
              </h3>
              <p className="text-xs text-yellow-600 mt-0.5">
                Your documents are under review. This may take 1-2 business
                days.
              </p>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
              <AlertCircle className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <h3 className="font-medium text-red-800 text-sm">
                Verification Incomplete
              </h3>
              <p className="text-xs text-red-600 mt-0.5">
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
      <div className="bg-white rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-900 text-base">{title}</h3>
            {documentUrl && (
              <div
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isVerified
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {isVerified ? "Verified" : "Pending"}
              </div>
            )}
          </div>
        </div>

        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">{description}</p>

          {documentUrl ? (
            <div className="space-y-3">
              <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                    <FileText className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Document uploaded
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Ready for verification
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => window.open(documentUrl, "_blank")}
                  className="flex-1 flex items-center justify-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </button>
                <button
                  onClick={() => handleUpload(documentType)}
                  className="flex-1 flex items-center justify-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Replace
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => handleUpload(documentType)}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </button>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white px-4 pt-8 pb-4">
          <div className="h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
        </div>
        <div className="px-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-48 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse mt-4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white">
        <div className="flex items-center px-4 pt-8 pb-4">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">
            Documents & Verification
          </h1>
        </div>
      </div>

      <div className="px-4 pb-6 space-y-4">
        <VerificationStatus />

        <div className="space-y-4">
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
            title="Insurance"
            description="Upload your valid vehicle insurance document."
            documentUrl={documents.insurance.url}
            isVerified={documents.insurance.verified}
            documentType="insurance"
          />
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <div className="flex items-start">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-800 text-sm mb-1">
                Important Notes
              </h3>
              <p className="text-xs text-blue-600">
                All documents must be clearly visible and not expired. Our team
                will review your documents within 1-2 business days.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
