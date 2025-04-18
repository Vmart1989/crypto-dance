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
        const res = await fetch("/api/cryptos");
        const json = await res.json();
        setCryptos(json.data);
      } catch (error) {
        console.error("Error fetching crypto data:", error);
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
            placeholder="Search top coins..."
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

      <table className="w-100">
        <thead className="sticky-top">
          <tr>
            <th className="p-1 pb-3 "></th>
            <th className="p-1 pb-3 "></th>
            <th
              className="d-none d-md-table-cell p-1 pb-3 bg-for-th"
              onClick={() => handleSort("marketCapUsd")}
              style={{
                cursor: search.trim() === "" ? "pointer" : "not-allowed",
              }}
            >
              Market Cap{renderSortArrow("marketCapUsd")}
            </th>
            <th
              className="p-1 pb-3 bg-for-th"
              onClick={() => handleSort("priceUsd")}
              style={{
                cursor: search.trim() === "" ? "pointer" : "not-allowed",
              }}
            >
              Price{renderSortArrow("priceUsd")}
            </th>
            <th className="p-1 pb-3 bg-for-th">24h Change</th>
          </tr>
        </thead>
        <tbody>
          {displayCryptos.map((crypto) => (
            <tr key={crypto.id}>
              <td className="ps-2 pb-2 text-primary">
                {pathname === "/dashboard" ? (
                  <BuyCoinModal
                    coin={crypto}
                    convertValue={convertValue}
                    symbol={fiatSymbol}
                    coinId={crypto.id}
                    image={`/icons/${crypto.symbol.toLowerCase()}.png`}
                  />
                ) : (
                  crypto.rank
                )}
              </td>
              <td className="pb-2">
                <Link
                  className="text-decoration-none link-light"
                  href={`/coin/${crypto.id}`}
                >
                  <CoinIcon symbol={crypto.symbol} name={crypto.name} />{" "}
                  {crypto.name}
                </Link>
              </td>
              <td className="d-none d-md-table-cell pb-2">
                {fiatSymbol}
                {formatLargeNumber(convertValue(crypto.marketCapUsd))}
              </td>
              <td className="pe-4 pb-2">
                {fiatSymbol}
                {formatSuboneNumber(convertValue(crypto.priceUsd))}
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
