"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useUser } from "@/context/UserContext";

export default function PasswordRecoveryForm({ reset = false }) {
  const { t, href, locale } = useLanguage();
  const { setUser } = useUser();
  const [token, setToken] = useState(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (reset) setToken(new URLSearchParams(window.location.hash.slice(1)).get("token") || "");
  }, [reset]);

  async function submit(event) {
    event.preventDefault();
    if (pending) return;
    const fields = new FormData(event.currentTarget);
    const password = fields.get("password");
    if (reset && password !== fields.get("confirmPassword")) {
      setError(t("recovery.mismatch"));
      return;
    }
    setPending(true);
    setError("");
    try {
      const response = await fetch(`/api/auth/${reset ? "reset-password" : "forgot-password"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reset ? { token, password } : { email: fields.get("email"), locale }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error || t("recovery.unavailable"));
        return;
      }
      if (reset) {
        window.history.replaceState(null, "", window.location.pathname);
        setUser(null);
      }
      setComplete(true);
    } catch {
      setError(t("recovery.unavailable"));
    } finally {
      setPending(false);
    }
  }

  const title = t(reset ? "recovery.reset" : "recovery.forgot");
  const validToken = /^[A-Za-z0-9_-]{43}$/.test(token || "");
  return (
    <main className="container py-5">
      <section className="auth-panel p-4 p-md-5 mx-auto" style={{ maxWidth: "34rem" }}>
        <h1 className="h2 mb-3">{title}</h1>
        {complete ? (
          <p role="status">{t(reset ? "recovery.changed" : "recovery.sent")}</p>
        ) : reset && !validToken ? (
          token !== null && <p role="alert">{t("recovery.invalid")}</p>
        ) : (
          <form onSubmit={submit} className="d-grid gap-3">
            {reset ? (
              <>
                <label>{t("recovery.newPassword")}
                  <input name="password" type="password" className="form-control mt-1" autoComplete="new-password" minLength={8} required />
                </label>
                <label>{t("recovery.confirm")}
                  <input name="confirmPassword" type="password" className="form-control mt-1" autoComplete="new-password" minLength={8} required />
                </label>
              </>
            ) : (
              <label>{t("auth.email")}
                <input name="email" type="email" className="form-control mt-1" autoComplete="email" maxLength={254} required />
              </label>
            )}
            {error && <p role="alert" className="text-danger mb-0">{error}</p>}
            <button type="submit" className="btn btn-primary" disabled={pending}>
              {t(pending ? "recovery.pending" : reset ? "recovery.reset" : "recovery.send")}
            </button>
          </form>
        )}
        <div className="d-flex gap-3 flex-wrap mt-4">
          <Link href={href("/")}>{t("auth.login")}</Link>
          {reset && !complete && <Link href={href("/forgot-password")}>{t("recovery.send")}</Link>}
        </div>
      </section>
    </main>
  );
}
