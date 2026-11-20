"use client";

import TopGainers from "@/components/TopGainers";
import LoginForm from "../components/LoginForm";
import TopCryptos from "../components/TopCryptos";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const { user } = useUser();
  const router = useRouter();

  return (
    <main className="container pb-5">
      <section className="row align-items-center py-4 py-lg-5 mb-4 g-5">
        <div className="col-lg-7 py-lg-4">
          <div className="eyebrow mb-3">The zero-risk trading desk</div>
          <h1 className="mb-4">
            Read the market.<br />
            <span className="text-gradient">Make your move.</span>
          </h1>
          <p className="hero-copy mb-4">
            Learn crypto by doing. Track live markets, build a virtual portfolio,
            and sharpen your strategy without putting real money on the line.
          </p>
          <div className="d-flex flex-wrap gap-2">
            <Link href={user ? "/dashboard" : "/register"} className="btn btn-primary px-4">
              {user ? "Open dashboard" : "Start trading free"}
            </Link>
            <a href="#market" className="btn btn-outline-primary px-4">Explore the market</a>
          </div>
          <div className="hero-proof">
            <span><i className="bi bi-check2-circle" /> Live market data</span>
            <span><i className="bi bi-check2-circle" /> Virtual funds</span>
            <span><i className="bi bi-check2-circle" /> No financial risk</span>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="premium-panel login-panel">
            {user ? (
              <>
                <div className="eyebrow mb-3">Your account</div>
                <h3>Welcome back, {user.name || user.email}</h3>
                <p className="panel-kicker">Your virtual portfolio is ready when you are.</p>
                <button className="btn btn-primary w-100" onClick={() => router.push("/dashboard")}>
                  Open your dashboard
                </button>
              </>
            ) : (
              <>
                <div className="eyebrow mb-3">Member access</div>
                <h3>Continue your journey</h3>
                <p className="panel-kicker">Sign in to manage your virtual portfolio.</p>
                <LoginForm />
                <p className="panel-kicker mt-4 mb-0 text-center">
                  New here? <Link href="/register">Create a free account</Link>
                </p>
              </>
            )}
          </div>
          <div className="premium-panel gainers-panel">
            <div className="d-flex align-items-start justify-content-between mb-3">
              <div>
                <h3 className="mb-1">Today&apos;s movers</h3>
                <p className="panel-kicker mb-0">Top 100 by market cap</p>
              </div>
              <span className="status-label">Market watch</span>
            </div>
            <TopGainers />
          </div>
        </div>
      </section>

      <section id="market" className="market-panel">
        <div className="panel-heading">
          <div>
            <div className="eyebrow mb-2">Market overview</div>
            <h2>Top assets</h2>
            <p>Ranked by market capitalization</p>
          </div>
          <span className="status-label">Market watch</span>
        </div>
        <TopCryptos />
      </section>
    </main>
  );
}
