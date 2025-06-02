import type { Metadata } from "next";
import { Poppins, Geist } from "next/font/google";
import "./globals.css";

import QueryProvider from "@/providers/QueryProvider";
import SplashScreenWrapper from "@/components/SplashScreenWrapper";
import { Providers } from "@/context/providers";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geist = Geist({
  variable: "--font-geist",
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
    <Providers>
      <html lang="en">
        <body className={`${poppins.variable} ${geist.className}`}>
          <QueryProvider>
            <SplashScreenWrapper>{children}</SplashScreenWrapper>
          </QueryProvider>
        </body>
      </html>
    </Providers>
  );
}
