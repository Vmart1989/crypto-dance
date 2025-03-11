"use client";

import { useUser } from "@/context/UserContext";
import styles from "./TopCryptos.module.css";
import { useCurrency } from "@/context/CurrencyContext";
import { useConversionRate } from "@/hooks/useConversionRate";
import { useState, useEffect } from "react";
import SellCoinModal from "./SellCoinModal";
import CryptoBalance from "./CryptoBalance";

export default function SellAssets() {
  const { user } = useUser();
  const { currency } = useCurrency();
  const { rate } = useConversionRate(currency);
  const symbol = currency === "USD" ? "$" : "€";

  // Row-level state: each row can have { id, symbol, coinId, balance, loading, data, error }
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (!user || !user.cryptoAssets || user.cryptoAssets.length === 0) {
      setRows([]);
      return;
    }

    // Create initial rows, now including coinId from the database
    const initialRows = user.cryptoAssets.map((asset) => ({
      id: asset.id,
      symbol: asset.symbol,        // e.g. "BTC", "ETH"
      coinId: asset.coinId,        // e.g. "bitcoin", "ethereum"
      balance: asset.balance,
      loading: true,
      data: null,
      error: null,
    }));

    setRows(initialRows);

    // Fetch data for each row individually using coinId (fallback to symbol if missing)
    initialRows.forEach(async (row) => {
      const endpoint = row.coinId
        ? row.coinId.toLowerCase()
        : row.symbol.toLowerCase();
      try {
        const res = await fetch(`https://api.coincap.io/v2/assets/${endpoint}`);
        const json = await res.json();

        if (!json.data) {
          throw new Error(`No data for ${endpoint}`);
        }

        setRows((prev) =>
          prev.map((r) => {
            if (r.id === row.id) {
              return {
                ...r,
                loading: false,
                data: {
                  currentPriceUsd: Number(json.data.priceUsd),
                  changePercent24Hr: Number(json.data.changePercent24Hr),
                  assetSymbol: json.data.symbol,
                  assetName: json.data.name,
                },
              };
            }
            return r;
          })
        );
      } catch (error) {
        console.error("Error fetching asset data for", row.symbol, error);
        setRows((prev) =>
          prev.map((r) => {
            if (r.id === row.id) {
              return { ...r, loading: false, error: "Failed to load" };
            }
            return r;
          })
        );
      }
    });
  }, [user]);

  // Helper function to format currency
  const formatCurrency = (value) => {
    const locale = currency === "USD" ? "en-US" : "de-DE";
    return Number(value).toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Sort rows by highest fiat value among those that have data
  const sortedRows = [...rows].sort((a, b) => {
    // If either row is loading or has error, push it to the bottom
    if (a.loading || a.error) return 1;
    if (b.loading || b.error) return -1;

    const fiatA =
      a.data?.currentPriceUsd && a.balance
        ? a.balance * a.data.currentPriceUsd * rate
        : 0;
    const fiatB =
      b.data?.currentPriceUsd && b.balance
        ? b.balance * b.data.currentPriceUsd * rate
        : 0;
    return fiatB - fiatA;
  });

  return (
    <div className={styles.tickerContainer}>
      <h2>Crypto Available to Cash Out</h2>
      {sortedRows.length > 0 ? (
        <table className="w-100">
          <thead className="sticky-top">
            <tr>
              <th></th>
              <th></th>
              <th className="fw-light">Quantity</th>
              <th className="fw-light">Value</th>
              <th className="fw-light">24h Change</th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row) => {
              if (row.loading) {
                return (
                  <tr key={row.id}>
                    <td colSpan={5}>
                      <div className="spinner-border text-light" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                );
              }
              if (row.error) {
                return (
                  <tr key={row.id}>
                    <td colSpan={5} className="text-danger">
                      Couldn't load data for {row.symbol}.
                    </td>
                  </tr>
                );
              }

              const { assetSymbol, assetName, currentPriceUsd, changePercent24Hr } = row.data;
              const fiatValue = row.balance * currentPriceUsd * rate;

              return (
                <tr key={row.id}>
                  <td>
                    <SellCoinModal
                      asset={{
                        id: row.id,
                        symbol: row.symbol,
                        coinId: row.coinId || row.symbol, // fallback to symbol if coinId is missing
                        balance: row.balance,
                        currentPriceUsd,
                        assetName,
                        assetSymbol,
                      }}
                      currency={currency}
                    />
                  </td>
                  <td>
                    {assetSymbol ? (
                      <img
                        src={`https://assets.coincap.io/assets/icons/${assetSymbol.toLowerCase()}@2x.png`}
                        alt={assetName || row.symbol}
                        style={{
                          width: "30px",
                          height: "30px",
                          marginRight: "0.5rem",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "30px",
                          height: "30px",
                          marginRight: "0.5rem",
                          backgroundColor: "#444",
                          display: "inline-block",
                        }}
                        title="No image"
                      />
                    )}
                    {assetName || row.symbol}
                  </td>
                  <td>{row.balance}</td>
                  <td>
                    {symbol}
                    {formatCurrency(fiatValue)}
                  </td>
                  <td>
                    <span className={changePercent24Hr >= 0 ? "text-info" : "text-danger"}>
                      {changePercent24Hr.toFixed(2)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p>You don't own any crypto assets yet.</p>
      )}

      <h3 className="mt-5">
        <CryptoBalance user={user} fiatSymbol={symbol} />
      </h3>
    </div>
  );
}
