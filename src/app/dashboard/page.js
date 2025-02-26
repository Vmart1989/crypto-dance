"use client";

import { useUser } from "@/context/UserContext";
import { useSearchParams } from "next/navigation";

export default function Dashboard() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  const { user } = useUser();

  return (
    <div className="container mt-5">
      {message && (
        <div className="alert alert-info" role="alert">
          {message}
        </div>
      )}
      <div className="d-flex justify-content-between align-items-center">
        <h1>Dashboard</h1>
        {user && (
          <div className="d-flex align-items-center">
            <i className="bi bi-person-fill fs-3 me-2"></i>
            <span className="fs-5 me-4">{user.name || user.email}</span>
            <a
              onClick={async () => {
                // Call logout endpoint and clear user context
                await fetch("/api/auth/logout", { method: "POST" });
                // Optionally, you might also reload or redirect to the home page.
                window.location.href = "/";
              }}
              className="fs-5 link-offset-2 link-offset-3-hover link-underline-primary link-underline-opacity-0 link-underline-opacity-75-hover"
              style={{ cursor: "pointer" }}
            >
              <i className="bi bi-box-arrow-right fs-3 me-2"></i>
              Log out
            </a>
          </div>
        )}
      </div>
      {/* Your dashboard content */}
    </div>
  );
}
