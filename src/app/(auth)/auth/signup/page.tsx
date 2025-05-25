"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
  UserPlus,
  Car,
  Users,
} from "lucide-react";
import { UserRole } from "@prisma/client";
import {
  SignUpFormData,
  FormValidationErrors,
  AuthLoadingStates,
  SignUpApiResponse,
} from "@/lib/auth.types";
import {
  validateSignUpForm,
  mapAuthError,
  getSuccessMessage,
  getLoadingMessage,
  hasFormErrors,
  debounce,
} from "@/lib/auth-utils";

export default function SignupPage() {
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState<any>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user" as any,
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormValidationErrors>({});
  const [touched, setTouched] = useState<Record<keyof SignUpFormData, boolean>>(
    {
      name: false,
      email: false,
      password: false,
      confirmPassword: false,
      role: false,
    }
  );

  // Loading states
  const [loadingStates, setLoadingStates] = useState<AuthLoadingStates>({
    credentials: false,
    google: false,
    roleSelection: false,
    signUp: false,
  });

  // Debounced validation
  const debouncedValidation = useCallback(
    debounce((data: SignUpFormData) => {
      const validationErrors = validateSignUpForm(data);
      setErrors(validationErrors);
    }, 300),
    []
  );

  // Handle input changes
  const handleInputChange = (field: keyof SignUpFormData, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    // Clear field-specific error when user starts typing
    if (errors[field as keyof FormValidationErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    // Validate if field has been touched
    if (touched[field]) {
      debouncedValidation(newFormData);
    }
  };

  // Handle field blur
  const handleBlur = (field: keyof SignUpFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const validationErrors = validateSignUpForm(formData);
    setErrors((prev) => ({
      ...prev,
      [field]: validationErrors[field as keyof FormValidationErrors],
    }));
  };

  // Handle role selection
  const handleRoleChange = (role: UserRole) => {
    setFormData((prev: any) => ({ ...prev, role }));
    setTouched((prev) => ({ ...prev, role: true }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
      role: true,
    });

    // Validate form
    const validationErrors = validateSignUpForm(formData);
    setErrors(validationErrors);

    if (hasFormErrors(validationErrors)) {
      toast.error("Please fix the errors below and try again.");
      return;
    }

    setLoadingStates((prev) => ({ ...prev, signUp: true }));

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data: SignUpApiResponse = await response.json();

      if (!response.ok) {
        const errorDetails = mapAuthError(
          data.error || "Failed to create account"
        );

        if (errorDetails.field && errorDetails.field !== "general") {
          setErrors((prev) => ({
            ...prev,
            [errorDetails.field!]: errorDetails.message,
          }));
        } else {
          setErrors((prev) => ({ ...prev, general: errorDetails.message }));
        }

        toast.error(errorDetails.message);
        return;
      }

      toast.success(getSuccessMessage("signup"));

      // Redirect to login page with success message
      router.push("/auth/signin?message=account-created");
    } catch (error) {
      const errorDetails = mapAuthError(error as Error);
      setErrors((prev) => ({ ...prev, general: errorDetails.message }));
      toast.error(errorDetails.message);
    } finally {
      setLoadingStates((prev) => ({ ...prev, signUp: false }));
    }
  };

  const isLoading = Object.values(loadingStates).some(Boolean);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-green-600 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Join Maazi Ride
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Create your account and start your journey with us
          </p>
        </div>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-center text-xl font-semibold">
              Create Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* General Error Alert */}
            {errors.general && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-700"
                >
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  onBlur={() => handleBlur("name")}
                  placeholder="Enter your full name"
                  disabled={isLoading}
                  className={`h-11 transition-colors ${
                    errors.name
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-green-500 focus:ring-green-500"
                  }`}
                />
                {errors.name && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  placeholder="Enter your email"
                  disabled={isLoading}
                  className={`h-11 transition-colors ${
                    errors.email
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-green-500 focus:ring-green-500"
                  }`}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    onBlur={() => handleBlur("password")}
                    placeholder="Create a password"
                    disabled={isLoading}
                    className={`h-11 pr-10 transition-colors ${
                      errors.password
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-green-500 focus:ring-green-500"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    onBlur={() => handleBlur("confirmPassword")}
                    placeholder="Confirm your password"
                    disabled={isLoading}
                    className={`h-11 pr-10 transition-colors ${
                      errors.confirmPassword
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-green-500 focus:ring-green-500"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Account Type
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={handleRoleChange}
                  disabled={isLoading}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Choose your account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user" className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <div>
                          <div className="font-medium">Passenger</div>
                          <div className="text-xs text-gray-500">
                            Book rides with drivers
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="driver" className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-green-600" />
                        <div>
                          <div className="font-medium">Driver</div>
                          <div className="text-xs text-gray-500">
                            Offer rides and earn money
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || hasFormErrors(errors)}
                className="w-full h-11 bg-green-600 hover:bg-green-700 transition-colors"
                size="lg"
              >
                {loadingStates.signUp ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {getLoadingMessage("signup")}
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            {/* Sign in link */}
            <div className="text-center text-sm">
              <span className="text-gray-600">Already have an account? </span>
              <Link
                href="/auth/signin"
                className="font-medium text-green-600 hover:text-green-500 transition-colors"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-gray-700">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-gray-700">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
