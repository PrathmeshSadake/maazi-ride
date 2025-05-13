import { useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";

export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
  isVerified: boolean;
}

export const useAuth = () => {
  const { data: session, status } = useSession();
  const user = session?.user as AuthUser | undefined;

  return {
    user,
    isAuthenticated: !!user,
    isLoading: status === "loading",
    isDriver: user?.role === "driver",
    isAdmin: user?.role === "admin",
    isUser: user?.role === "user",
    isVerified: user?.isVerified ?? false,
  };
};
