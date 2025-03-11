"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import LoginForm from "@/components/LoginForm";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const { setUser } = useUser(); // Get setUser from context

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
    <div className="row justify-content-center">
    <div className="col-10 order-2 col-md-3 border border-primary rounded m-5 p-3">
      <h3>Already have an account?</h3>
    <LoginForm />
    </div>
    <div className="col-10 col-md-6 border border-primary rounded p-3 my-5 text-center">
      <h3>Register Now For Full Access</h3>
      <form onSubmit={handleRegister}>
        <div className="mb-3">
          <input
            className="w-100 text-center"
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={3}
            maxLength={10}
          />
        </div>
        <div className="mb-3">
          <input
            className="w-100 text-center"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <input
            className="w-100 text-center"
            type="password"
            placeholder="Password (min. 8 characteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
        {errorMsg && <p className="text-danger">{errorMsg}</p>}
        <button type="submit" className="btn btn-primary w-100">
          Register
        </button>
      </form>
    </div>
    </div>

  );
}
