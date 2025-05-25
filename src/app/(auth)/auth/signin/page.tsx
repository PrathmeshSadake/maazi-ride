"use client";

import { useState, useCallback, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  SignInFormData,
  FormValidationErrors,
  AuthLoadingStates,
} from "@/lib/auth.types";
import {
  validateSignInForm,
  mapAuthError,
  getSuccessMessage,
  getLoadingMessage,
  hasFormErrors,
  debounce,
} from "@/lib/auth-utils";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const roleJustSet = searchParams.get("roleJustSet");

  // Form state
  const [formData, setFormData] = useState<SignInFormData>({
    email: "",
    password: "",
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormValidationErrors>({});
  const [touched, setTouched] = useState<Record<keyof SignInFormData, boolean>>(
    {
      email: false,
      password: false,
    }
  );

  // Loading states
  const [loadingStates, setLoadingStates] = useState<AuthLoadingStates>({
    credentials: false,
    google: false,
    roleSelection: false,
    signUp: false,
  });

  // Show success message if user just set their role
  useEffect(() => {
    if (roleJustSet) {
      toast.success("Account setup complete! Please sign in to continue.");
    }
  }, [roleJustSet]);

  // Debounced validation
  const debouncedValidation = useCallback(
    debounce((data: SignInFormData) => {
      const validationErrors = validateSignInForm(data);
      setErrors(validationErrors);
    }, 300),
    []
  );

  // Handle input changes
  const handleInputChange = (field: keyof SignInFormData, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    // Validate if field has been touched
    if (touched[field]) {
      debouncedValidation(newFormData);
    }
  };

  // Handle field blur
  const handleBlur = (field: keyof SignInFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const validationErrors = validateSignInForm(formData);
    setErrors((prev) => ({ ...prev, [field]: validationErrors[field] }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({ email: true, password: true });

    // Validate form
    const validationErrors = validateSignInForm(formData);
    setErrors(validationErrors);

    if (hasFormErrors(validationErrors)) {
      toast.error("Please fix the errors below and try again.");
      return;
    }

    setLoadingStates((prev) => ({ ...prev, credentials: true }));

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
        callbackUrl,
      });

      if (!result?.ok) {
        const errorDetails = mapAuthError(result?.error || "Sign in failed");

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

      toast.success(getSuccessMessage("signin"));
      router.push(callbackUrl);
    } catch (error) {
      const errorDetails = mapAuthError(error as Error);
      setErrors((prev) => ({ ...prev, general: errorDetails.message }));
      toast.error(errorDetails.message);
    } finally {
      setLoadingStates((prev) => ({ ...prev, credentials: false }));
    }
  };

  // Handle Google sign in
  const handleGoogleSignIn = async () => {
    setLoadingStates((prev) => ({ ...prev, google: true }));

    try {
      const result = await signIn("google", {
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        const errorDetails = mapAuthError(result.error);
        toast.error(errorDetails.message);
        return;
      }

      toast.success("Connecting with Google...");
      // The redirect will happen automatically
    } catch (error) {
      const errorDetails = mapAuthError(error as Error);
      toast.error(errorDetails.message);
      setLoadingStates((prev) => ({ ...prev, google: false }));
    }
  };

  const isLoading = Object.values(loadingStates).some(Boolean);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to continue your journey
          </p>
        </div>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-center text-xl font-semibold">
              Sign In
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

            {/* Google Sign In */}
            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              variant="outline"
              className="w-full h-11 border-gray-300 hover:bg-gray-50 transition-colors"
              size="lg"
            >
              {loadingStates.google ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              {getLoadingMessage("google")}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500 font-medium">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email address
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
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    onBlur={() => handleBlur("password")}
                    placeholder="Enter your password"
                    disabled={isLoading}
                    className={`h-11 pr-10 transition-colors ${
                      errors.password
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || hasFormErrors(errors)}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 transition-colors"
                size="lg"
              >
                {loadingStates.credentials ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {getLoadingMessage("signin")}
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

            {/* Sign up link */}
            <div className="text-center text-sm">
              <span className="text-gray-600">Don't have an account? </span>
              <Link
                href="/auth/signup"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500">
          By signing in, you agree to our{" "}
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
