import { type DefaultSession } from "next-auth";

export enum UserRole {
  user = "user",
  driver = "driver",
  admin = "admin",
}

// Form types
export interface SignInFormData {
  email: string;
  password: string;
}

export interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  role: UserRole;
}

export interface RoleSelectionData {
  role: UserRole;
}

// API Response types
export interface AuthApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

export interface SignUpApiResponse extends AuthApiResponse {
  user?: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
}

export interface RoleUpdateApiResponse extends AuthApiResponse {
  role?: UserRole;
}

// Loading states
export interface AuthLoadingStates {
  credentials: boolean;
  google: boolean;
  roleSelection: boolean;
  signUp: boolean;
}

// Error types
export type AuthError =
  | "CredentialsSignin"
  | "EmailAlreadyExists"
  | "InvalidCredentials"
  | "WeakPassword"
  | "InvalidEmail"
  | "NetworkError"
  | "UnknownError";

export interface AuthErrorDetails {
  type: AuthError;
  message: string;
  field?: keyof SignInFormData | keyof SignUpFormData | "general";
}

// Form validation
export interface FormValidationErrors {
  email?: string;
  password?: string;
  name?: string;
  confirmPassword?: string;
  general?: string;
}

// Session extensions
// declare module "next-auth" {
//   interface User {
//     role?: UserRole | undefined;
//     isVerified?: boolean;
//     needsRoleSelection?: boolean;
//   }

//   interface Session extends DefaultSession {
//     user?: {
//       id: string;
//       role: UserRole | undefined;
//       isVerified?: boolean;
//       needsRoleSelection?: boolean;
//     } & DefaultSession["user"];
//   }
// }

// declare module "next-auth" {
//   interface JWT {
//     id: string;
//     role: UserRole | undefined;
//     isVerified?: boolean;
//     needsRoleSelection?: boolean;
//   }
// }
