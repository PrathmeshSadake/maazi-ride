import { SignIn } from "@clerk/nextjs";

const page = () => {
  return (
    <SignIn
      signUpUrl='/drivers/sign-up'
      forceRedirectUrl='/drivers/auth-callback'
    />
  );
};

export default page;
