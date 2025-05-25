import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function DriversLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user;

  // if (!user) {
  //   redirect("/sign-in");
  // }

  // if (user && user.role !== "driver") {
  //   redirect("/");
  // }

  return (
    <div className="min-h-screen flex flex-col w-full max-w-sm mx-auto">
      <main className="flex-1 pb-16">{children}</main>
    </div>
  );
}
