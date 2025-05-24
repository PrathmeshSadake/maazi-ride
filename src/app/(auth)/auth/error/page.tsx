"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";

const errorMessages = {
  OAuthAccountNotLinked: {
    title: "Account Already Exists",
    description:
      "An account with this email already exists. Please sign in with your email and password instead.",
    suggestion:
      "If you'd like to link your Google account, sign in with your email first and then connect Google in your account settings.",
  },
  OAuthCallback: {
    title: "Authentication Error",
    description: "There was an error during the authentication process.",
    suggestion: "Please try signing in again.",
  },
  AccessDenied: {
    title: "Access Denied",
    description: "You cancelled the authentication process.",
    suggestion: "Please try signing in again if you want to continue.",
  },
  Verification: {
    title: "Verification Error",
    description: "The verification link has expired or is invalid.",
    suggestion: "Please request a new verification link.",
  },
  Default: {
    title: "Authentication Error",
    description: "An unexpected error occurred during sign-in.",
    suggestion: "Please try again or contact support if the problem persists.",
  },
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") as keyof typeof errorMessages;

  const errorInfo = errorMessages[error] || errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-xl text-red-700">
              {errorInfo.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-gray-600">{errorInfo.description}</p>
              <p className="text-sm text-gray-500">{errorInfo.suggestion}</p>
            </div>

            {error === "OAuthAccountNotLinked" && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-blue-700 text-sm">
                  <strong>Tip:</strong> You can still sign in with your email
                  and password, then link your Google account later in your
                  profile settings.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/auth/signin">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Sign In
                </Link>
              </Button>

              {error === "OAuthAccountNotLinked" && (
                <Button asChild variant="outline" className="w-full">
                  <Link href="/auth/signup">Create New Account</Link>
                </Button>
              )}
            </div>

            <div className="text-center">
              <Link
                href="/"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Return to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
