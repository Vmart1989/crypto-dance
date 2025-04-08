"use client";

import { useUser } from "@/context/UserContext";
import styles from "./TopCryptos.module.css";
import { useCurrency } from "@/context/CurrencyContext";
import { useConversionRate } from "@/hooks/useConversionRate";
import { useState, useEffect } from "react";
import SellCoinModal from "./SellCoinModal";
import CryptoBalance from "./CryptoBalance";

// Fallback-safe coin icon component
const CoinIcon = ({ symbol, name, size = 30 }) => {
  const [imgSrc, setImgSrc] = useState(`/icons/${symbol.toLowerCase()}.png`);

  return (
    <img
      src={imgSrc}
      alt={name}
      width={size}
      height={size}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        marginRight: "0.5rem",
        verticalAlign: "middle",
      }}
      onError={() => setImgSrc("/icons/token.png")}
    />
  );
};

export default function SellAssets() {
  const { user } = useUser();
  const { currency } = useCurrency();
  const { rate } = useConversionRate(currency);
  const symbol = currency === "USD" ? "$" : "€";

  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (!user || !user.cryptoAssets || user.cryptoAssets.length === 0) {
      setRows([]);
      return;
    }

    const initialRows = user.cryptoAssets.map((asset) => ({
      id: asset.id,
      symbol: asset.symbol,
      coinId: asset.coinId,
      balance: asset.balance,
      loading: true,
      data: null,
      error: null,
    }));

    setRows(initialRows);

    initialRows.forEach(async (row) => {
      const endpoint = row.coinId
        ? row.coinId.toLowerCase()
        : row.symbol.toLowerCase();
      try {
        const res = await fetch(`/api/crypto?id=${endpoint}`);
        const json = await res.json();

        if (!json.data) {
          throw new Error(`No data for ${endpoint}`);
        }

        setRows((prev) =>
          prev.map((r) =>
            r.id === row.id
              ? {
                  ...r,
                  loading: false,
                  data: {
                    currentPriceUsd: Number(json.data.priceUsd),
                    changePercent24Hr: Number(json.data.changePercent24Hr),
                    assetSymbol: json.data.symbol,
                    assetName: json.data.name,
                  },
                }
              : r
          )
        );
      } catch (error) {
        console.error("Error fetching asset data for", row.symbol, error);
        setRows((prev) =>
          prev.map((r) =>
            r.id === row.id ? { ...r, loading: false, error: "Failed to load" } : r
          )
        );
      }
    });
  }, [user]);

  const formatCurrency = (value) => {
    const locale = currency === "USD" ? "en-US" : "de-DE";
    return Number(value).toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const sortedRows = [...rows].sort((a, b) => {
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
              <th className="fw-light d-none d-md-table-cell">24h Change</th>
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

              const {
                assetSymbol,
                assetName,
                currentPriceUsd,
                changePercent24Hr,
              } = row.data;
              const fiatValue = row.balance * currentPriceUsd * rate;

              return (
                <tr key={row.id}>
                  <td>
                    <SellCoinModal
                      asset={{
                        id: row.id,
                        symbol: row.symbol,
                        coinId: row.coinId || row.symbol,
                        balance: row.balance,
                        currentPriceUsd,
                        assetName,
                        assetSymbol,
                      }}
                      currency={currency}
                    />
                  </td>
                  <td>
                    <CoinIcon symbol={assetSymbol} name={assetName || row.symbol} />
                    {assetName || row.symbol}
                  </td>
                  <td>{row.balance}</td>
                  <td>
                    {symbol}
                    {formatCurrency(fiatValue)}
                  </td>
                  <td className="d-none d-md-table-cell">
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
