import React from "react";
import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/app/actions/auth.actions";
import { FaGoogle } from "react-icons/fa";

const GoogleSignInButton = () => {
  return (
    <Button
      onClick={signInWithGoogle}
      variant="outline"
      className="w-full h-12 bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-800 border border-gray-300 focus:ring-4 focus:ring-gray-100 hover:shadow-[0_0_15px_rgba(255,165,0,0.3)] transition-all duration-300"
      aria-label="Sign in with Google"
    >
      <FaGoogle className="w-5 h-5 mr-2" />
      <span>Sign in with Google</span>
    </Button>
  );
};

export default GoogleSignInButton;
