"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader } from "lucide-react";

function SetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setupAccount = async () => {
      try {
        if (!role) {
          setError("Missing role parameter");
          setLoading(false);
          return;
        }

        console.log(`Setting up account with role: ${role}`);

        // Call the API route to set up the user with explicit role parameter
        const response = await fetch(
          `/api/auth/clerk?role=${role}&redirect=json`
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Setup failed:", errorData);
          throw new Error(errorData.error || "Failed to set up account");
        }

        const data = await response.json().catch(() => ({}));
        console.log("Setup response:", data);

        setLoading(false);

        // If we got a response, redirect to the appropriate page
        if (data.redirectUrl) {
          router.push(data.redirectUrl);
        } else {
          // Fallback redirect based on role
          if (role === "driver") {
            router.push("/drivers/onboarding");
          } else {
            router.push("/");
          }
        }
      } catch (error) {
        console.error("Setup error:", error);
        setError(
          error instanceof Error ? error.message : "Unknown error occurred"
        );
        setLoading(false);
      }
    };

    setupAccount();
  }, [role, router]);

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen'>
        <div className='text-red-500 mb-4'>Error: {error}</div>
        <button
          onClick={() => router.push("/sign-up")}
          className='px-4 py-2 bg-blue-500 text-white rounded'
        >
          Back to Sign Up
        </button>
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-screen'>
      <Loader className='animate-spin' size={40} />
      <h1 className='mt-4 text-xl font-semibold'>Setting up your account...</h1>
      <p className='mt-2 text-gray-600'>
        Please wait while we configure your{" "}
        {role === "driver" ? "driver" : "passenger"} account
      </p>
    </div>
  );
}

// Fallback loading state for Suspense
function LoadingFallback() {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen'>
      <Loader className='animate-spin' size={40} />
      <h1 className='mt-4 text-xl font-semibold'>Loading...</h1>
    </div>
  );
}

export default function SetupPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SetupContent />
    </Suspense>
  );
}
