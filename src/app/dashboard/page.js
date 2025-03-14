"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { useSearchParams } from "next/navigation";
import DashboardTabs from "@/components/DashboardTabs";
import AddFundsButton from "@/components/AddFundsModal";

function DashboardContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  const { user, setUser } = useUser();
  const [showMessage, setShowMessage] = useState(!!message);

  useEffect(() => {
    async function refreshUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error("Error refreshing user:", error);
      }
    }
    // Refresh user data on dashboard load
    refreshUser();
  }, [setUser]);

  // Auto-hide message after 5 seconds and remove query parameter from the URL
  useEffect(() => {
    if (showMessage) {
      const timer = setTimeout(() => {
        setShowMessage(false); // Hide the message after 5 seconds

        // Remove the `message` query parameter from the URL without reloading the page
        const url = new URL(window.location);
        url.searchParams.delete("message");
        window.history.replaceState(null, "", url.toString()); // Update the URL
      }, 5000); // 5000 ms = 5 seconds

      return () => clearTimeout(timer); // Clean up the timer if the component is unmounted
    }
  }, [showMessage]);

  const handleCloseMessage = () => {
    setShowMessage(false);
    // Also remove the `message` query parameter when the user closes the message
    const url = new URL(window.location);
    url.searchParams.delete("message");
    window.history.replaceState(null, "", url.toString()); // Update the URL
  };

  return (
    <div className="container mt-2">
      {showMessage && message && (
        <div className="alert alert-info alert-dismissible" role="alert">
          {message}
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={handleCloseMessage}
          ></button>
        </div>
      )}
      <AddFundsButton />
      <div className="d-flex col justify-content-between mt-4">
        <div className="w-100">
          <DashboardTabs />
        </div>
      </div>
      {/* Additional dashboard content can go here */}
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div>Loading Dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
