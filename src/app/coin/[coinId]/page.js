"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useConversionRate } from "@/hooks/useConversionRate";
import { useCurrency } from "@/context/CurrencyContext";
import PriceHistoryChart from "@/components/PriceHistoryChart";
import BuyCoinModal from "@/components/BuyCoinModal";
import { useUser } from "@/context/UserContext";
import Link from "next/link";

//fallback icon component
const CoinIcon = ({ symbol, name, size = 50 }) => {
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
        marginRight: "1rem",
        objectFit: "contain",
      }}
      onError={() => setImgSrc("/icons/token.png")}
    />
  );
};

export default function CoinDetails() {
  const params = useParams();
  const { coinId } = params;
  const [coin, setCoin] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [yearlyHigh, setYearlyHigh] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currency } = useCurrency();
  const { rate } = useConversionRate(currency);
  const { user } = useUser();

  // Fetch coin details and 7-day history
  useEffect(() => {
    async function fetchCoinData() {
      try {
        // Fetch coin details
        const resCoin = await fetch(`/api/crypto?id=${coinId}`);
        const coinJson = await resCoin.json();

        // Fetch daily history for the past 7 days
        const resHistory = await fetch(
          `/api/crypto-history?id=${coinId}&interval=d1`
        );
        const historyJson = await resHistory.json();

        setCoin(coinJson.data);
        setChartData(historyJson.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching coin data:", err);
        setLoading(false);
      }
    }
    fetchCoinData();
  }, [coinId]);

  // Fetch yearly high from past year data
  useEffect(() => {
    async function fetchYearlyHigh() {
      try {
        const end = Date.now();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        const start = oneYearAgo.getTime();

        const resYear = await fetch(
          `/api/crypto-history?id=${coinId}&interval=d1&start=${start}&end=${end}`
        );
        const yearJson = await resYear.json();
        if (yearJson.data && yearJson.data.length > 0) {
          const maxPrice = Math.max(
            ...yearJson.data.map((point) => Number(point.priceUsd))
          );
          setYearlyHigh(maxPrice);
        }
      } catch (err) {
        console.error("Error fetching yearly high:", err);
      }
    }
    fetchYearlyHigh();
  }, [coinId]);

  const convertValue = (value) => Number(value) * rate;
  const symbol = currency === "USD" ? "$" : "€";

  // Format price: if >= 1 then 2 decimals; if below 1, then 7 decimals.
  const formatPrice = (price) => {
    const num = Number(price);
    return num >= 1 ? num.toFixed(2) : num.toFixed(7);
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  if (!coin) return <div>No coin data available</div>;

  return (
    <div className="container mt-2">
      <div className="p-4 bg-dark rounded-2">
        <div className="d-flex flex-column flex-md-row justify-content-between mb-2 w-100">
          <div className="d-flex align-items-center">
            {coin?.symbol && <CoinIcon symbol={coin.symbol} name={coin.name} />}

            <h2 className="fs-1">
              {coin.name} ({coin.symbol})
            </h2>
          </div>
          <h4 className="fs-3 mt-3 mt-md-0">
            {symbol}
            {formatPrice(convertValue(coin.priceUsd))}{" "}
            <span
              className={
                Number(coin.changePercent24Hr) >= 0
                  ? "text-info"
                  : "text-danger"
              }
            >
              ({Number(coin.changePercent24Hr).toFixed(2)}%)
            </span>
            <i
              className="bi bi-question-circle ms-1 tooltip-text"
              title="Change in 24h"
            ></i>
          </h4>
        </div>
        {/* Pass coinId from the fetched coin data */}
        {coin?.symbol && (
          <BuyCoinModal
            coin={coin}
            convertValue={convertValue}
            symbol={symbol}
            coinId={coin.id}
            image={`https://assets.coincap.io/assets/icons/${coin.symbol.toLowerCase()}@2x.png`}
          />
        )}
      </div>
      <div className="p-4 flex-column flex-md-row bg-dark rounded-2 d-flex justify-content-between">
        <div className="fs-5">
          <strong>
            Market Cap
            <i
              className="bi bi-question-circle ms-1 tooltip-text"
              title="Price × Circulating Supply"
            ></i>
          </strong>
          <p>
            {symbol}
            {Number(convertValue(coin.marketCapUsd)).toLocaleString()}
          </p>
        </div>
        <div className="fs-5">
          <strong>
            Volume (24h)
            <i
              className="bi bi-question-circle ms-1 tooltip-text"
              title="Sum of all trade values in 24 hours"
            ></i>
          </strong>
          <p>
            {symbol}
            {Number(convertValue(coin.volumeUsd24Hr)).toLocaleString()}
          </p>
        </div>
        <div className="fs-5">
          <strong>
            Supply
            <i
              className="bi bi-question-circle ms-1 tooltip-text"
              title="Total coins in circulation"
            ></i>
          </strong>
          <p>
            {symbol}
            {Number(convertValue(coin.supply)).toLocaleString()}
          </p>
        </div>
        <div className="fs-5">
          <strong>
            Yearly High
            <i
              className="bi bi-question-circle ms-1 tooltip-text"
              title="Highest price over last 365 days"
            ></i>
          </strong>
          {yearlyHigh ? (
            <p>
              {symbol}
              {formatPrice(convertValue(yearlyHigh))} (+
              {(100 - (coin.priceUsd / yearlyHigh) * 100).toFixed(1)}%)
            </p>
          ) : (
            <p>Data not available</p>
          )}
        </div>
      </div>
      {user ? (
        <PriceHistoryChart
          coinId={coinId}
          convertValue={convertValue}
          coin={coin}
          symbol={symbol}
        />
      ) : (
        <div className="p-4 mt-3 bg-dark rounded-2 text-center border border-secondary">
          <p className="mb-0 text-muted">
            <strong>
              <Link
                href="/register"
                className="text-primary text-decoration-underline"
              >
                Login
              </Link>{" "}
              to see full history charts.
            </strong>
          </p>
        </div>
      )}
    </div>
  );
}
