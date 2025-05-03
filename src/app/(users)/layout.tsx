import Link from "next/link";
import { redirect } from "next/navigation";
import { Home, Search, User, Clock, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs/server";

export default async function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (user && user.publicMetadata.role === "driver") {
    redirect("/drivers");
  }
  if (user && user.publicMetadata.role === "admin") {
    redirect("/admin");
  }

  console.log("User is a user", user.publicMetadata.role);

  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
    },
    {
      label: "Activity",
      href: "/activity",
      icon: Clock,
    },
    {
      label: "Messages",
      href: "/messages",
      icon: MessageSquare,
    },
    {
      label: "Account",
      href: "/account",
      icon: User,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col w-full max-w-md mx-auto bg-gray-50">
      <main className="flex-1 pb-16">{children}</main>

      {/* Bottom Navbar */}
      <div className="mx-auto w-full max-w-md fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white shadow-md">
        <nav className="flex justify-between items-center h-16">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center flex-1 pt-2 pb-1 text-xs text-gray-600 hover:text-blue-600"
              prefetch={false}
            >
              <item.icon size={22} className="mb-1" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
