"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export interface DriverData {
  id: string;
  isVerified: boolean;
  drivingLicenseUrl?: string;
  vehicleRegistrationUrl?: string;
  insuranceUrl?: string;
  vehicle?: {
    id: string;
    make?: string;
    model?: string;
    year?: number;
    color?: string;
    licensePlate?: string;
    vehicleImages?: string[];
  };
}

export interface UseDriverDataReturn {
  driver: DriverData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDriverData(): UseDriverDataReturn {
  const [driver, setDriver] = useState<DriverData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDriverData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get("/api/drivers/me");
      setDriver(response.data);
    } catch (err) {
      console.error("Error fetching driver data:", err);
      setError("Failed to fetch driver data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriverData();
  }, []);

  return {
    driver,
    loading,
    error,
    refetch: fetchDriverData,
  };
}
