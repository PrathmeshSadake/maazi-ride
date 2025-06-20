"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2, Save } from "lucide-react";
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
        <h1 className="text-2xl font-bold">Payment Information</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">UPI Payment Details</h2>

        {isLoading ? (
          <div className="py-4 text-center">Loading payment information...</div>
        ) : isEditing ? (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="upiId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                UPI ID
              </label>
              <input
                type="text"
                id="upiId"
                value={newUpiId}
                onChange={(e) => setNewUpiId(e.target.value)}
                placeholder="username@bank"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter your UPI ID (e.g., name@okbank, name@upi)
              </p>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleSaveUpiId}
                disabled={isLoading}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <Save size={16} className="mr-2" />
                Save UPI ID
              </button>
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : upiId ? (
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Your UPI ID</p>
              <p className="font-medium text-lg">{upiId}</p>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleEdit}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Pencil size={16} className="mr-2" />
                Edit
              </button>
              <button
                onClick={handleDeleteUpiId}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <Trash2 size={16} className="mr-2" />
                Delete
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600">
              No UPI ID added yet. Add your UPI ID to receive payments.
            </p>

            <div>
              <label
                htmlFor="upiId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                UPI ID
              </label>
              <input
                type="text"
                id="upiId"
                value={newUpiId}
                onChange={(e) => setNewUpiId(e.target.value)}
                placeholder="username@bank"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter your UPI ID (e.g., name@okbank, name@upi)
              </p>
            </div>

            <button
              onClick={handleSaveUpiId}
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <Save size={16} className="mr-2" />
              Save UPI ID
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
