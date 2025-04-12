import Link from "next/link";
import { redirect } from "next/navigation";
import { Home, Search, User, Clock, MapPin } from "lucide-react";
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

  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
    },
    {
      label: "Explore",
      href: "/explore",
      icon: Search,
    },
    {
      label: "Rides",
      href: "/rides",
      icon: MapPin,
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
    <div className='min-h-screen flex flex-col w-full max-w-sm mx-auto'>
      <main className='flex-1 pb-16'>{children}</main>

      {/* Bottom Navbar */}
      <div className='mx-auto w-full max-w-sm fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white'>
        <nav className='flex justify-between items-center h-16'>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 pt-2 pb-1 text-xs",
                "text-slate-600"
              )}
              prefetch={false}
            >
              <item.icon size={24} className='mb-1 text-slate-600' />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
