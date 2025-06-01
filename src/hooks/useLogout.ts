import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export const useLogout = () => {
  const router = useRouter();

  const logout = async (callbackUrl?: string) => {
    try {
      console.log("🚪 Starting logout process");

      // Clear onboarding completion status so users see onboarding again
      localStorage.removeItem("onboardingCompleted");
      console.log("🧹 Cleared onboarding status from localStorage");

      // Also clear any other related localStorage items if needed
      localStorage.removeItem("hasSeenOnboarding");
      localStorage.removeItem("onboardingSkipped");

      console.log("🔄 Calling NextAuth signOut");

      // Sign out using NextAuth
      await signOut({
        callbackUrl: callbackUrl || "/",
        redirect: true,
      });

      console.log("✅ Logout completed successfully");
    } catch (error) {
      console.error("❌ Error during logout:", error);
      // Fallback - still clear localStorage even if signOut fails
      localStorage.removeItem("onboardingCompleted");
      localStorage.removeItem("hasSeenOnboarding");
      localStorage.removeItem("onboardingSkipped");
      console.log("🧹 Fallback: Cleared localStorage and redirecting");
      router.push("/");
    }
  };

  const forceResetOnboarding = () => {
    console.log("🔄 Force resetting onboarding");
    localStorage.removeItem("onboardingCompleted");
    localStorage.removeItem("hasSeenOnboarding");
    localStorage.removeItem("onboardingSkipped");
  };

  return { logout, forceResetOnboarding };
};
