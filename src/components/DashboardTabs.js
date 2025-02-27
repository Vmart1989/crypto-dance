"use client";

import { Tab, Tabs } from "react-bootstrap";
import TopCryptos from "@/components/TopCryptos";


export default function DashboardTabs() {
  return (
    <div className="container mt-1">
      <Tabs defaultActiveKey="cryptos" id="dashboard-tabs" className="custom-tabs" fill>
        <Tab eventKey="cryptos" title="Top 100 Cryptos">
          <TopCryptos />
        </Tab>
        <Tab eventKey="wallet" title="Wallet Holdings">
        <p>Content for TBD tab.</p>
        </Tab>
        <Tab eventKey="tbd" title="TBD">
          <p>Content for TBD tab.</p>
        </Tab>
      </Tabs>
    </div>
  );
}
