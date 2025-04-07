import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = auth();
  
  // If not logged in, redirect to sign in
  if (!userId) {
    redirect("/sign-in");
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-800">Maazi Ride Admin</h1>
        </div>
      </header>
      
      <main>
        {children}
      </main>
      
      <footer className="bg-white shadow-sm py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>© {new Date().getFullYear()} Maazi Ride Admin Portal</p>
        </div>
      </footer>
    </div>
  );
} 