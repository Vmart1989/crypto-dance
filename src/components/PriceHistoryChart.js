"use client";

import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function PriceHistoryChart({
  coinId,
  convertValue,
  coin,
  symbol,
}) {
  const [chartData, setChartData] = useState([]);
  const [timeRange, setTimeRange] = useState("week");
  const [loading, setLoading] = useState(true);

  function getChartParams(range) {
    const end = Date.now();
    let start, interval;
    switch (range) {
      case "day":
        start = end - 24 * 60 * 60 * 1000;
        interval = "h1";
        break;
      case "week":
        start = end - 7 * 24 * 60 * 60 * 1000;
        interval = "d1";
        break;
      case "month":
        start = end - 30 * 24 * 60 * 60 * 1000;
        interval = "d1";
        break;
      case "year":
        start = end - 365 * 24 * 60 * 60 * 1000;
        interval = "d1";
        break;
      default:
        start = end - 7 * 24 * 60 * 60 * 1000;
        interval = "d1";
    }
    return { start, end, interval };
  }

  useEffect(() => {
    const cacheKey = `${coinId}-${timeRange}`;
    const cachedResponse = sessionStorage.getItem(cacheKey);

    async function fetchChartData() {
      try {
        setLoading(true);

        if (cachedResponse) {
          setChartData(JSON.parse(cachedResponse));
          setLoading(false);
          return;
        }

        const { start, end, interval } = getChartParams(timeRange);
        const res = await fetch(
          `/api/crypto-history?id=${coinId}&interval=${interval}&start=${start}&end=${end}`
        );
        const data = await res.json();

        if (Array.isArray(data.data)) {
          setChartData(data.data);
          sessionStorage.setItem(cacheKey, JSON.stringify(data.data));
        } else {
          setChartData([]);
          console.error("Unexpected chart data format:", data);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching chart data:", err);
        setChartData([]);
        setLoading(false);
      }
    }

    fetchChartData();

    const timer = setTimeout(() => {
      sessionStorage.removeItem(cacheKey);
    }, 60000);

    return () => clearTimeout(timer);
  }, [coinId, timeRange]);

  const labels = Array.isArray(chartData)
    ? chartData.map((point) => {
        const dateObj = new Date(point.time);
        return timeRange === "day"
          ? dateObj.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : dateObj.toLocaleDateString();
      })
    : [];

  const prices = Array.isArray(chartData)
    ? chartData.map((point) => convertValue(point.priceUsd))
    : [];

  const highPrice = prices.length ? Math.max(...prices) : null;
  const lowPrice = prices.length ? Math.min(...prices) : null;
  const averagePrice = prices.length
    ? prices.reduce((sum, price) => sum + price, 0) / prices.length
    : null;

  const data = {
    labels,
    datasets: [
      {
        label: `${coin?.symbol} Price`,
        data: prices,
        fill: false,
        borderColor: "rgba(75,192,192,1)",
        tension: 0.2,
        borderWidth: timeRange === "year" ? 1 : 2,
        pointStyle: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: { display: false, text: "Price History" },
    },
    scales: {
      x: { title: { display: true, text: "" } },
      y: { title: { display: true, text: `Price (${symbol})` } },
    },
  };

  return (
    <div className="mt-4 p-4 bg-dark rounded-2 border border-primary">
      <h3>Price History</h3>
      <div className="btn-group mb-3" role="group">
        {["day", "week", "month", "year"].map((range) => (
          <button
            key={range}
            type="button"
            className={`btn btn-outline-primary ${
              timeRange === range ? "active" : ""
            }`}
            onClick={() => setTimeRange(range)}
          >
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      ) : chartData.length > 0 ? (
        <div style={{ position: "relative", height: "400px" }}>
          <Line data={data} options={options} />
        </div>
      ) : (
        <p>No historical data available for this range.</p>
      )}
    </div>
  );
}
