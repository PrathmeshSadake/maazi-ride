"use client";

import OnboardingScreens from "@/components/onboarding/OnboardingScreens";
import {
  ArrowRight,
  Car,
  Loader2,
  LogIn,
  Shield,
  Smartphone,
  UserPlus,
  Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

const AuthPage = () => {
  const { status } = useSession();
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if onboarding has been completed
    const onboardingCompleted = localStorage.getItem("onboardingCompleted");
    console.log("🔍 Checking onboarding status:", onboardingCompleted);

    if (onboardingCompleted === "true") {
      console.log("✅ Onboarding completed, showing login form");
      setShowOnboarding(false);
    } else {
      console.log("🎯 Onboarding not completed, showing onboarding screens");
      setShowOnboarding(true);
    }
    setIsLoading(false);
  }, []);

  const handleOnboardingComplete = () => {
    console.log("🎉 Onboarding completed, transitioning to login form");
    setShowOnboarding(false);
  };

  // Show loading while checking onboarding status
  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-semibold text-gray-900">Loading...</p>
            <p className="text-sm text-gray-500">
              Please wait while we set things up
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "authenticated") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-semibold text-gray-900">Welcome back!</p>
            <p className="text-sm text-gray-500">
              Redirecting to your dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show onboarding screens if not completed
  if (showOnboarding) {
    console.log("📱 Rendering onboarding screens");
    return <OnboardingScreens onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 pt-8 pb-6 space-y-6">
        {/* Logo and Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Car className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome to Maazi Ride
            </h1>
            <p className="text-base text-gray-600 leading-relaxed">
              Your trusted ride-sharing platform connecting passengers with
              verified drivers
            </p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="space-y-3">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  For Passengers
                </h3>
                <p className="text-xs text-gray-600">
                  Book rides instantly, track your journey, and rate your
                  experience
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Car className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  For Drivers
                </h3>
                <p className="text-xs text-gray-600">
                  Earn money on your schedule and connect with passengers
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  Safe & Secure
                </h3>
                <p className="text-xs text-gray-600">
                  All drivers are verified and your safety is our priority
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="text-center space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Ready to get started?
            </h2>
            <p className="text-sm text-gray-600">
              Choose your path below to begin your journey
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid gap-3">
          <Link href="/auth/signin">
            <button className="w-full px-4 py-4 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 active:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
              <LogIn className="w-5 h-5" />
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>

          <Link href="/auth/signup">
            <button className="w-full px-4 py-4 bg-white border-2 border-blue-500 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 active:bg-blue-100 transition-colors flex items-center justify-center space-x-2">
              <UserPlus className="w-5 h-5" />
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>

          {/* Phone Auth Option */}
          <Link href="/auth/phone-auth">
            <button className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 active:bg-gray-300 transition-colors flex items-center justify-center space-x-2">
              <Smartphone className="w-4 h-4" />
              <span>Continue with Phone</span>
            </button>
          </Link>
        </div>

        {/* Show Onboarding Again */}
        <div className="text-center pt-4">
          <button
            onClick={() => {
              console.log("🔄 Resetting onboarding status");
              localStorage.removeItem("onboardingCompleted");
              setShowOnboarding(true);
            }}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View App Tour Again
          </button>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500 leading-relaxed">
            By using Maazi Ride, you agree to our{" "}
            <Link
              href="/terms"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
