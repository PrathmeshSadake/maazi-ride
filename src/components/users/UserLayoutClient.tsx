"use client";

import { ReactNode } from "react";
import NotificationListener from "./NotificationListener";
import NotificationTab from "./NotificationTab";

interface UserLayoutClientProps {
  children: ReactNode;
}

export default function UserLayoutClient({ children }: UserLayoutClientProps) {
  return (
    <>
      <NotificationListener />
      <div className="fixed top-4 right-4 z-50">
        <NotificationTab />
      </div>
      {children}
    </>
  );
}
