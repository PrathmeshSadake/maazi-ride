"use client";

import { ReactNode } from "react";
import NotificationListener from "./NotificationListener";

interface UserLayoutClientProps {
  children: ReactNode;
}

export default function UserLayoutClient({ children }: UserLayoutClientProps) {
  return (
    <>
      <NotificationListener />
      {children}
    </>
  );
}
