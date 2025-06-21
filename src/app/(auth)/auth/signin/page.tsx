"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import Image from "next/image";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl,
      });

      if (!result?.ok) {
        throw new Error(result?.error || "Failed to sign in");
      }

      router.push(callbackUrl);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);

    try {
      await signIn("google", {
        callbackUrl,
      });
    } catch (error) {
      setError("Failed to sign in with Google");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Logo */}
      <div className="pt-12 pb-8 px-4">
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 relative">
            <Image
              src="https://rue7vxma3l1fw7f7.public.blob.vercel-storage.com/logo-bf8y30pc7CCXr3951SDdFWldtMUxO3.png"
              alt="Maazi Ride"
              width={96}
              height={96}
              className="w-full h-full object-contain"
              priority
            />
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Welcome back
          </h1>
          <p className="text-sm text-gray-500">
            Sign in to continue your journey
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
                  Sign In Error
                </h3>
                <p className="text-red-600 text-xs">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Google Sign In Card */}
        <div className="bg-white rounded-xl overflow-hidden">
          <div className="p-4">
            <Button
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              variant="outline"
              className="w-full h-12 text-sm font-medium border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              {googleLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <div className="w-5 h-5 mr-2 bg-gradient-to-r from-blue-500 to-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">G</span>
                </div>
              )}
              Continue with Google
            </Button>
          </div>
        </div>

        {/* Divider */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-gray-50 px-3 text-gray-500 font-medium">
              Or sign in with email
            </span>
          </div>
        </div>

        {/* Email/Password Form Card */}
        <div className="bg-white rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              Account Details
            </h2>
          </div>
          <div className="p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email address
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
                    placeholder="Enter your email"
                    disabled={loading || googleLoading}
                    className="pl-10 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-lg text-sm"
                  />
                </div>
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
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    disabled={loading || googleLoading}
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
              </div>

              {/* Sign In Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading || googleLoading}
                  className="w-full h-12 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-medium rounded-lg transition-colors"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Sign Up Link */}
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">
            Don't have an account?{" "}
            <Link
              href="/auth/signup"
              className="font-medium text-orange-600 hover:text-orange-700 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Logo */}
      <div className="pt-12 pb-8 px-4">
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>

        <div className="text-center">
          <div className="h-8 bg-gray-200 rounded-lg w-48 mx-auto mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-32 mx-auto animate-pulse"></div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-6 space-y-4">
        <div className="bg-white rounded-xl p-4">
          <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>

        <div className="bg-white rounded-xl p-4 space-y-4">
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
          <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
          <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SignInContent />
    </Suspense>
  );
}
