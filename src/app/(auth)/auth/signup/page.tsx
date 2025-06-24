"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserRole } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserCheck,
  Phone,
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>("user");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Phone number formatting function
  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const numericValue = value.replace(/\D/g, "");

    // Limit to 10 digits for Indian numbers
    const truncated = numericValue.slice(0, 10);

    // Format as XXXXX XXXXX if 10 digits
    if (truncated.length > 5) {
      return `${truncated.slice(0, 5)} ${truncated.slice(5)}`;
    }

    return truncated;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate phone number
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone: phoneDigits, // Send only digits to backend
          password,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      // Redirect to login page
      router.push("/auth/signin?message=Account created successfully");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Logo */}
      <div className="pt-12 pb-8 px-4">
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 relative">
            <img
              src="https://rue7vxma3l1fw7f7.public.blob.vercel-storage.com/logo-bf8y30pc7CCXr3951SDdFWldtMUxO3.png"
              alt="Maazi Ride"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Join Maazi Ride
          </h1>
          <p className="text-sm text-gray-500">
            Create your account to get started
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-6 space-y-4">
        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4">
            <div className="flex items-start">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              </div>
              <div>
                <h3 className="font-medium text-red-800 text-sm mb-1">
                  Sign Up Error
                </h3>
                <p className="text-red-600 text-xs">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Account Type Selection */}
        <div className="bg-white rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              Account Type
            </h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("user")}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  role === "user"
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      role === "user" ? "bg-orange-100" : "bg-gray-100"
                    }`}
                  >
                    <User
                      className={`w-5 h-5 ${
                        role === "user" ? "text-orange-600" : "text-gray-600"
                      }`}
                    />
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      role === "user" ? "text-orange-800" : "text-gray-700"
                    }`}
                  >
                    Passenger
                  </span>
                  <span className="text-xs text-gray-500 mt-1">Book rides</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole("driver")}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  role === "driver"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      role === "driver" ? "bg-green-100" : "bg-gray-100"
                    }`}
                  >
                    <UserCheck
                      className={`w-5 h-5 ${
                        role === "driver" ? "text-green-600" : "text-gray-600"
                      }`}
                    />
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      role === "driver" ? "text-green-800" : "text-gray-700"
                    }`}
                  >
                    Driver
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    Provide rides
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Personal Information Form */}
        <div className="bg-white rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              Personal Information
            </h2>
          </div>
          <div className="p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Input */}
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-700"
                >
                  Full Name
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    disabled={loading}
                    className="pl-10 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email Address
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    disabled={loading}
                    className="pl-10 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Phone Input */}
              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="text-sm font-medium text-gray-700"
                >
                  Phone Number
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="Enter your phone number"
                    disabled={loading}
                    maxLength={11} // XXXXX XXXXX format
                    className="pl-10 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-lg text-sm"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  10-digit Indian mobile number
                </p>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    disabled={loading}
                    className="pl-10 pr-10 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-lg text-sm"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 6 characters long
                </p>
              </div>

              {/* Create Account Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-medium rounded-lg transition-colors"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Sign In Link */}
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              className="font-medium text-orange-600 hover:text-orange-700 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Terms & Privacy */}
        <div className="text-center px-4">
          <p className="text-xs text-gray-400 leading-relaxed">
            By creating an account, you agree to our{" "}
            <Link href="#" className="text-orange-600 hover:text-orange-700">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-orange-600 hover:text-orange-700">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
