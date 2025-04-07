import { SignIn } from "@clerk/nextjs";

const page = () => {
  return <SignIn withSignUp={false} />;
};

export default page;
