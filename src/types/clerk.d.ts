import { ClerkAPIResponseError } from "@clerk/shared";

declare global {
  namespace Clerk {
    interface UserPublicMetadata {
      role?: string;
      isVerified?: boolean;
      onboardingCompleted?: boolean;
    }

    interface SessionClaims {
      metadata: {
        role?: string;
        isVerified?: boolean;
        onboardingCompleted?: boolean;
      };
    }
  }
}
