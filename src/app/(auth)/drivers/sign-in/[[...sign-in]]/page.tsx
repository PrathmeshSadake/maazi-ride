import { SignIn } from "@clerk/nextjs";

const page = () => {
  return <SignIn signUpUrl='/drivers/sign-up' />;
};

export default page;
