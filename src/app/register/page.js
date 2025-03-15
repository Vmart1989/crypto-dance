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
    <div>
      <main className="container mt-5 mb-5">
    <div className="row justify-content-center">
      <div className="order-2 col-11 col-md-3 border border-primary rounded m-5 p-3">
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
            <LoginForm />
          </>
        )}
      </div>

      <div className="col-11 col-md-7 border border-primary rounded p-3 my-5">
        <h3>Register Now For Full Access</h3>
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
          <div className="mb-3">
            <div className="d-flex w-100 justify-content-between">
            <div className="w-100">
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
            </div>
            <div>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="form-control border-0 bg-transparent"
            >
              {showPassword ?  <i className="bi bi-eye-slash"></i> : <i className="bi bi-eye"></i>}
            </button>
            </div>
            </div>
          </div>
          {errorMsg && <p className="text-danger">{errorMsg}</p>}
          <button type="submit" className="btn btn-primary w-100">
            Register
          </button>
        </form>
      </div>
    </div>
    </main>
    </div>
  );
}
