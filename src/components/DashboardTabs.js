"use client";

import { Tab, Tabs } from "react-bootstrap";
import TopCryptos from "@/components/TopCryptos";
import SellAssets from "./SellAssets";
import WalletTab from "./WalletTab";

export default function DashboardTabs() {
  return (
    <div className="container ">
      <Tabs
        defaultActiveKey="cryptos"
        id="dashboard-tabs"
        className="custom-tabs"
        fill
      >
        <Tab
          eventKey="cryptos"
          title="BUY"
          className="border-start border-bottom border-primary"
        >
          <TopCryptos />
        </Tab>
        <Tab eventKey="wallet" title="SELL" className="border-start border-end border-bottom border-primary">
          <SellAssets />
        </Tab>
        <Tab eventKey="tbd" title="WALLET" className="border-start border-end border-bottom border-primary">
        <WalletTab />
        </Tab>
      </Tabs>
    </div>
  );
}
