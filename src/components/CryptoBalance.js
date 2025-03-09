"use client";

import { useState, useEffect } from "react";
import { useCurrency } from "@/context/CurrencyContext";
import { useConversionRate } from "@/hooks/useConversionRate";

export default function CryptoBalance({ user, symbol }) {
  const { currency } = useCurrency();
  const { rate } = useConversionRate(currency);
  const [cryptoFiatTotal, setCryptoFiatTotal] = useState(0);
  const [cryptoWeightedChange, setCryptoWeightedChange] = useState(0);

  // Helper: convert a value using the conversion rate
  const convertValue = (value) => Number(value) * rate;

  // Format currency using locale
  const formatCurrency = (value) => {
    const locale = currency === "USD" ? "en-US" : "de-DE";
    return Number(value).toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  useEffect(() => {
    async function fetchCryptoValues() {
      if (user && user.cryptoAssets && user.cryptoAssets.length > 0) {
        try {
          let totalFiat = 0;
          let weightedChangeSum = 0;
          // Fetch current data for each crypto asset in parallel
          const assetData = await Promise.all(
            user.cryptoAssets.map(async (asset) => {
              const res = await fetch(
                `https://api.coincap.io/v2/assets/${asset.symbol.toLowerCase()}`
              );
              const data = await res.json();
              return data.data; // Contains priceUsd and changePercent24Hr, etc.
            })
          );

          assetData.forEach((coinData, index) => {
            const asset = user.cryptoAssets[index];
            const currentPrice = Number(coinData.priceUsd);
            const fiatValue = asset.balance * currentPrice;
            totalFiat += fiatValue;
            weightedChangeSum += fiatValue * Number(coinData.changePercent24Hr);
          });
          const overallChange = totalFiat ? weightedChangeSum / totalFiat : 0;
          setCryptoFiatTotal(totalFiat);
          setCryptoWeightedChange(overallChange);
        } catch (error) {
          console.error("Error fetching crypto asset values:", error);
          setCryptoFiatTotal(0);
          setCryptoWeightedChange(0);
        }
      } else {
        // No crypto assets: default to 0
        setCryptoFiatTotal(0);
        setCryptoWeightedChange(0);
      }
    }
    fetchCryptoValues();
  }, [user]);

  return (
    <div>
      <h3>Crypto Balance</h3>
      <h2>
        {symbol}
        {formatCurrency(convertValue(cryptoFiatTotal))}{" "}
        <span
          className={
            cryptoWeightedChange >= 0 ? "text-info" : "text-danger"
          }
        >
          ({Number(cryptoWeightedChange).toFixed(2)}%)
        </span>
      </h2>
    </div>
  );
}
