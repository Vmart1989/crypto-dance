"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../context/UserContext"; // Import your UserContext hook

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const { setUser } = useUser(); // get setUser from context
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Login failed");
      } else {
        // Update the user context with returned user info
        setUser(data.user);
        // The token is set as an HTTP‑only cookie by the API route,
        // so no need to store it in localStorage.
        //router.push("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMsg("An unexpected error occurred.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        
        <input
          type="email"
          id="email"
          className="form-control"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="mb-3 d-flex w-100 justify-content-between">
     <div className="w-100">
        <input
          type={showPassword ? "text" : "password"}
          id="password"
          className="w-100 form-control "
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
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
      {errorMsg && <p className="text-danger">{errorMsg}</p>}
      <button type="submit" className="btn btn-primary">
        Log In
      </button>
    </form>
  );
}
