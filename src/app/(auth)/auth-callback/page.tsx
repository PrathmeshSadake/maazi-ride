import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const AuthCallback = async () => {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }
  const role = user.publicMetadata.role;
  console.log(role);
  if (role === "driver") {
    redirect("/drivers");
  } else if (role === "admin") {
    redirect("/admin");
  } else {
    redirect("/");
  }

  return <div></div>;
};

export default AuthCallback;
