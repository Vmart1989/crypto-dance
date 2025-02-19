"use client";

import { useEffect, useState } from "react";
import styles from "./TopCryptos.module.css";
import { formatLargeNumber } from "../utils/formatNumbers";
import { useConversionRate } from "../hooks/useConversionRate";
import { useCurrency } from "../context/CurrencyContext";

export default function CryptoTicker() {
  const [cryptos, setCryptos] = useState([]);
  // Read the current currency from context
  const { currency } = useCurrency();
  // Get conversion rate based on current currency
  const { rate, loading } = useConversionRate(currency);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchCryptos() {
      try {
        const res = await fetch("/api/cryptos");
        const json = await res.json();
        setCryptos(json.data);
      } catch (error) {
        console.error("Error fetching crypto data:", error);
      }
    }
    fetchCryptos();

    // Refresh data every 60 seconds
    const interval = setInterval(fetchCryptos, 60000);
    return () => clearInterval(interval);
  }, []);

  // Convert USD values using the conversion rate
  const convertValue = (value) => Number(value) * rate;

  // Use appropriate symbol
  const symbol = currency === "USD" ? "$" : "€";

  // Filter cryptos based on the search query (by name or symbol)
  const filteredCryptos = cryptos.filter((crypto) => {
    const query = search.toLowerCase();
    return (
      crypto.name.toLowerCase().includes(query) ||
      crypto.symbol.toLowerCase().includes(query)
    );
  });

  return (
    <div className={styles.tickerContainer}>
      <div className="mb-1">
                <input
                  type="text"
                  placeholder="Search today's top 100 cryptos..."
                  className="form-control border border-0"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
      <table className="w-100">
        <thead>
          <tr>
            <th>
              {loading && (
                <div className="spinner-border text-light" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              )}
            </th>
            <th className="p-1 pb-3">
              {/* Search Bar */}
              
            </th>
            <th className="d-none d-md-table-cell p-1 pb-3">Market Cap</th>
            <th className="p-1 pb-3">Price</th>
            <th className="p-1 pb-3">24h Change</th>
          </tr>
        </thead>
        <tbody>
          {filteredCryptos.map((crypto) => (
            <tr key={crypto.id}>
              <td className="ps-2 pb-2">{crypto.rank}</td>
              <td className="pb-2">
                <img
                  src={`https://assets.coincap.io/assets/icons/${crypto.symbol.toLowerCase()}@2x.png`}
                  alt={crypto.name}
                  width="24"
                  height="24"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />{" "}
                {crypto.name}
              </td>
              <td className="d-none d-md-table-cell pb-2">
                {symbol} {formatLargeNumber(convertValue(crypto.marketCapUsd))}
              </td>
              <td className="pe-4 pb-2">
                {symbol}{" "}
                {Number(convertValue(crypto.priceUsd)).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
              <td
                className={
                  Number(crypto.changePercent24Hr) > 0
                    ? "text-info pb-2"
                    : "text-danger pb-2"
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
