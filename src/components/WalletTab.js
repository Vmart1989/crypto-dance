"use client";

import { useState, useEffect } from "react";
import styles from "./TopCryptos.module.css";
import { useUser } from "@/context/UserContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useConversionRate } from "@/hooks/useConversionRate";
import Link from "next/link";

function computeCoinStats(transactions) {
  const stats = {};
  transactions.forEach((tx) => {
    if (!tx.cryptoSymbol) return;
    const sym = tx.cryptoSymbol.toLowerCase();
    if (!stats[sym]) {
      stats[sym] = {
        netFiatSpent: 0,
        netCoinsBought: 0,
      };
    }
    if (tx.type === "buy") {
      stats[sym].netFiatSpent += tx.fiatAmount;
      stats[sym].netCoinsBought += tx.amount;
    } else if (tx.type === "sell") {
      stats[sym].netFiatSpent -= tx.fiatAmount;
      stats[sym].netCoinsBought -= tx.amount;
    }
  });
  const result = {};
  for (const sym in stats) {
    const { netFiatSpent, netCoinsBought } = stats[sym];
    result[sym] = {
      fiatInvested: netFiatSpent > 0 ? netFiatSpent : 0,
      averageCost: netCoinsBought > 0 ? netFiatSpent / netCoinsBought : 0,
    };
  }
  return result;
}

export default function WalletTab({ refreshTrigger }) {
  const { user } = useUser();
  const { currency } = useCurrency();
  const { rate } = useConversionRate(currency);
  const isUSD = currency === "USD";
  const fiatSymbol = isUSD ? "$" : "€";

  const [assetData, setAssetData] = useState([]);
  const [coinStats, setCoinStats] = useState({});
  const [totalUnrealized, setTotalUnrealized] = useState(0);

  useEffect(() => {
    if (!user || !user.transactions) return;
    const stats = computeCoinStats(user.transactions);
    setCoinStats(stats);
  }, [user]);

  useEffect(() => {
    async function fetchPrices() {
      if (!user || !user.cryptoAssets) return;
      const fetched = await Promise.all(
        user.cryptoAssets.map(async (asset) => {
          try {
            const endpoint = asset.coinId
              ? asset.coinId.toLowerCase()
              : asset.symbol.toLowerCase();
            const res = await fetch(`https://api.coincap.io/v2/assets/${endpoint}`);
            const json = await res.json();
            if (!json.data) {
              throw new Error(`No data for ${asset.symbol}`);
            }
            return {
              symbol: asset.symbol,
              balance: asset.balance,
              name: json.data.name,
              coinId: asset.coinId,
              priceUsd: Number(json.data.priceUsd),
              change24h: Number(json.data.changePercent24Hr),
            };
          } catch (error) {
            console.error("Error fetching coin price for", asset.symbol, error);
            return {
              symbol: asset.symbol,
              balance: asset.balance,
              name: asset.symbol,
              priceUsd: 0,
              change24h: 0,
            };
          }
        })
      );
      setAssetData(fetched);
    }

    if (refreshTrigger > 0) {
      fetchPrices();
    }
  }, [user, refreshTrigger]);

  useEffect(() => {
    let total = 0;
    assetData.forEach((coin) => {
      const key = coin.symbol.toLowerCase();
      const stats = coinStats[key] || { fiatInvested: 0 };
      const currentValueFiat = coin.balance * coin.priceUsd * rate;
      const fiatInvestedFiat = stats.fiatInvested * rate;
      total += currentValueFiat - fiatInvestedFiat;
    });
    setTotalUnrealized(total);
  }, [assetData, coinStats, rate]);

  const totalFiatValueUsd = assetData.reduce((sum, coin) => {
    return sum + coin.balance * coin.priceUsd;
  }, 0);

  const formatFiat = (value) => {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className={styles.tickerContainer}>
      <h2>Crypto Assets</h2>

      <div className="mb-4 p-3 rounded dark-bg lh-1" style={{ maxWidth: "400px" }}>
        <h4>
          Total Unrealized P/L:{" "}
          <span className={totalUnrealized >= 0 ? "text-info" : "text-danger"}>
            {fiatSymbol}
            {totalUnrealized >= -0.09
              ? formatFiat(totalUnrealized.toFixed(2))
              : formatFiat(totalUnrealized.toFixed(4))}
          </span>
        </h4>
      </div>

      <div className="d-flex flex-wrap gap-3">
        {assetData.length === 0 ? (
          <p>You do not own any crypto assets.</p>
        ) : (
          assetData.map((coin) => {
            const key = coin.symbol.toLowerCase();
            const stats = coinStats[key] || { fiatInvested: 0, averageCost: 0 };
            const currentValueUsd = coin.balance * coin.priceUsd;
            const currentValueFiat = currentValueUsd * rate;
            const fiatInvestedFiat = stats.fiatInvested * rate;
            const unrealized = currentValueFiat - fiatInvestedFiat;
            const diversityPct =
              totalFiatValueUsd > 0
                ? ((currentValueUsd / totalFiatValueUsd) * 100).toFixed(2)
                : "0.00";

            return (
              <div
                key={coin.symbol}
                className="p-3 rounded flex-fill dark-bg lh-1"
                style={{ minWidth: "250px", maxWidth: "300px" }}
              >
                <div className="d-flex align-items-center mb-4">
                  <img
                    src={`https://assets.coincap.io/assets/icons/${coin.symbol.toLowerCase()}@2x.png`}
                    alt={coin.name}
                    style={{ width: "32px", height: "32px", marginRight: "0.5rem" }}
                    onError={(e) => (e.target.style.display = "none")}
                  />
                  <Link href={`/coin/${coin.coinId}`} className="text-decoration-none link-light">
                    <h5 className="m-0">
                      {coin.name} ({coin.symbol})
                    </h5>
                  </Link>
                </div>
                <p>Balance: {coin.balance.toFixed(2)}</p>
                <p>
                  Value: {fiatSymbol}
                  {formatFiat(currentValueFiat)}{" "}
                  <span className={coin.change24h >= 0 ? "text-info" : "text-danger"}>
                    ({coin.change24h.toFixed(2)}% / 24h)
                  </span>
                </p>
                <p>Fiat Invested: {fiatSymbol}{formatFiat(fiatInvestedFiat)}</p>
                <p>
                  Average Cost: {fiatSymbol}
                  {stats.averageCost * rate > 0.009
                    ? formatFiat((stats.averageCost * rate).toFixed(2))
                    : formatFiat((stats.averageCost * rate).toFixed(7))}
                </p>
                <p>Portfolio Diversity: {diversityPct}%</p>
                <p>
                  Unrealized P/L:{" "}
                  <span className={unrealized >= 0 ? "text-info" : "text-danger"}>
                    {fiatSymbol}{formatFiat(unrealized)}
                  </span>
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
