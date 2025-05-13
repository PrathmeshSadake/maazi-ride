import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { ComponentType } from "react";

interface WithAuthProps {
  requiredRole?: UserRole;
  requireVerified?: boolean;
}

export function withAuth<P extends object>(
  WrappedComponent: ComponentType<P>,
  { requiredRole, requireVerified = false }: WithAuthProps = {}
) {
  return function WithAuthComponent(props: P) {
    const { user, isLoading } = useAuth();

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!user) {
      redirect("/login");
    }

    if (requiredRole && user.role !== requiredRole) {
      redirect("/unauthorized");
    }

    if (requireVerified && !user.isVerified) {
      if (user.role === "driver") {
        redirect("/driver/onboarding");
      }
      redirect("/unauthorized");
    }

    return <WrappedComponent {...props} />;
  };
}
