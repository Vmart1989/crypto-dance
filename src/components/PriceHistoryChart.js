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

  // Helper: determine timestamps and API interval based on selected time range
  function getChartParams(range) {
    const end = Date.now();
    let start, interval;
    switch (range) {
      case "day":
        start = end - 24 * 60 * 60 * 1000; // 24 hours ago
        interval = "h1"; // hourly data
        break;
      case "week":
        start = end - 7 * 24 * 60 * 60 * 1000; // 7 days ago
        interval = "d1"; // daily data
        break;
      case "month":
        start = end - 30 * 24 * 60 * 60 * 1000; // 30 days ago
        interval = "d1";
        break;
      case "year":
        start = end - 365 * 24 * 60 * 60 * 1000; // 365 days ago
        interval = "d1";
        break;
      default:
        start = end - 7 * 24 * 60 * 60 * 1000;
        interval = "d1";
    }
    return { start, end, interval };
  }

  // Fetch chart data when coinId or timeRange changes
  useEffect(() => {
    async function fetchChartData() {
      try {
        setLoading(true);
        const { start, end, interval } = getChartParams(timeRange);
        const res = await fetch(
          `https://api.coincap.io/v2/assets/${coinId}/history?interval=${interval}&start=${start}&end=${end}`
        );
        const data = await res.json();
        // data.data might be undefined or not an array
        setChartData(Array.isArray(data.data) ? data.data : []);
        setChartData(data.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching chart data:", err);
        setLoading(false);
      }
    }
    fetchChartData();
  }, [coinId, timeRange]);

  // Prepare chart labels and prices
  const labels = chartData.map((point) => {
    const dateObj = new Date(point.time);
    if (timeRange === "day") {
      // For the day range, show hour:minute (e.g. "10:30 AM")
      return dateObj.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      // For week, month, year, show just the date (e.g. "7/30/2025")
      return dateObj.toLocaleDateString();
    }
  });
  const prices = chartData.map((point) => convertValue(point.priceUsd));

  // Compute high and low for the current selection
  const highPrice = prices.length ? Math.max(...prices) : null;
  //console.log("high " + highPrice);
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
        borderWidth: timeRange === "year" ? 1 : 2, // thinner line for year
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
        <button
          type="button"
          className={`btn btn-outline-primary ${
            timeRange === "day" ? "active" : ""
          }`}
          onClick={() => setTimeRange("day")}
        >
          Day
        </button>
        <button
          type="button"
          className={`btn btn-outline-primary ${
            timeRange === "week" ? "active" : ""
          }`}
          onClick={() => setTimeRange("week")}
        >
          Week
        </button>
        <button
          type="button"
          className={`btn btn-outline-primary ${
            timeRange === "month" ? "active" : ""
          }`}
          onClick={() => setTimeRange("month")}
        >
          Month
        </button>
        <button
          type="button"
          className={`btn btn-outline-primary ${
            timeRange === "year" ? "active" : ""
          }`}
          onClick={() => setTimeRange("year")}
        >
          Year
        </button>
      </div>
      {loading ? (
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      ) : chartData.length > 0 ? (
        <div style={{ position: "relative", height: "400px" }}>
          {/* Overlay showing high and low */}
          <div
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",

              color: "#fff",
              padding: "5px 10px",
              borderRadius: "5px",
              zIndex: 10,
              fontSize: "0.9rem",
              textAlign: "right",
            }}
          >
            {highPrice !== null && lowPrice !== null && (
              <>
                <div className="d-md-flex">
                <div className="me-md-3">
  <span>High:</span> {symbol}
  {highPrice > 0.0099
    ? highPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : highPrice.toLocaleString(undefined, { minimumFractionDigits: 7, maximumFractionDigits: 7 })
  }
</div>

                  <div className="me-md-3">
                    <span>Low:</span> {symbol}
                    {lowPrice > 0.0099
    ? lowPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : lowPrice.toLocaleString(undefined, { minimumFractionDigits: 7, maximumFractionDigits: 7 })
  }
                  </div>
                  <div>
                    <span>Average:</span> {symbol}
                    {averagePrice > 0.0099
    ? averagePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : averagePrice.toLocaleString(undefined, { minimumFractionDigits: 7, maximumFractionDigits: 7 })
  }
                  </div>
                </div>
              </>
            )}
          </div>
          <Line data={data} options={options} />
        </div>
      ) : (
        <p>No historical data available for this range.</p>
      )}
    </div>
  );
}
