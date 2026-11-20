"use client";

import { useEffect, useState, useMemo } from "react";
import styles from "./TopCryptos.module.css";
import { formatLargeNumber, formatSuboneNumber } from "../utils/formatNumbers";
import { useConversionRate } from "../hooks/useConversionRate";
import { useCurrency } from "../context/CurrencyContext";
import { sortCryptos } from "../utils/sortCryptos";
import BuyCoinModal from "./BuyCoinModal";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

// Fallback image wrapper component
const CoinIcon = ({ symbol, name }) => {
  const [imgSrc, setImgSrc] = useState(`/icons/${symbol.toLowerCase()}.png`);

  return (
    <Image
      src={imgSrc}
      alt={name}
      width={24}
      height={24}
      loading="lazy"
      onError={() => setImgSrc('/icons/token.png')}
    />
  );
};

export default function CryptoTicker() {
  const [cryptos, setCryptos] = useState([]);
  const [cryptosLoading, setCryptosLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const { currency } = useCurrency();
  const { rate, loading: conversionLoading } = useConversionRate(currency);
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "rank",
    direction: "asc",
  });
  const pathname = usePathname();

  useEffect(() => {
    async function fetchCryptos() {
      try {
        setLoadError(false);
        const res = await fetch("/api/cryptos");
        if (!res.ok) throw new Error("Market data is temporarily unavailable");
        const json = await res.json();
        if (!Array.isArray(json.data)) throw new Error("Market data is temporarily unavailable");
        setCryptos(json.data);
      } catch (error) {
        console.error("Error fetching crypto data:", error);
        setLoadError(true);
      } finally {
        setCryptosLoading(false);
      }
    }
    fetchCryptos();
    const interval = setInterval(fetchCryptos, 500000);
    return () => clearInterval(interval);
  }, []);

  const convertValue = (value) => Number(value) * rate;
  const fiatSymbol = currency === "USD" ? "$" : "€";

  const filteredCryptos = useMemo(() => {
    const query = search.toLowerCase();
    if (!Array.isArray(cryptos)) return [];
    return cryptos.filter(
      (crypto) =>
        crypto.name.toLowerCase().includes(query) ||
        crypto.symbol.toLowerCase().includes(query)
    );
  }, [cryptos, search]);

  const sortedCryptos = useMemo(() => {
    return sortCryptos(cryptos, sortConfig);
  }, [cryptos, sortConfig]);

  const displayCryptos = search.trim() !== "" ? filteredCryptos : sortedCryptos;

  const handleSort = (key) => {
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

  const isLoading = cryptosLoading;

  return (
    <div className={`${styles.tickerContainer} ticker-shell`}>
      {/* Search Bar */}
      <div className="market-search">
        <div className="input-group">
          <span className="input-group-text border-0 bg-transparent">
            <i className="bi bi-search text-primary"></i>
          </span>
          <input
            type="text"
            className="form-control border-0"
            placeholder="Search assets"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading && (
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      )}

      <table className="w-100 market-table">
        <thead className="sticky-top">
          <tr>
            <th></th>
            <th>Asset</th>
            <th
              className="d-none d-md-table-cell"
              onClick={() => handleSort("marketCapUsd")}
              style={{
                cursor: search.trim() === "" ? "pointer" : "not-allowed",
              }}
            >
              Market Cap{renderSortArrow("marketCapUsd")}
            </th>
            <th
              className=""
              onClick={() => handleSort("priceUsd")}
              style={{
                cursor: search.trim() === "" ? "pointer" : "not-allowed",
              }}
            >
              Price{renderSortArrow("priceUsd")}
            </th>
            <th>24h</th>
          </tr>
        </thead>
        <tbody>
          {!isLoading && loadError && (
            <tr><td colSpan="5" className="market-state"><i className="bi bi-cloud-slash" /> Market data is taking a break. Please try again shortly.</td></tr>
          )}
          {!isLoading && !loadError && displayCryptos.length === 0 && (
            <tr><td colSpan="5" className="market-state">{search.trim() ? "No assets match your search." : "No market data available."}</td></tr>
          )}
          {displayCryptos.map((crypto) => (
            <tr key={crypto.id}>
              <td className="text-primary">
                {pathname === "/dashboard" ? (
                  <BuyCoinModal
                    coin={crypto}
                    convertValue={convertValue}
                    fiatSymbol={fiatSymbol}
                    coinId={crypto.id}
                    image={`/icons/${crypto.symbol.toLowerCase()}.png`}
                  />
                ) : (
                  crypto.rank
                )}
              </td>
              <td>
                <Link
                  className="text-decoration-none link-light"
                  href={`/coin/${crypto.id}`}
                >
                  <CoinIcon symbol={crypto.symbol} name={crypto.name} />{" "}
                  {crypto.name}
                </Link>
              </td>
              <td className="d-none d-md-table-cell text-secondary">
                {fiatSymbol}
                {formatLargeNumber(convertValue(crypto.marketCapUsd))}
              </td>
              <td>
                {fiatSymbol}
                {formatSuboneNumber(convertValue(crypto.priceUsd))}
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
