"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Save,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export default function PaymentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [upiId, setUpiId] = useState<string | null>(null);
  const [newUpiId, setNewUpiId] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Fetch the driver's UPI ID when the component mounts
  useEffect(() => {
    const fetchUpiId = async () => {
      if (status === "loading") return;
      if (!session) return;

      try {
        const response = await fetch("/api/drivers/payment");
        if (!response.ok)
          throw new Error("Failed to fetch payment information");

        const data = await response.json();
        setUpiId(data.upiId);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching UPI ID:", error);
        toast.error("Failed to load payment information");
        setIsLoading(false);
      }
    };

    fetchUpiId();
  }, [status, session]);

  // Handle adding/updating UPI ID
  const handleSaveUpiId = async () => {
    if (!newUpiId.trim()) {
      toast.error("Please enter a valid UPI ID");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/drivers/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ upiId: newUpiId.trim() }),
      });

      if (!response.ok) throw new Error("Failed to update UPI ID");

      const data = await response.json();
      setUpiId(data.upiId);
      setIsEditing(false);
      toast.success("UPI ID saved successfully");
    } catch (error) {
      console.error("Error saving UPI ID:", error);
      toast.error("Failed to save UPI ID");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle deleting UPI ID
  const handleDeleteUpiId = async () => {
    if (!confirm("Are you sure you want to delete your UPI ID?")) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/drivers/payment", {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete UPI ID");

      setUpiId(null);
      setNewUpiId("");
      toast.success("UPI ID deleted successfully");
    } catch (error) {
      console.error("Error deleting UPI ID:", error);
      toast.error("Failed to delete UPI ID");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle editing mode
  const handleEdit = () => {
    setNewUpiId(upiId || "");
    setIsEditing(true);
  };

  // Handle cancel edit
  const handleCancel = () => {
    setIsEditing(false);
    setNewUpiId("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white px-4 pt-8 pb-4">
          <div className="h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
        </div>
        <div className="px-4 space-y-4">
          <div className="bg-white rounded-xl p-4">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-48 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded animate-pulse mt-4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white">
        <div className="flex items-center justify-between px-4 pt-8 pb-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.back()}
              className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              Payment Information
            </h1>
          </div>

          {upiId && !isEditing && (
            <button
              onClick={handleEdit}
              className="px-3 py-1.5 text-sm text-blue-500 bg-blue-50 rounded-full flex items-center space-x-1"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          )}
        </div>
      </div>

      <div className="px-4 pb-6 space-y-4">
        {/* UPI Payment Card */}
        <div className="bg-white rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900 flex items-center">
              <CreditCard className="w-4 h-4 mr-2" />
              UPI Payment Details
            </h2>
          </div>

          <div className="p-4">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="upiId"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    UPI ID
                  </label>
                  <input
                    type="text"
                    id="upiId"
                    value={newUpiId}
                    onChange={(e) => setNewUpiId(e.target.value)}
                    placeholder="username@bank"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Enter your UPI ID (e.g., name@okbank, name@upi)
                  </p>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveUpiId}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save UPI ID
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : upiId ? (
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">Your UPI ID</p>
                      <p className="font-medium text-gray-900">{upiId}</p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={handleEdit}
                    className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={handleDeleteUpiId}
                    className="flex-1 flex items-center justify-center px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 active:bg-red-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No UPI ID Added
                  </h3>
                  <p className="text-gray-600 text-sm mb-6">
                    Add your UPI ID to receive payments from rides.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="upiId"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    UPI ID
                  </label>
                  <input
                    type="text"
                    id="upiId"
                    value={newUpiId}
                    onChange={(e) => setNewUpiId(e.target.value)}
                    placeholder="username@bank"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Enter your UPI ID (e.g., name@okbank, name@upi)
                  </p>
                </div>

                <button
                  onClick={handleSaveUpiId}
                  disabled={isLoading || !newUpiId.trim()}
                  className="w-full flex items-center justify-center px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add UPI ID
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Information Card */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <div className="flex items-start">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
              <AlertCircle className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-800 text-sm mb-1">
                Payment Information
              </h3>
              <ul className="text-xs text-blue-600 space-y-1">
                <li>• UPI payments are processed instantly</li>
                <li>• Ensure your UPI ID is active and valid</li>
                <li>• You can update your UPI ID anytime</li>
                <li>• Contact support if you face any payment issues</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
