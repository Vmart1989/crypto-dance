"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "../context/UserContext"; // Import your UserContext hook
import { useLanguage } from "@/context/LanguageContext";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const { setUser } = useUser(); // get setUser from context
  const [showPassword, setShowPassword] = useState(false);
  const { t, href } = useLanguage();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await res.json()
        : {};

      if (!res.ok) {
        setErrorMsg(
          data.error ||
            t("auth.loginUnavailable")
        );
      } else {
        // Update the user context with returned user info
        setUser(data.user);
        // The token is set as an HTTP‑only cookie by the API route,
        // so no need to store it in localStorage.
        //router.push("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMsg(t("auth.loginFailed"));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        
        <input
          type="email"
          id="email"
          className="form-control"
          placeholder={t("auth.email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="mb-3 password-field">
        <input
          type={showPassword ? "text" : "password"}
          id="password"
          className="w-100 form-control"
          placeholder={t("auth.password")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
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
      <div className="mb-3 text-end">
        <Link href={href("/forgot-password")}>{t("recovery.forgot")}</Link>
      </div>
      <button type="submit" className="btn btn-primary w-100">
        {t("auth.login")}
      </button>
    </form>
  );
}
