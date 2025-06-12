"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OTPInput } from "@/components/ui/otp-input";
import { Smartphone, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { UserRole } from "@prisma/client";

type AuthStep = "phone" | "otp" | "signup-details";
type AuthMode = "signin" | "signup";

export default function PhoneAuthPage() {
  const router = useRouter();
  const [step, setStep] = useState<AuthStep>("phone");
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Signup form data
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user" as UserRole,
  });

  const handleSendOTP = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/auth/phone/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("OTP sent successfully!");
        setPhoneNumber(data.phoneNumber); // Use formatted phone number
        setStep("otp");
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (otpCode: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const requestData = {
        phoneNumber,
        otp: otpCode,
        action: authMode,
        ...(authMode === "signup" ? signupData : {}),
      };

      const response = await fetch("/api/auth/phone/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (data.success) {
        if (authMode === "signin") {
          setSuccess("Signed in successfully!");
          // Here you would typically sign in the user with NextAuth or your auth system
          setTimeout(() => {
            router.push("/");
          }, 1000);
        } else {
          setSuccess("Account created successfully!");
          setTimeout(() => {
            router.push("/auth/signin");
          }, 1000);
        }
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError("Failed to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderPhoneStep = () => (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
          <Smartphone className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle className="text-2xl font-bold">
          {authMode === "signin" ? "Sign In" : "Sign Up"} with Phone
        </CardTitle>
        <CardDescription>
          Enter your phone number to receive a verification code
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4">
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}

        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-2">
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            placeholder="+91 XXXXX XXXXX"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {authMode === "signup" && (
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={signupData.name}
                onChange={(e) =>
                  setSignupData({ ...signupData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={signupData.email}
                onChange={(e) =>
                  setSignupData({ ...signupData, email: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={signupData.password}
                onChange={(e) =>
                  setSignupData({ ...signupData, password: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium mb-2">
                Account Type
              </label>
              <select
                id="role"
                value={signupData.role}
                onChange={(e) =>
                  setSignupData({
                    ...signupData,
                    role: e.target.value as UserRole,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="user">User</option>
                <option value="driver">Driver</option>
              </select>
            </div>
          </div>
        )}

        <Button
          onClick={handleSendOTP}
          disabled={
            loading ||
            !phoneNumber.trim() ||
            (authMode === "signup" &&
              (!signupData.name || !signupData.email || !signupData.password))
          }
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending OTP...
            </>
          ) : (
            "Send OTP"
          )}
        </Button>

        <div className="text-center space-y-2">
          <button
            type="button"
            onClick={() =>
              setAuthMode(authMode === "signin" ? "signup" : "signin")
            }
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            {authMode === "signin"
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>

          <div>
            <Link
              href="/auth"
              className="text-sm text-gray-600 hover:text-gray-500"
            >
              Back to main auth page
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderOTPStep = () => (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
        </div>
        <CardTitle className="text-2xl font-bold">Verify Your Phone</CardTitle>
        <CardDescription>
          Enter the 6-digit code sent to {phoneNumber}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4">
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}

        <OTPInput
          length={6}
          onComplete={handleVerifyOTP}
          disabled={loading}
          className="justify-center"
        />

        {loading && (
          <div className="text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-600" />
            <p className="text-sm text-gray-600 mt-2">Verifying OTP...</p>
          </div>
        )}

        <div className="text-center space-y-2">
          <button
            type="button"
            onClick={() => setStep("phone")}
            disabled={loading}
            className="flex items-center justify-center w-full text-sm text-gray-600 hover:text-gray-500 disabled:opacity-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Change phone number
          </button>

          <button
            type="button"
            onClick={handleSendOTP}
            disabled={loading}
            className="text-sm text-blue-600 hover:text-blue-500 disabled:opacity-50"
          >
            Resend OTP
          </button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {step === "phone" && renderPhoneStep()}
        {step === "otp" && renderOTPStep()}
      </div>
    </div>
  );
}
