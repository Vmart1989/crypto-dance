"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
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
        // On successful registration, redirect to /dashboard with a success message query parameter.
        router.push("/dashboard?message=User%20registered%20successfully");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErrorMsg("An unexpected error occurred.");
    }
  };

  return (
    <div className="container border border-primary p-3">
      <h3>Register Now For Full Access</h3>
    <form onSubmit={handleRegister}>
      <div className="mb-3">
        <input
          type="text"
          placeholder="Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {errorMsg && <p className="text-danger">{errorMsg}</p>}
      <button type="submit" className="btn btn-primary">
        Register
      </button>
    </form>
    </div>
  );
}
