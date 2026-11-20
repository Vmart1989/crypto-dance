"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import LoginForm from "@/components/LoginForm";

export default function RegisterForm() {
  const { user, setUser } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Registration failed");
      } else {
        // Update the user context with the returned user info
        setUser(data.user);
        console.log("Registered user:", data.user);
        router.push("/dashboard?message=User%20registered%20successfully");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErrorMsg("An unexpected error occurred.");
    }
  };

  return (
    <main className="container py-4 py-lg-5">
      <div className="text-center mx-auto mb-5" style={{ maxWidth: "650px" }}>
        <div className="eyebrow justify-content-center mb-3">Build your strategy</div>
        <h1 className="mb-3" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}>Trade boldly.<br /><span className="text-gradient">Risk nothing.</span></h1>
        <p className="hero-copy mx-auto">Create your free account and start with a virtual balance designed for learning, testing, and improving.</p>
      </div>
    <div className="row justify-content-center g-0 register-grid">
      <div className="order-2 order-md-1 col-11 col-md-4 premium-panel login-panel">
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
            <h3>Already have an account?</h3>
            <p className="panel-kicker">Sign in and pick up where you left off.</p>
            <LoginForm />
          </>
        )}
      </div>

      <div className="order-1 order-md-2 col-11 col-md-7 premium-panel login-panel">
        <div className="eyebrow mb-3">Free account</div>
        <h3>Create your trading profile</h3>
        <p className="panel-kicker">No card, no deposit, no real-world exposure.</p>
        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <input
              className="w-100 form-control"
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={3}
              maxLength={10}
              aria-label="Name"
            />
          </div>
          <div className="mb-3">
            <input
              className="w-100 form-control"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Email"
            />
          </div>
          <div className="mb-3 password-field">
            <input
              className="w-100 form-control"
              type={showPassword ? "text" : "password"} // Toggle input type based on state
              placeholder="Password (min. 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              aria-label="Password"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ?  <i className="bi bi-eye-slash"></i> : <i className="bi bi-eye"></i>}
            </button>
          </div>
          {errorMsg && <p className="text-danger">{errorMsg}</p>}
          <button type="submit" className="btn btn-primary w-100">
            Register
          </button>
        </form>
      </div>
    </div>
    </main>
  );
}
