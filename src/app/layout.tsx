import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import QueryProvider from "@/providers/QueryProvider";
import SplashScreenWrapper from "@/components/SplashScreenWrapper";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Maazi Ride",
  description: "Maazi Ride",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${poppins.variable}`}>
          <QueryProvider>
            <SplashScreenWrapper>{children}</SplashScreenWrapper>
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
