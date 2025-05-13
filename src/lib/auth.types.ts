import { type DefaultSession } from "next-auth";

export enum UserRole {
  user = "user",
  driver = "driver",
  admin = "admin",
}

declare module "next-auth" {
  interface User {
    role?: UserRole;
  }

  interface Session extends DefaultSession {
    user?: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }
}

declare module "next-auth" {
  interface JWT {
    role?: UserRole;
    id?: string;
  }
}
