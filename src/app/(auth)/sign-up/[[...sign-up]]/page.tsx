import { SignUp } from "@clerk/nextjs";

const page = () => {
  return <SignUp forceRedirectUrl='/callback' />;
};

export default page;
