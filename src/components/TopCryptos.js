
"use client";

import { useEffect, useState } from "react";
import styles from "./TopCryptos.module.css";
import { formatLargeNumber } from "../utils/formatNumbers";

export default function CryptoTicker() {
  const [cryptos, setCryptos] = useState([]);

  useEffect(() => {
    async function fetchCryptos() {
      try {
        const res = await fetch("/api/cryptos");;
        const json = await res.json();
        setCryptos(json.data);
      } catch (error) {
        console.error("Error fetching crypto data:", error);
      }
    }
    fetchCryptos();

    // Set up interval to refresh every 60 seconds
    const interval = setInterval(fetchCryptos, 60000);

    // Clear the interval when the component unmounts
    return () => clearInterval(interval);
  }, []);



  return (
    <div className={styles.tickerContainer} >
      <table className="w-100">
        <thead>
          <tr>
            <th></th>
            <th></th>
            <th className="d-none d-md-table-cell p-1">Market Cap</th>
            <th className="p-1">Price</th>
            <th className="p-1">24h Change</th>
          </tr>
        </thead>
        <tbody>
          {cryptos.map((crypto) => (
            <tr key={crypto.id}>
              <td className="ps-2">{crypto.rank}</td>
              <td><img
          src={`https://assets.coincap.io/assets/icons/${crypto.symbol.toLowerCase()}@2x.png`}
          alt={crypto.name}
          width="24"
          height="24"
          onError={(e) => {
            // hide the image if it fails to load
            e.target.style.display = 'none';
          }}
        /> {crypto.name}</td>
              <td className="d-none d-md-table-cell ">
  $
  {formatLargeNumber(crypto.marketCapUsd)}
</td>
<td className="pe-4">
  $
  {Number(crypto.priceUsd).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}
</td>
              <td
                className={
                  Number(crypto.changePercent24Hr) > 0
                    ? "text-info"
                    : "text-danger"
                }
              >
                {Number(crypto.changePercent24Hr).toFixed(2)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
