import Link from "next/link";
import { Home, Car, User, Clock, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs/server";

export default async function DriversLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = [
    {
      label: "Home",
      href: "/drivers",
      icon: Home,
    },
    {
      label: "Rides",
      href: "/drivers/rides",
      icon: Car,
    },
    {
      label: "Messages",
      href: "/drivers/messages",
      icon: MessageSquare,
    },
    {
      label: "Earnings",
      href: "/drivers/earnings",
      icon: Clock,
    },
    {
      label: "Account",
      href: "/drivers/account",
      icon: User,
    },
  ];

  const user = await currentUser();
  console.log(user);

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
