import { redirect } from "next/navigation";
import { UserRole } from "@/lib/auth.types";
import { auth } from "@/auth";

async function AuthCallback({ children }: { children: React.ReactNode }) {
  const session = await auth();
  

  if (session?.user?.role)
    switch (session.user.role) {
      case UserRole.user:
        redirect("/");
        break;
      case UserRole.driver:
        redirect("/drivers");
        break;
      case UserRole.admin:
        redirect("/admin");
        break;
    }
}

export default AuthCallback;
