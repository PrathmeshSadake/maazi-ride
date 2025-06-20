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
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <div className="text-center space-y-4">
  //         <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
  //           <Loader2 className="w-6 h-6 text-white animate-spin" />
  //         </div>
  //         <div className="space-y-1">
  //           <p className="text-lg font-semibold text-gray-900">Loading...</p>
  //           <p className="text-sm text-gray-500">
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
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <div className="text-center space-y-4">
  //         <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
  //           <CheckCircle2 className="w-6 h-6 text-white" />
  //         </div>
  //         <div className="space-y-1">
  //           <p className="text-lg font-semibold text-gray-900">Welcome back!</p>
  //           <p className="text-sm text-gray-500">
  //             Redirecting to your dashboard...
  //           </p>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return <div className="bg-gray-50 min-h-screen">{children}</div>;
}
