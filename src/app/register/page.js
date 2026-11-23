"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import LoginForm from "@/components/LoginForm";
import { useLanguage } from "@/context/LanguageContext";

export default function RegisterForm() {
  const { user, setUser } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility
  const router = useRouter();
  const { locale, t, href } = useLanguage();

  useEffect(() => {
    const verification = new URLSearchParams(window.location.search).get("verification");
    if (verification === "success") setSuccessMsg(t("register.verified"));
    if (verification === "expired" || verification === "invalid") setErrorMsg(t("register.verificationInvalid"));
  }, [locale]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || t("auth.loginFailed"));
      } else if (data.requiresVerification) {
        setSuccessMsg(t("register.verifyEmail"));
        setPassword("");
      } else {
        // Update the user context with the returned user info
        setUser(data.user);
        console.log("Registered user:", data.user);
        router.push(`${href("/dashboard")}?message=User%20registered%20successfully`);
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErrorMsg(t("auth.loginFailed"));
    }
  };

  return (
    <main className="container py-4 py-lg-5">
      <div className="text-center mx-auto mb-5" style={{ maxWidth: "650px" }}>
        <div className="eyebrow justify-content-center mb-3">{t("register.eyebrow")}</div>
        <h1 className="mb-3" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}>{t("register.title1")}<br /><span className="text-gradient">{t("register.title2")}</span></h1>
        <p className="hero-copy mx-auto">{t("register.intro")}</p>
      </div>
    <div className="row justify-content-center g-0 register-grid">
      <div className="order-2 order-md-1 col-11 col-md-4 premium-panel login-panel">
        {user ? (
          // If the user is logged in, show a welcome message and a button to go to the dashboard
          <>
            <h3 className="mb-4">Welcome back {user.name || user.email}!</h3>
            <button
              className="btn btn-primary w-100"
              onClick={() => router.push(href("/dashboard"))}
            >
              {t("home.dashboard")}
            </button>
          </>
        ) : (
          // Otherwise, show the login form and a link to register
          <>
            <h3>{t("register.existing")}</h3>
            <p className="panel-kicker">{t("register.existingCopy")}</p>
            <LoginForm />
          </>
        )}
      </div>

      <div className="order-1 order-md-2 col-11 col-md-7 premium-panel login-panel">
        <div className="eyebrow mb-3">{t("register.free")}</div>
        <h3>{t("register.profile")}</h3>
        <p className="panel-kicker">{t("register.safe")}</p>
        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <input
              className="w-100 form-control"
              type="text"
              placeholder={t("register.name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              maxLength={50}
              aria-label={t("register.name")}
            />
          </div>
          <div className="mb-3">
            <input
              className="w-100 form-control"
              type="email"
              placeholder={t("auth.email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label={t("auth.email")}
            />
          </div>
          <div className="mb-3 password-field">
            <input
              className="w-100 form-control"
              type={showPassword ? "text" : "password"} // Toggle input type based on state
              placeholder={t("register.passwordHint")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              maxLength={72}
              aria-label={t("auth.password")}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle"
              aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
            >
              {showPassword ?  <i className="bi bi-eye-slash"></i> : <i className="bi bi-eye"></i>}
            </button>
          </div>
          {errorMsg && <p className="text-danger">{errorMsg}</p>}
          {successMsg && <p className="alert alert-success">{successMsg}</p>}
          <button type="submit" className="btn btn-primary w-100">
            {t("register.submit")}
          </button>
        </form>
      </div>
    </div>
    </main>
  );
}
