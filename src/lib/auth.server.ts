import { auth } from "@/auth";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

export async function getServerUser() {
  const session = await auth();
  return session?.user;
}

export async function requireAuth() {
  const user = await getServerUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireDriver() {
  const user = await requireAuth();

  if (user.role !== UserRole.driver) {
    redirect("/unauthorized");
  }

  if (!user.isVerified) {
    redirect("/driver/onboarding");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();

  if (user.role !== UserRole.admin) {
    redirect("/unauthorized");
  }

  return user;
}

export async function requireUnauth() {
  const user = await getServerUser();

  if (user) {
    redirect("/");
  }
}
