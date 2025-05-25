"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, UserPlus, LogIn, Car, Users, Shield } from "lucide-react";

const AuthPage = () => {
  const { status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center space-y-4">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center animate-pulse">
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900">Loading...</p>
            <p className="text-sm text-gray-600">
              Please wait while we set things up
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="text-center space-y-4">
          <div className="mx-auto h-12 w-12 bg-green-600 rounded-full flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900">Welcome back!</p>
            <p className="text-sm text-gray-600">
              Redirecting to your dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="w-full max-w-4xl mx-auto text-center space-y-12">
        {/* Header */}
        <div className="space-y-6">
          <div className="mx-auto h-20 w-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-6">
            <Car className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 tracking-tight">
            Welcome to Maazi Ride
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Your trusted ride-sharing platform connecting passengers with
            verified drivers. Safe, reliable, and convenient transportation at
            your fingertips.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-3 p-3 bg-blue-100 rounded-full w-fit">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg font-semibold">
                For Passengers
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 text-sm">
                Book rides instantly, track your journey, and rate your
                experience with verified drivers.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-3 p-3 bg-green-100 rounded-full w-fit">
                <Car className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-lg font-semibold">
                For Drivers
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 text-sm">
                Earn money on your schedule, connect with passengers, and build
                your reputation.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-3 p-3 bg-purple-100 rounded-full w-fit">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg font-semibold">
                Safe & Secure
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 text-sm">
                All drivers are verified, rides are tracked, and your safety is
                our top priority.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-6">
          <p className="text-lg text-gray-700 font-medium">
            Ready to get started? Choose your path below
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Button
              asChild
              size="lg"
              className="h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors shadow-lg hover:shadow-xl"
            >
              <Link href="/auth/signin" className="flex items-center gap-2">
                <LogIn className="h-5 w-5" />
                Sign In
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold transition-colors shadow-lg hover:shadow-xl"
            >
              <Link href="/auth/signup" className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Sign Up
              </Link>
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            By using Maazi Ride, you agree to our{" "}
            <Link
              href="/terms"
              className="underline hover:text-gray-700 transition-colors"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="underline hover:text-gray-700 transition-colors"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default AuthPage;
