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
  Star,
  Clock,
  MapPin,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
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
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <div className="space-y-2">
            <p className="text-xl font-semibold text-gray-900">Loading...</p>
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
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-2">
            <p className="text-xl font-semibold text-gray-900">Welcome back!</p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="px-4 pt-12 pb-6 space-y-8">
        {/* Logo and Header */}
        <div className="text-center space-y-6">
          <div className="relative">
            <Image
              src="https://rue7vxma3l1fw7f7.public.blob.vercel-storage.com/logo-bf8y30pc7CCXr3951SDdFWldtMUxO3.png"
              alt="Maazi Ride"
              width={72}
              height={72}
              className="w-full h-full object-contain"
              priority
            />
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">
              Welcome to
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Maazi Ride
              </span>
            </h1>
            <p className="text-base text-gray-600 leading-relaxed max-w-sm mx-auto">
              Your trusted ride-sharing platform connecting passengers with
              verified drivers across the city
            </p>
          </div>
        </div>

        {/* Stats Banner */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-lg font-bold text-gray-900">10K+</div>
              <div className="text-xs text-gray-500">Happy Users</div>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Star className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-lg font-bold text-gray-900">4.8</div>
              <div className="text-xs text-gray-500">Rating</div>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Clock className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-lg font-bold text-gray-900">24/7</div>
              <div className="text-xs text-gray-500">Service</div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 px-1">
            Why choose us?
          </h2>
          <div className="space-y-3">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900 mb-2">
                    For Passengers
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Book rides instantly, track your journey in real-time, and
                    rate your driver experience
                  </p>
                  <div className="flex items-center space-x-4 mt-3">
                    <div className="flex items-center text-xs text-gray-500">
                      <MapPin className="w-3 h-3 mr-1" />
                      Real-time tracking
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Shield className="w-3 h-3 mr-1" />
                      Safe rides
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-sm">
                  <Car className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900 mb-2">
                    For Drivers
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Earn money on your flexible schedule and connect with
                    passengers in your area
                  </p>
                  <div className="flex items-center space-x-4 mt-3">
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      Flexible hours
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Star className="w-3 h-3 mr-1" />
                      Good earnings
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="text-center space-y-3">
            <h2 className="text-xl font-bold">Ready to get started?</h2>
            <p className="text-blue-100 text-sm leading-relaxed">
              Join thousands of satisfied users and start your journey with us
              today
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link href="/auth/signin">
            <button className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 active:from-blue-700 active:to-blue-800 transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl">
              <LogIn className="w-5 h-5" />
              <span>Sign In to Your Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>

          <Link href="/auth/signup mt-2">
            <button className="w-full px-6 py-4 bg-white border-2 border-blue-500 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 active:bg-blue-100 transition-colors flex items-center justify-center space-x-3 shadow-sm hover:shadow-md">
              <UserPlus className="w-5 h-5" />
              <span>Create New Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>

          {/* Phone Auth Option */}
          {/* <Link href="/auth/phone-auth">
            <button className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 active:bg-gray-300 transition-colors flex items-center justify-center space-x-2 shadow-sm">
              <Smartphone className="w-4 h-4" />
              <span>Continue with Phone Number</span>
            </button>
          </Link> */}
        </div>

        {/* Show Onboarding Again */}
        <div className="text-center pt-2">
          <button
            onClick={() => {
              console.log("🔄 Resetting onboarding status");
              localStorage.removeItem("onboardingCompleted");
              setShowOnboarding(true);
            }}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
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
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
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
