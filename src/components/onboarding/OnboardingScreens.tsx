"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Car,
  Users,
  MapPin,
  Shield,
  Clock,
  Star,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Smartphone,
  CreditCard,
  Navigation,
} from "lucide-react";

interface OnboardingScreensProps {
  onComplete: () => void;
}

const OnboardingScreens = ({ onComplete }: OnboardingScreensProps) => {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const screens = [
    {
      title: "Welcome to Maazi Ride",
      subtitle: "Your trusted ride-sharing platform",
      description:
        "Connect with verified drivers for safe, reliable, and affordable transportation wherever you need to go.",
      icon: <Car className="h-20 w-20 text-blue-600" />,
      gradient: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "For Passengers",
      subtitle: "Book rides instantly",
      description:
        "Find nearby drivers, track your journey in real-time, and enjoy a seamless travel experience with just a few taps.",
      icon: <Users className="h-20 w-20 text-green-600" />,
      features: [
        { icon: <Smartphone className="h-5 w-5" />, text: "Easy booking" },
        {
          icon: <Navigation className="h-5 w-5" />,
          text: "Real-time tracking",
        },
        { icon: <Shield className="h-5 w-5" />, text: "Verified drivers" },
        { icon: <Star className="h-5 w-5" />, text: "Rate your experience" },
      ],
      gradient: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
    },
    {
      title: "For Drivers",
      subtitle: "Earn on your schedule",
      description:
        "Join our community of drivers and start earning money by providing safe rides to passengers in your area.",
      icon: <Wallet className="h-20 w-20 text-purple-600" />,
      features: [
        { icon: <Clock className="h-5 w-5" />, text: "Flexible schedule" },
        { icon: <CreditCard className="h-5 w-5" />, text: "Weekly payouts" },
        { icon: <Shield className="h-5 w-5" />, text: "Insurance coverage" },
        { icon: <Star className="h-5 w-5" />, text: "Build reputation" },
      ],
      gradient: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-50",
    },
  ];

  // Handle touch gestures for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentScreen < screens.length - 1) {
      handleNext();
    }
    if (isRightSwipe && currentScreen > 0) {
      handlePrevious();
    }
  };

  const handleNext = () => {
    console.log(
      `🔄 Moving from screen ${currentScreen} to ${currentScreen + 1}`
    );

    if (currentScreen < screens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      console.log("🎯 Reached final onboarding screen, completing onboarding");
      // Mark onboarding as completed and proceed to auth
      localStorage.setItem("onboardingCompleted", "true");
      console.log("💾 Set onboardingCompleted to true in localStorage");
      onComplete();
    }
  };

  const handlePrevious = () => {
    console.log(
      `🔄 Moving from screen ${currentScreen} to ${currentScreen - 1}`
    );
    if (currentScreen > 0) {
      setCurrentScreen(currentScreen - 1);
    }
  };

  const handleSkip = () => {
    console.log("⏭️ User skipped onboarding");
    localStorage.setItem("onboardingCompleted", "true");
    console.log("💾 Set onboardingCompleted to true in localStorage (skipped)");
    onComplete();
  };

  const handleDotClick = (index: number) => {
    setCurrentScreen(index);
  };

  const currentScreenData = screens[currentScreen];

  return (
    <div
      className={`min-h-screen ${currentScreenData.bgColor} relative overflow-hidden transition-colors duration-500`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${currentScreenData.gradient} opacity-5 transition-all duration-500`}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header with Skip Button */}
        <div className="flex justify-between items-center p-4 sm:p-6">
          <div className="w-16" />
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-gray-500 hover:text-gray-700 text-sm font-medium"
          >
            Skip
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 text-center">
          {/* Icon/Illustration with Animation */}
          <div className="mb-8 flex items-center justify-center">
            <div
              className={`rounded-full bg-gradient-to-r ${currentScreenData.gradient} p-6 shadow-2xl transform transition-all duration-500 hover:scale-105`}
            >
              <div className="text-white animate-pulse">
                {currentScreenData.icon}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-sm sm:max-w-md mx-auto space-y-6 transform transition-all duration-500">
            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                {currentScreenData.title}
              </h1>
              <h2 className="text-lg sm:text-xl font-medium text-gray-600">
                {currentScreenData.subtitle}
              </h2>
            </div>

            <p className="text-gray-600 text-base sm:text-lg leading-relaxed px-4">
              {currentScreenData.description}
            </p>

            {/* Features List (for screens 2 and 3) */}
            {currentScreenData.features && (
              <div className="space-y-4 mt-8">
                {currentScreenData.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-start gap-4 bg-white/50 backdrop-blur-sm rounded-xl p-3 mx-4 transform transition-all duration-300 hover:scale-105"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div
                      className={`p-2 rounded-full bg-gradient-to-r ${currentScreenData.gradient} text-white shadow-lg`}
                    >
                      {feature.icon}
                    </div>
                    <span className="text-gray-800 font-medium text-left">
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="p-4 sm:p-6 space-y-6 pb-8">
          {/* Progress Dots */}
          <div className="flex justify-center space-x-3">
            {screens.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`h-2 w-8 rounded-full transition-all duration-300 ${
                  index === currentScreen
                    ? `bg-gradient-to-r ${currentScreenData.gradient} shadow-lg`
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center max-w-sm sm:max-w-md mx-auto px-4">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentScreen === 0}
              className="flex items-center gap-2 text-gray-500 disabled:opacity-0 transition-all duration-300"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>

            <Button
              onClick={handleNext}
              className={`flex items-center gap-2 bg-gradient-to-r ${currentScreenData.gradient} hover:opacity-90 text-white px-6 sm:px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
            >
              {currentScreen === screens.length - 1 ? "Get Started" : "Next"}
              {currentScreen < screens.length - 1 && (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Swipe Indicator for Mobile */}
          <div className="flex justify-center sm:hidden">
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <span>👆</span> Swipe to navigate
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingScreens;
