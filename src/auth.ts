import NextAuth, { DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";

export enum UserRole {
  user = "user",
  driver = "driver",
  admin = "admin",
}

declare module "next-auth" {
  interface User {
    role?: UserRole;
    isVerified?: boolean;
  }

  interface Session extends DefaultSession {
    user?: {
      id: string;
      role: UserRole;
      isVerified?: boolean;
      needsRoleSelection?: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth" {
  interface JWT {
    id: string;
    role?: UserRole;
    isVerified?: boolean;
    needsRoleSelection?: boolean;
  }
}

export const config = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" as const },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials): Promise<any> => {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            role: true,
            isVerified: true,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password.toString(),
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isVerified: user.isVerified,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // For OAuth providers (like Google)
      if (account?.provider === "google") {
        try {
          // Check if user exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
            select: { id: true, role: true, isVerified: true },
          });

          if (existingUser) {
            // User exists - link the account
            user.id = existingUser.id;
            user.role = existingUser.role as any;
            user.isVerified = existingUser.isVerified;

            // Check if this Google account is already linked
            const existingAccount = await prisma.account.findFirst({
              where: {
                userId: existingUser.id,
                provider: "google",
              },
            });

            // If Google account not linked yet, create the account record
            if (!existingAccount) {
              await prisma.account.create({
                data: {
                  userId: existingUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token,
                  refresh_token: account.refresh_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                },
              });
            }
          } else {
            // New user - create them without a role
            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name,
                password: "", // Empty password for OAuth users
                // Don't set role - will be set later
              },
            });
            user.id = newUser.id;
            user.role = undefined;
          }
        } catch (error) {
          console.error("Error during sign in:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account, trigger }) {
      // If this is a new sign-in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isVerified = (user as any).isVerified;

        // Check if user needs role selection (no role assigned)
        if (account?.provider === "google" && !user.role) {
          token.needsRoleSelection = true;
        }
      }

      // If the session is being updated, refresh user data from database
      if (trigger === "update") {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as any },
            select: { role: true, isVerified: true },
          });

          if (dbUser) {
            token.role = dbUser.role as any;
            token.isVerified = dbUser.isVerified;
            // Clear role selection flag if role is now set
            if (dbUser.role) {
              token.needsRoleSelection = false;
            }
          }
        } catch (error) {
          console.error("Error refreshing user data:", error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.isVerified = token.isVerified as boolean;
        session.user.needsRoleSelection = token.needsRoleSelection as boolean;
      }
      return session;
    },
  },
} satisfies Parameters<typeof NextAuth>[0];

export const { handlers, auth, signIn, signOut } = NextAuth(config);
