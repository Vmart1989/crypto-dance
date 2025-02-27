"use client";

import { useUser } from "@/context/UserContext";
import { useSearchParams } from "next/navigation";
import { Tab, Tabs } from "react-bootstrap";
import DashboardTabs from "@/components/DashboardTabs";

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
      <div className="d-flex justify-content-between ">
        <div className="w-75">
        <DashboardTabs />
        
        </div>
        <div className="w-25 border border-primary ">
bas
        </div>
      
      </div>
      
      {/* Your dashboard content */}
    </div>
  );
}
