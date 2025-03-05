"use client";

import { useEffect, useState, useMemo } from "react";
import styles from "./TopCryptos.module.css";
import { formatLargeNumber } from "../utils/formatNumbers";
import { formatSuboneNumber } from "../utils/formatNumbers";
import { useConversionRate } from "../hooks/useConversionRate";
import { useCurrency } from "../context/CurrencyContext";
import { sortCryptos } from "../utils/sortCryptos";
import Link from "next/link";

export default function CryptoTicker() {
  const [cryptos, setCryptos] = useState([]);
  const { currency } = useCurrency();
  const { rate, loading } = useConversionRate(currency);
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "rank",
    direction: "asc",
  });

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
    const interval = setInterval(fetchCryptos, 60000);
    return () => clearInterval(interval);
  }, []);

  const convertValue = (value) => Number(value) * rate;
  const symbol = currency === "USD" ? "$" : "€";

  // filter list based on the search query
  const filteredCryptos = useMemo(() => {
    const query = search.toLowerCase();
    return cryptos.filter(
      (crypto) =>
        crypto.name.toLowerCase().includes(query) ||
        crypto.symbol.toLowerCase().includes(query)
    );
  }, [cryptos, search]);

  // compute the sorted list from cryptos using sortConfig
  const sortedCryptos = useMemo(() => {
    return sortCryptos(cryptos, sortConfig);
  }, [cryptos, sortConfig]);

  // Use the filtered list if there is a search query; otherwise, use the sorted list.
  const displayCryptos = search.trim() !== "" ? filteredCryptos : sortedCryptos;

  const handleSort = (key) => {
    // Only allow sorting when there's no search query
    if (search.trim() !== "") return;
    if (sortConfig.key === key) {
      setSortConfig({
        key,
        direction: sortConfig.direction === "asc" ? "desc" : "asc",
      });
    } else {
      setSortConfig({ key, direction: "desc" });
    }
  };

  const renderSortArrow = (key) => {
    if (sortConfig.key !== key || search.trim() !== "") return null;
    return sortConfig.direction === "asc" ? " ▲" : " ▼";
  };

  return (
    <div className={styles.tickerContainer}>
      {/* Search Bar */}
      <div className="mb-3">
        <div className="input-group sticky-top">
          <span className="input-group-text border-0 bg-transparent">
            <i className="bi bi-search text-primary"></i>
          </span>
          <input
            type="text"
            className="form-control border-0"
            placeholder="Search top 100 coins..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading && (
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      )}

      <table className="w-100">
        <thead className="sticky-top">
          <tr>
            <th className="p-1 pb-3"></th>
            <th className="p-1 pb-3">Today's top 100 Cryptocurrencies</th>
            <th
              className="d-none d-md-table-cell p-1 pb-3"
              onClick={() => handleSort("marketCapUsd")}
              style={{
                cursor: search.trim() === "" ? "pointer" : "not-allowed",
              }}
            >
              Market Cap{renderSortArrow("marketCapUsd")}
            </th>
            <th
              className="p-1 pb-3"
              onClick={() => handleSort("priceUsd")}
              style={{
                cursor: search.trim() === "" ? "pointer" : "not-allowed",
              }}
            >
              Price{renderSortArrow("priceUsd")}
            </th>
            <th className="p-1 pb-3">24h Change</th>
          </tr>
        </thead>
        <tbody>
          {displayCryptos.map((crypto) => (
            <tr key={crypto.id}>
              <td className="ps-2 pb-2 text-primary">{crypto.rank}</td>
              <td className="pb-2">
              <Link className="text-decoration-none link-light" href={`/dashboard/coin/${crypto.id}`}>
              
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
                
            </Link>
              </td>
              <td className="d-none d-md-table-cell pb-2">
                {symbol} {formatLargeNumber(convertValue(crypto.marketCapUsd))}
              </td>
              <td className="pe-4 pb-2">
                {symbol} {formatSuboneNumber(convertValue(crypto.priceUsd))}
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
