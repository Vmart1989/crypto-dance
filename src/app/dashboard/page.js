"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { useSearchParams } from "next/navigation";
import DashboardTabs from "@/components/DashboardTabs";
import AddFundsButton from "@/components/AddFundsModal";
import { useLanguage } from "@/context/LanguageContext";

function DashboardContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  const { user, setUser } = useUser();
  const [showMessage, setShowMessage] = useState(!!message);
  const { t } = useLanguage();

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
      }, 3000); // 3 seconds

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
    <main className="container mt-3">
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
      <div className="d-flex flex-wrap gap-3 align-items-center justify-content-between mb-3">
        <div>
          <div className="eyebrow mb-2">{t("dashboard.simulator")}</div>
          <h2 className="mb-0">{t("dashboard.desk")}</h2>
        </div>
        <AddFundsButton />
      </div>
      <div className="d-flex col justify-content-between mt-4">
        <div className="w-100">
          <DashboardTabs />
        </div>
      </div>
      {/* Additional dashboard content can go here */}
    </main>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
