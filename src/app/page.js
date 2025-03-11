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
        <div className="row justify-content-center ">
          <div className="mx-auto p-0 col-11 col-md-8 border rounded border-primary-subtle h-100 mt-5 mt-md-0">
            <div>
              <TopCryptos />
            </div>
          </div>
          <div className="mx-auto h-50 col-11 col-md-3 order-first order-md-last">
            <div className="border rounded border-primary-subtle p-2 order-sm-1 ">
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
              <h3 className="mb-2 text-light">Today's Top Gainers</h3>
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
