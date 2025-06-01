"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserRole } from "@/lib/auth.types";
import { useEffect, useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // useEffect(() => {
  //   if (status === "loading") return;

  //   if (status === "authenticated") {
  //     setIsRedirecting(true);

  //     if (session?.user?.role) {
  //       switch (session.user.role) {
  //         case UserRole.user:
  //           router.push("/");
  //           break;
  //         case UserRole.driver:
  //           router.push("/drivers");
  //           break;
  //         case UserRole.admin:
  //           router.push("/admin");
  //           break;
  //         default:
  //           router.push("/auth/role-selection");
  //       }
  //     } else {
  //       router.push("/auth/role-selection");
  //     }
  //   }
  // }, [session, status, router]);

  // // Loading state
  // if (status === "loading") {
  //   return (
  //     <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
  //       <div className="text-center space-y-4">
  //         <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center animate-pulse">
  //           <Loader2 className="h-6 w-6 text-white animate-spin" />
  //         </div>
  //         <div className="space-y-2">
  //           <p className="text-lg font-medium text-gray-900">Loading...</p>
  //           <p className="text-sm text-gray-600">
  //             Please wait while we set things up
  //           </p>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  // // Redirecting state
  // if (status === "authenticated" || isRedirecting) {
  //   return (
  //     <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50">
  //       <div className="text-center space-y-4">
  //         <div className="mx-auto h-12 w-12 bg-green-600 rounded-full flex items-center justify-center">
  //           <CheckCircle2 className="h-6 w-6 text-white" />
  //         </div>
  //         <div className="space-y-2">
  //           <p className="text-lg font-medium text-gray-900">Welcome back!</p>
  //           <p className="text-sm text-gray-600">
  //             Redirecting to your dashboard...
  //           </p>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
    </div>
  );
}
