import { type DefaultSession } from "next-auth";

export enum UserRole {
  user = "user",
  driver = "driver",
  admin = "admin",
}

// declare module "next-auth" {
//   interface User {
//     role?: UserRole;
//     isVerified?: boolean;
//   }

//   interface Session extends DefaultSession {
//     user?: {
//       id: string;
//       role: UserRole;
//       isVerified?: boolean;
//       needsRoleSelection?: boolean;
//     } & DefaultSession["user"];
//   }
// }

// declare module "next-auth" {
//   interface JWT {
//     id: string;
//     role?: UserRole;
//     isVerified?: boolean;
//     needsRoleSelection?: boolean;
//   }
// }
