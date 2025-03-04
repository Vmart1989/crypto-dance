"use client";

import { useUser } from "@/context/UserContext";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import DashboardTabs from "@/components/DashboardTabs";
import AddFundsButton from "@/components/AddFundsModal";

export default function Dashboard() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  const { user, setUser } = useUser();

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

  
  return (
    <div className="container mt-2">
      {message && (
        <div className="alert alert-info" role="alert">
          {message}
        </div>
        
      )}
      <AddFundsButton />
      <div className="d-flex col justify-content-between mt-4 ">
        <div className="w-100">
        <DashboardTabs />
        
        </div>
        
      
      </div>
      
      {/*dashboard content */}
    </div>
  );
}
