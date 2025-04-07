import { SignUp } from "@clerk/nextjs";

const page = () => {
  return (
    <SignUp
      signInUrl='/drivers/sign-in'
      forceRedirectUrl='/drivers/auth-callback'
    />
  );
};

export default page;
