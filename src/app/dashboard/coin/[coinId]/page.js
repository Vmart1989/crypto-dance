"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useConversionRate } from "@/hooks/useConversionRate";
import { useCurrency } from "@/context/CurrencyContext";
import PriceHistoryChart from "@/components/PriceHistoryChart";
import BuyCoinModal from "@/components/BuyCoinModal";

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

        // Fetch daily history for the past 7 days
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
        <div className="d-flex flex-column flex-md-row justify-content-between mb-2 w-100">
          <div className="d-flex align-items-center">
            <img
              src={`https://assets.coincap.io/assets/icons/${coin.symbol.toLowerCase() || "default"}@2x.png`}
              alt={coin.name}
              style={{ width: "50px", height: "50px", marginRight: "1rem" }}
            />
            <h2 className="fs-1">
              {coin.name} ({coin.symbol})
            </h2>
          </div>
          <h4 className="fs-3 mt-3 mt-md-0">
            {symbol}
            {formatPrice(convertValue(coin.priceUsd))}{" "}
            <span
              className={
                Number(coin.changePercent24Hr) >= 0 ? "text-info" : "text-danger"
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
        <BuyCoinModal
          coin={coin}
          convertValue={convertValue}
          symbol={symbol}
          coinId={coin.id} 
          image={`https://assets.coincap.io/assets/icons/${coin.symbol.toLowerCase()}@2x.png`}
        />
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
      <PriceHistoryChart
        coinId={coinId}
        convertValue={convertValue}
        coin={coin}
        symbol={symbol}
      />
    </div>
  );
}
