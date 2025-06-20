"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  Download,
  AlertCircle,
  DollarSign,
  Car,
  Info,
  Calendar,
} from "lucide-react";

export default function TaxPage() {
  const router = useRouter();
  const [year, setYear] = useState(new Date().getFullYear().toString());

  // Sample earnings data - in a real app, this would come from an API
  const earningsData = {
    totalEarnings: 45250.75,
    totalRides: 324,
    taxDocuments: [
      {
        id: "doc1",
        name: "Annual Tax Statement",
        year: "2023",
        downloadUrl: "#",
        size: "2.4 MB",
        date: "2024-01-15",
      },
      {
        id: "doc2",
        name: "Quarterly Statement Q4",
        year: "2023",
        downloadUrl: "#",
        size: "1.2 MB",
        date: "2024-01-05",
      },
      {
        id: "doc3",
        name: "Quarterly Statement Q3",
        year: "2023",
        downloadUrl: "#",
        size: "1.1 MB",
        date: "2023-10-05",
      },
      {
        id: "doc4",
        name: "Quarterly Statement Q2",
        year: "2023",
        downloadUrl: "#",
        size: "1.3 MB",
        date: "2023-07-05",
      },
      {
        id: "doc5",
        name: "Quarterly Statement Q1",
        year: "2023",
        downloadUrl: "#",
        size: "1.0 MB",
        date: "2023-04-05",
      },
    ],
  };

  // Filter documents by selected year
  const filteredDocuments = earningsData.taxDocuments.filter(
    (doc) => doc.year === year
  );

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

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
            Tax Information
          </h1>
        </div>
      </div>

      <div className="px-4 pb-6 space-y-4">
        {/* Tax Summary */}
        <div className="bg-white rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              Earnings Summary
            </h2>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <DollarSign className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-green-600 font-medium">
                      Total Earnings
                    </p>
                    <p className="text-lg font-bold text-green-800">
                      ₹{earningsData.totalEarnings.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <Car className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 font-medium">
                      Total Rides
                    </p>
                    <p className="text-lg font-bold text-blue-800">
                      {earningsData.totalRides}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
          <div className="flex items-start">
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
              <AlertCircle className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h3 className="font-medium text-amber-800 text-sm mb-1">
                Tax Consultation Required
              </h3>
              <p className="text-amber-700 text-xs">
                Please consult with a tax professional regarding your tax
                obligations. The documents provided are for your reference.
              </p>
            </div>
          </div>
        </div>

        {/* Tax Documents */}
        <div className="bg-white rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <h2 className="text-base font-semibold text-gray-900 mb-2 sm:mb-0">
                Tax Documents
              </h2>
              <div>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="2021">2021</option>
                </select>
              </div>
            </div>
          </div>

          {filteredDocuments.length > 0 ? (
            <div className="p-4 space-y-3">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center flex-1">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                      <FileText className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">
                        {doc.name}
                      </p>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className="text-xs text-gray-500">
                          {formatDate(doc.date)}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          {doc.size}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => window.open(doc.downloadUrl, "_blank")}
                    className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 active:bg-blue-200 transition-colors"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    <span className="text-xs font-medium">Download</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No documents available
              </h3>
              <p className="text-gray-500 text-sm">
                No tax documents available for {year}
              </p>
            </div>
          )}
        </div>

        {/* Tax Information Guide */}
        <div className="bg-white rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900 flex items-center">
              <Info className="w-4 h-4 mr-2" />
              Tax Information Guide
            </h2>
          </div>

          <div className="p-4">
            <p className="text-gray-700 text-sm mb-4">
              As a driver partner, you are responsible for your own taxes. Here
              are some important points to note:
            </p>

            <div className="space-y-3">
              {[
                "You are considered an independent contractor, not an employee.",
                "You should maintain records of all your income and expenses related to driving.",
                "Consider consulting with a tax professional for advice specific to your situation.",
                "Keep track of expenses such as fuel, maintenance, and insurance as they may be tax-deductible.",
              ].map((point, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-gray-600 text-sm">{point}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <h3 className="font-medium text-blue-800 text-sm mb-2">
                Need More Help?
              </h3>
              <p className="text-blue-700 text-xs mb-3">
                For more information about taxes for drivers, refer to our
                comprehensive tax guide.
              </p>
              <button className="flex items-center text-blue-600 text-xs font-medium hover:text-blue-700">
                <FileText className="w-3 h-3 mr-1" />
                Download Tax Guide for Drivers
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              Quick Actions
            </h2>
          </div>

          <div className="p-4 space-y-3">
            <button className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <Calendar className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-gray-900 text-sm">
                  Request Annual Summary
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Get a detailed annual earnings report
                </div>
              </div>
            </button>

            <button className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-gray-900 text-sm">
                  Download All Documents
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Get all tax documents for {year}
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
