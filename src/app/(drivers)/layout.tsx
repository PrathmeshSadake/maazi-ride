import Link from "next/link";
import { Home, Car, User, Clock, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileCheck, Shield } from "lucide-react";
import { auth } from "@/auth";
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
      label: "My Trips",
      href: "/drivers/trips",
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

  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect("/sign-in");
  }

  if (user && user.role !== "driver") {
    console.log("User is not a driver");
    redirect("/");
  }

  const driver = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
  });

  if (
    (!driver?.isVerified || !user.isVerified) &&
    driver?.drivingLicenseUrl &&
    driver?.vehicleRegistrationUrl &&
    driver?.insuranceUrl
  ) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-10 w-10 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Verification Pending
            </CardTitle>
            <CardDescription>
              Your driver account is awaiting verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700">
                Our team is reviewing your documents and information. This
                process usually takes 1-3 business days. You'll receive an email
                notification once your account is verified.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start">
                <FileCheck className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-medium">Documents Submitted</h3>
                  <p className="text-sm text-gray-600">
                    Your documents have been received and are under review
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Shield className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-medium">Background Check</h3>
                  <p className="text-sm text-gray-600">
                    We're processing your background verification
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3">
            {/* <Button className="w-full" asChild>
              <Link href="/drivers/account">View Profile</Link>
            </Button> */}
            <div className="text-center text-sm text-gray-500">
              <p>
                Need help?{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  Contact Support
                </a>
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col w-full max-w-sm mx-auto">
      <main className="flex-1 pb-16">{children}</main>

      {/* Bottom Navbar */}
      <div className="mx-auto w-full max-w-sm fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white">
        <nav className="flex justify-between items-center h-16">
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
              <item.icon size={24} className="mb-1 text-slate-600" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
