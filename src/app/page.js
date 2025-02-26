"use client";

import TopGainers from "@/components/TopGainers";
import LoginForm from "../components/LoginForm";
import TopCryptos from "../components/TopCryptos";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user } = useUser();
  const router = useRouter();

  return (
    <div>
      <main className="container mt-5 mb-5">
        <div className="row">
          <div className="p-0 col-12 col-md-8 me-5 border rounded border-primary-subtle h-100">
            <div>
              <TopCryptos />
            </div>
          </div>
          <div className="h-50 col-12 col-md-3">
            <div className="border rounded border-primary-subtle p-2">
              {user ? (
                // If the user is logged in, show a welcome message and a button to go to the dashboard
                <>
                  <h3 className="mb-4">Welcome back {user.name || user.email}!</h3>
                  <button
                    className="btn btn-primary w-100"
                    onClick={() => router.push("/dashboard")}
                  >
                    Go to Your Dashboard
                  </button>
                </>
              ) : (
                // Otherwise, show the login form and a link to register
                <>
                  <h3 className="mb-4">Login to start exploring</h3>
                  <LoginForm />
                  <p className="mt-4">
                    New to CryptoDance? Register <a href="/register">here.</a>
                  </p>
                </>
              )}
            </div>
            <div className="border rounded border-primary-subtle p-2 mt-5 bg-dark">
              <h3 className="mb-4 text-primary">Today's Top Gainers</h3>
              <p className="text-primary fs-6 lh-1">
                Among Current Top 100 by Market Cap
              </p>
              <TopGainers />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
