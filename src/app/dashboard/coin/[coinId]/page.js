"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useConversionRate } from "@/hooks/useConversionRate";
import { useCurrency } from "@/context/CurrencyContext";



export default function CoinDetails() {
  const params = useParams();
  const { coinId } = params;
  const [coin, setCoin] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [yearlyHigh, setYearlyHigh] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currency } = useCurrency();
  const { rate } = useConversionRate(currency);

  // Fetch coin details and 7-day history
  useEffect(() => {
    async function fetchCoinData() {
      try {
        // Fetch coin details
        const resCoin = await fetch(`https://api.coincap.io/v2/assets/${coinId}`);
        const coinJson = await resCoin.json();

        // Fetch daily history for the past 7 days (default endpoint might return more data)
        const resHistory = await fetch(
          `https://api.coincap.io/v2/assets/${coinId}/history?interval=d1`
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
          `https://api.coincap.io/v2/assets/${coinId}/history?interval=d1&start=${start}&end=${end}`
        );
        const yearJson = await resYear.json();
        if (yearJson.data && yearJson.data.length > 0) {
          const maxPrice = Math.max(...yearJson.data.map((point) => Number(point.priceUsd)));
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
        <div className="d-flex justify-content-between align-items-center mb-2 w-100">
          <div className="d-flex align-items-center">
            <img
              src={`https://assets.coincap.io/assets/icons/${coin.symbol.toLowerCase()}@2x.png`}
              alt={coin.name}
              style={{ width: "50px", height: "50px", marginRight: "1rem" }}
            />
            <h2 className="fs-1">
              {coin.name} ({coin.symbol})
            </h2>
          </div>
          <h4 className="fs-3">
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
          </h4>
        </div>
      </div>
      <div className="p-4 bg-dark rounded-2 d-flex justify-content-between">
        <div className="fs-5">
        <button type="button" className="btn fs-5 m-0 p-0" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Tooltip on top">
  Market Cap
</button>{" "}
          <p>{symbol}{Number(convertValue(coin.marketCapUsd)).toLocaleString()}</p>
        </div>
        <div className="fs-5">
          <strong>Volume (24h):</strong>{" "}
          <p>{symbol}{Number(convertValue(coin.volumeUsd24Hr)).toLocaleString()}</p>
        </div>
        <div className="fs-5">
          <strong>Supply:</strong>{" "}
          <p>{symbol}{Number(convertValue(coin.supply)).toLocaleString()}</p>
        </div>
        <div className="fs-5">
          <strong>Yearly High:</strong>{" "}
          {yearlyHigh ? (
            <p>{symbol}{formatPrice(convertValue(yearlyHigh))} (+{(100-coin.priceUsd/yearlyHigh*100).toFixed(1)}%)</p>
          ) : (
            <p>Data not available</p>
          )}
        </div>
      </div>
      {/* Chart Section - replace with an actual chart component as needed */}
      <div className="mt-4 p-4 bg-dark rounded-2 border border-primary">
        <h3>Daily Price History (7 Days)</h3>
        {chartData.length > 0 ? (
          <ul>
            {chartData.slice(-7).map((point) => (
              <li key={point.time}>
                {new Date(point.time).toLocaleDateString()}: {symbol}
                {Number(convertValue(point.priceUsd)).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </li>
            ))}
          </ul>
        ) : (
          <p>No historical data available.</p>
        )}
      </div>
    </div>
  );
}
