// components/CryptoTicker.js
"use client";

import { useEffect, useState } from "react";
import styles from "./CryptoTicker.module.css";

export default function CryptoTicker() {
  const [cryptos, setCryptos] = useState([]);

  useEffect(() => {
    async function fetchCryptos() {
      try {
        const res = await fetch("https://api.coincap.io/v2/assets?limit=100");
        const json = await res.json();
        setCryptos(json.data);
      } catch (error) {
        console.error("Error fetching crypto data:", error);
      }
    }
    fetchCryptos();
  }, []);

  // Duplicate the list for seamless scrolling
  const tickerItems = [...cryptos, ...cryptos];

  return (
    <div className={styles.tickerContainer}>
      <table className="table table-light text-primary">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>Price (USD)</th>
            <th>24h Change (%)</th>
          </tr>
        </thead>
        <tbody className={styles.tickerContent}>
          {tickerItems.map((crypto, index) => (
            <tr key={`${crypto.id}-${index}`}>
              <td>{crypto.rank}</td>
              <td>{crypto.name}</td>
              <td>${Number(crypto.priceUsd).toFixed(2)}</td>
              <td>{Number(crypto.changePercent24Hr).toFixed(2)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
