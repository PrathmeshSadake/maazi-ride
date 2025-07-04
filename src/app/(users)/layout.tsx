import Link from "next/link";
import { redirect } from "next/navigation";
import { Home, Search, User, Clock, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { auth } from "@/auth";
import UserLayoutClient from "@/components/users/UserLayoutClient";

export default async function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user;

  if (!session) {
    redirect("/auth");
  }

  // Handle role-based redirects
  if (user?.needsRoleSelection) {
    redirect("/auth/role-selection");
  }

  if (user && user.role === "driver") {
    redirect("/drivers");
  }

  if (user && user.role === "admin") {
    redirect("/admin");
  }

  // Only continue if user has "user" role or no role (default to user)
  if (user && user.role && user.role !== "user") {
    // Fallback redirect for any other roles
    redirect("/auth");
  }

  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
    },
    {
      label: "Messages",
      href: "/messages",
      icon: MessageSquare,
    },
    {
      label: "Activity",
      href: "/activity",
      icon: Clock,
    },
    {
      label: "Account",
      href: "/account",
      icon: User,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col w-full max-w-md mx-auto bg-background">
      <UserLayoutClient>
        <main className="flex-1 pb-16">{children}</main>

        {/* Bottom Navbar */}
        <div className="mx-auto w-full max-w-md fixed bottom-0 left-0 right-0 border-t bg-card shadow-lg">
          <nav className="flex justify-between items-center h-16">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center flex-1 pt-2 pb-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                prefetch={false}
              >
                <item.icon size={22} className="mb-1" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </UserLayoutClient>
    </div>
  );
}
