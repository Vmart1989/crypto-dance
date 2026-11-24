"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { setUser } = useUser();
  const router = useRouter();

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMsg("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};
      if (!response.ok) throw new Error(data.error || "Login failed");
      if (data.user.role !== "admin") {
        await fetch("/api/auth/logout", { method: "POST" });
        throw new Error("This account does not have administrator access.");
      }
      setUser(data.user);
      router.push("/admin/dashboard");
      router.refresh();
    } catch (error) {
      setErrorMsg(error.message || "Unable to sign in");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-intro">
        <span className="admin-login-icon"><i className="bi bi-shield-lock" /></span>
        <span className="admin-eyebrow">Restricted workspace</span>
        <h1>Operate CryptoDance with clarity.</h1>
        <p>Review platform health, support users, inspect simulated transactions, and follow a secure activity trail.</p>
        <div className="admin-login-points"><span><i className="bi bi-check2-circle" />Role-protected access</span><span><i className="bi bi-check2-circle" />Revocable sessions</span><span><i className="bi bi-check2-circle" />Auditable admin actions</span></div>
      </section>
      <section className="admin-login-card">
        <div><span className="admin-section-kicker">Admin access</span><h2>Sign in to continue</h2><p>Use an account with the administrator role.</p></div>
        {errorMsg && <div className="admin-alert admin-alert-error"><i className="bi bi-exclamation-circle" />{errorMsg}</div>}
        <form onSubmit={handleSubmit}>
          <label className="admin-field"><span>Email address</span><div className="admin-input-icon"><i className="bi bi-envelope" /><input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></div></label>
          <label className="admin-field"><span>Password</span><div className="admin-input-icon"><i className="bi bi-key" /><input type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /><button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? "Hide password" : "Show password"}><i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} /></button></div></label>
          <button className="admin-button admin-login-submit" type="submit" disabled={submitting}>{submitting ? <><span className="admin-spinner" />Signing in</> : <><i className="bi bi-box-arrow-in-right" />Sign in securely</>}</button>
        </form>
        <Link href="/" className="admin-back-link"><i className="bi bi-arrow-left" />Return to CryptoDance</Link>
      </section>
    </main>
  );
}
