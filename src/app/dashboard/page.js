"use client";

import { useSearchParams } from "next/navigation";

export default function Dashboard() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  return (
    <div className="container mt-5">
      {message && (
        <div className="alert alert-info" role="alert">
          {message}
        </div>
      )}
      <h1>Dashboard</h1>
      {/* Your dashboard content */}
    </div>
  );
}
