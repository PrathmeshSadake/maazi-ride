"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, Download, AlertCircle } from "lucide-react";

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
      },
      {
        id: "doc2",
        name: "Quarterly Statement Q4",
        year: "2023",
        downloadUrl: "#",
      },
      {
        id: "doc3",
        name: "Quarterly Statement Q3",
        year: "2023",
        downloadUrl: "#",
      },
      {
        id: "doc4",
        name: "Quarterly Statement Q2",
        year: "2023",
        downloadUrl: "#",
      },
      {
        id: "doc5",
        name: "Quarterly Statement Q1",
        year: "2023",
        downloadUrl: "#",
      },
    ],
  };

  // Filter documents by selected year
  const filteredDocuments = earningsData.taxDocuments.filter(
    (doc) => doc.year === year
  );

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 mr-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Tax Information</h1>
      </div>

      {/* Tax Summary */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Earnings Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-sm">Total Earnings (All Time)</p>
            <p className="text-2xl font-bold">
              ₹{earningsData.totalEarnings.toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-sm">Total Rides Completed</p>
            <p className="text-2xl font-bold">{earningsData.totalRides}</p>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 rounded-lg p-4 text-sm">
          <div className="flex items-start">
            <AlertCircle
              size={16}
              className="text-blue-500 mt-0.5 mr-2 flex-shrink-0"
            />
            <p className="text-blue-700">
              Please consult with a tax professional regarding your tax
              obligations. The documents provided are for your reference.
            </p>
          </div>
        </div>
      </div>

      {/* Tax Documents */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <h2 className="text-xl font-semibold mb-2 sm:mb-0">
              Tax Documents
            </h2>
            <div>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
              </select>
            </div>
          </div>
        </div>

        {filteredDocuments.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="p-4 flex justify-between items-center"
              >
                <div className="flex items-center">
                  <FileText className="text-gray-500 mr-3" />
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-sm text-gray-500">Year: {doc.year}</p>
                  </div>
                </div>
                <a
                  href={doc.downloadUrl}
                  className="flex items-center px-3 py-1.5 bg-green-50 text-green-700 rounded-md hover:bg-green-100"
                >
                  <Download size={16} className="mr-1" />
                  Download
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500">
            <FileText size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No tax documents available for {year}</p>
          </div>
        )}
      </div>

      {/* Additional Information */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Tax Information</h2>
        <div className="space-y-4 text-gray-700">
          <p>
            As a driver partner, you are responsible for your own taxes. Here
            are some important points to note:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              You are considered an independent contractor, not an employee.
            </li>
            <li>
              You should maintain records of all your income and expenses
              related to driving.
            </li>
            <li>
              Consider consulting with a tax professional for advice specific to
              your situation.
            </li>
            <li>
              Keep track of expenses such as fuel, maintenance, and insurance as
              they may be tax-deductible.
            </li>
          </ul>
          <p className="mt-4">
            For more information about taxes for drivers, please refer to our{" "}
            <a href="#" className="text-green-600 hover:underline">
              Tax Guide for Drivers
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
