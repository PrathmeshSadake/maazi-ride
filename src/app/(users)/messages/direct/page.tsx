"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, User, ArrowRight } from "lucide-react";
import { useSession } from "next-auth/react";

interface Driver {
  id: string;
  firstName: string | null;
  lastName: string | null;
}

export default function DirectMessagesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (status !== "loading") {
      if (!session?.user) {
        router.push("/sign-in");
      } else {
        fetchDrivers();
      }
    }
  }, [status, session, router]);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/drivers?forMessaging=true");

      if (!response.ok) {
        throw new Error("Failed to fetch drivers");
      }

      const data = await response.json();
      setDrivers(data);
    } catch (err) {
      console.error("Error fetching drivers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartConversation = (driver: Driver) => {
    router.push(
      `/messages?driverId=${driver.id}&driver=${driver.firstName} ${driver.lastName}`
    );
  };

  // Filter drivers by search query
  const filteredDrivers =
    searchQuery.trim() === ""
      ? drivers
      : drivers.filter((driver) => {
          const fullName = `${driver.firstName || ""} ${
            driver.lastName || ""
          }`.toLowerCase();
          return fullName.includes(searchQuery.toLowerCase());
        });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Message a Driver</h1>

      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search for a driver"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full py-2 pl-10 pr-4 bg-gray-100 border-none rounded-lg focus:ring-2 focus:ring-blue-800 focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-2 border-t-blue-600 border-r-transparent border-b-blue-600 border-l-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredDrivers.map((driver) => (
            <div
              key={driver.id}
              onClick={() => handleStartConversation(driver)}
              className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                <span className="font-bold">
                  {driver.firstName?.charAt(0) || ""}
                  {driver.lastName?.charAt(0) || ""}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">
                  {driver.firstName} {driver.lastName}
                </h3>
                <p className="text-sm text-gray-500 truncate">Driver</p>
              </div>
              <ArrowRight size={16} className="text-gray-400 ml-2" />
            </div>
          ))}
        </div>
      )}

      {!loading && filteredDrivers.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <User size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            No drivers found
          </h3>
          <p className="text-gray-500 mt-1">Try a different search term</p>
        </div>
      )}
    </div>
  );
}
