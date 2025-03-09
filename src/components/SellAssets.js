"use client";

import { useUser } from "@/context/UserContext";
import styles from "./TopCryptos.module.css";
import { useCurrency } from "@/context/CurrencyContext";
import { useConversionRate } from "@/hooks/useConversionRate";
import { useState, useEffect } from "react";
import SellCoinModal from "./SellCoinModal";

export default function SellAssets() {
  const { user } = useUser();
  const { currency } = useCurrency();
  const { rate } = useConversionRate(currency);
  const symbol = currency === "USD" ? "$" : "€";
  const [assetsData, setAssetsData] = useState([]);

  // Fetch current coin data for each asset the user owns
  useEffect(() => {
    async function fetchAssetsData() {
      if (user && user.cryptoAssets && user.cryptoAssets.length > 0) {
        try {
          const data = await Promise.all(
            user.cryptoAssets.map(async (asset) => {
              const res = await fetch(
                `https://api.coincap.io/v2/assets/${asset.symbol.toLowerCase()}`
              );
              const json = await res.json();
              return {
                ...asset,
                currentPriceUsd: Number(json.data.priceUsd),
                changePercent24Hr: Number(json.data.changePercent24Hr),
                assetSymbol: json.data.symbol,
                assetName: json.data.name,
              };
            })
          );
          setAssetsData(data);
        } catch (error) {
          console.error("Error fetching asset data:", error);
        }
      } else {
        setAssetsData([]);
      }
    }
    fetchAssetsData();
  }, [user]);

  // Helper function to format currency
  const formatCurrency = (value) => {
    const locale = currency === "USD" ? "en-US" : "de-DE";
    return Number(value).toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className={styles.tickerContainer}>
      <h3 className="mt-5">Crypto Holdings</h3>
      {assetsData.length > 0 ? (
        <table className="w-100">
          <thead className="sticky-top">
            <tr>
              <th></th> {/* Sell icon column */}
              <th></th>
              <th>Amount Owned</th>
              <th>Current Value</th>
              <th>24h Change</th>
            </tr>
          </thead>
          <tbody>
            {assetsData.map((asset) => {
              // Calculate the current fiat value of this asset
              const fiatValue = asset.balance * asset.currentPriceUsd * rate;
              return (
                <tr key={asset.id}>
                  <td>
                    <SellCoinModal asset={asset} currency={currency} />
                  </td>
                  <td>
                    <img
                      src={`https://assets.coincap.io/assets/icons/${asset.assetSymbol.toLowerCase()}@2x.png`}
                      alt={asset.name}
                      style={{
                        width: "30px",
                        height: "30px",
                        marginRight: "0.5rem",
                      }}
                    />
                    {asset.assetName}
                  </td>
                  <td>{asset.balance}</td>
                  <td>
                    {symbol}
                    {formatCurrency(fiatValue)}
                  </td>
                  <td>
                    <span
                      className={
                        asset.changePercent24Hr >= 0
                          ? "text-info"
                          : "text-danger"
                      }
                    >
                      {asset.changePercent24Hr.toFixed(2)}%
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
    </div>
  );
}
