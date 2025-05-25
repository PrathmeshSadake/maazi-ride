import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";

interface DriverVerificationData {
  isVerified: boolean;
  driver: any;
  hasDocuments: {
    drivingLicense: boolean;
    vehicleRegistration: boolean;
    insurance: boolean;
  };
  hasVehicle: boolean;
  completionStatus: {
    documentsUploaded: boolean;
    vehicleAdded: boolean;
    verified: boolean;
  };
}

export function useDriverVerification() {
  const { data: session, status } = useSession();
  const [verificationData, setVerificationData] =
    useState<DriverVerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  const fetchVerificationStatus = useCallback(
    async (force = false) => {
      // Prevent multiple simultaneous calls
      if (loading && !force) return;

      if (status === "loading") return;

      if (status === "unauthenticated" || !session?.user) {
        setLoading(false);
        hasFetched.current = true;
        return;
      }

      if (session.user.role !== "driver") {
        setError("User is not a driver");
        setLoading(false);
        hasFetched.current = true;
        return;
      }

      // If we've already fetched and this isn't a forced refetch, don't fetch again
      if (hasFetched.current && !force) {
        setLoading(false);
        return;
      }

      try {
        setError(null);
        if (!loading) setLoading(true);

        const response = await fetch("/api/drivers/verification-status");

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        }

        const data = await response.json();
        setVerificationData(data);
        hasFetched.current = true;
      } catch (err) {
        console.error("Error fetching verification status:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch verification status"
        );
        hasFetched.current = true;
      } finally {
        setLoading(false);
      }
    },
    [session?.user?.id, session?.user?.role, status]
  );

  useEffect(() => {
    // Only fetch if we haven't fetched yet and session is ready
    if (!hasFetched.current && status !== "loading") {
      fetchVerificationStatus();
    }
  }, [fetchVerificationStatus, status]);

  const refetch = useCallback(async () => {
    hasFetched.current = false; // Reset the flag for forced refetch
    await fetchVerificationStatus(true);
  }, [fetchVerificationStatus]);

  return {
    verificationData,
    loading,
    error,
    refetch,
    isVerified: verificationData?.isVerified ?? false,
    hasAllDocuments:
      verificationData?.completionStatus.documentsUploaded ?? false,
    hasVehicle: verificationData?.hasVehicle ?? false,
  };
}
