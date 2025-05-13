import Link from "next/link";

const AuthPage = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center text-center">
        <h1 className="text-4xl font-bold mb-8">Welcome to MarkAI</h1>

        {status === "loading" ? (
          <p className="text-lg">Loading...</p>
        ) : status === "authenticated" ? (
          <p className="text-lg">Redirecting to your dashboard...</p>
        ) : (
          <div className="space-y-6">
            <p className="text-lg">
              Please sign in or create an account to continue
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signin"
                className="rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-indigo-600 shadow-sm ring-1 ring-inset ring-indigo-300 hover:bg-indigo-50"
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default AuthPage;
