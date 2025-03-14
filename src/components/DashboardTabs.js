"use client";

import React, { useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import TopCryptos from "@/components/TopCryptos";
import SellAssets from "./SellAssets";
import WalletTab from "./WalletTab";

export default function DashboardTabs() {
  const [key, setKey] = useState("cryptos");
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Trigger to refresh WalletTab data

  // Function to handle tab selection
  const handleTabSelect = (selectedKey) => {
    setKey(selectedKey);
    if (selectedKey === "tbd") {
      // Increment the trigger value every time the Wallet tab is opened
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  return (
    <div className="container">
      <Tabs
        activeKey={key}
        onSelect={handleTabSelect}
        id="dashboard-tabs"
        className="custom-tabs"
        fill
      >
        <Tab eventKey="cryptos" title="BUY" className="border-start border-bottom border-primary">
          <TopCryptos />
        </Tab>
        <Tab eventKey="wallet" title="SELL" className="border-start border-end border-bottom border-primary">
          <SellAssets />
        </Tab>
        <Tab eventKey="tbd" title="WALLET" className="border-start border-end border-bottom border-primary">
          {/* Pass refreshTrigger to WalletTab to trigger data refresh */}
          <WalletTab refreshTrigger={refreshTrigger} />
        </Tab>
      </Tabs>
    </div>
  );
}
