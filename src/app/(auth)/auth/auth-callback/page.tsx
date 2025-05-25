import { redirect } from "next/navigation";
import { UserRole } from "@/lib/auth.types";
import { auth } from "@/auth";

const AuthCallback = async () => {
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

  return redirect("/role-selection");
};

export default AuthCallback;
