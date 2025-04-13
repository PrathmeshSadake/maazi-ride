"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader } from "lucide-react";

export default function SetupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const setupAccount = async () => {
      try {
        if (!role) {
          setError("Missing role parameter");
          return;
        }

        // Call the API route to set up the user
        const response = await fetch(`/api/auth/clerk?role=${role}`);

        if (!response.ok) {
          throw new Error("Failed to set up account");
        }

        // The API will handle the redirect, but we'll add a fallback
        const data = await response.json().catch(() => ({}));

        // If we're still here after 3 seconds, redirect based on role
        setTimeout(() => {
          if (role === "driver") {
            router.push("/drivers/onboarding");
          } else {
            router.push("/");
          }
        }, 3000);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Unknown error occurred"
        );
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
