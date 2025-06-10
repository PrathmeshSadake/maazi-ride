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
  const abortControllerRef = useRef<AbortController | null>(null);

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

        // Cancel previous request if it exists
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        // Create new abort controller for this request
        abortControllerRef.current = new AbortController();

        // Add timeout
        const timeoutId = setTimeout(() => {
          if (abortControllerRef.current) {
            abortControllerRef.current.abort();
          }
        }, 10000); // 10 second timeout

        const response = await fetch("/api/drivers/verification-status", {
          signal: abortControllerRef.current.signal,
          headers: {
            "Cache-Control": "no-cache",
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        }

        const data = await response.json();
        setVerificationData(data);
        hasFetched.current = true;
      } catch (err) {
        // Don't set error if request was aborted (user navigated away or new request started)
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        console.error("Error fetching verification status:", err);

        let errorMessage = "Failed to fetch verification status";
        if (err instanceof Error) {
          if (err.message.includes("fetch")) {
            errorMessage = "Network error - please check your connection";
          } else {
            errorMessage = err.message;
          }
        }

        setError(errorMessage);
        hasFetched.current = true;
      } finally {
        setLoading(false);
        abortControllerRef.current = null;
      }
    },
    [session?.user?.id, session?.user?.role, status, loading]
  );

  useEffect(() => {
    // Only fetch if we haven't fetched yet and session is ready
    if (!hasFetched.current && status !== "loading") {
      fetchVerificationStatus();
    }

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
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
