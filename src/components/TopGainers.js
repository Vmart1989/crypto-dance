"use client";

import { useEffect, useState } from "react";
import styles from "./TopGainers.module.css"; 
import Image from "next/image";
import Link from "next/link";

// Fallback image wrapper component
const CoinIcon = ({ symbol, name }) => {
  const [imgSrc, setImgSrc] = useState(`/icons/${symbol.toLowerCase()}.png`);

  return (
    <Image
      src={imgSrc}
      alt={name}
      width={24}
      height={24}
      loading="lazy"
      onError={() => setImgSrc('/icons/token.png')}
    />
  );
};


export default function TopGainers() {
  const [topGainers, setTopGainers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchCryptos() {
      setLoading(true);
      try {
        const res = await fetch("/api/cryptos");
        const json = await res.json();
        // Ensure data is an array before filtering
        const data = Array.isArray(json.data) ? json.data : [];

        // Filter out cryptos with a positive 24h percentage gain
        const positiveGainers = data.filter(
          (crypto) => Number(crypto.changePercent24Hr) > 0
        );

        // Sort descending by 24h percentage gain
        const sortedGainers = positiveGainers.sort(
          (a, b) =>
            Number(b.changePercent24Hr) - Number(a.changePercent24Hr)
        );

        // Take the top 5 gainers
        const top5 = sortedGainers.slice(0, 5);

        setTopGainers(top5);
      } catch (error) {
        console.error("Error fetching crypto data:", error);
      }
      setLoading(false);
    }

    fetchCryptos();
  }, []);

  return (
    <div className={styles.topGainersContainer}>
      {loading ? (
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      ) : (
        <table className="table table-borderless">
          <thead>
            <tr>
              <th></th>
              <th className="text-light">24h Change</th>
            </tr>
          </thead>
          <tbody>
            {topGainers.length === 0 ? (
              <tr>
                <td colSpan="2" className="text-light">
                  Market looks disappointing today...
                </td>
              </tr>
            ) : (
              topGainers.map((crypto) => (
                <tr key={crypto.id}>
                  <td className="text-light">
                  <Link
                  className="text-decoration-none link-light"
                  href={`/coin/${crypto.id}`}
                >
                  <CoinIcon symbol={crypto.symbol} name={crypto.name} />{" "}
                  {crypto.name}
                </Link>
                  </td>
                  <td
                    className={
                      Number(crypto.changePercent24Hr) > 0
                        ? "text-info"
                        : "text-danger"
                    }
                  >
                    {Number(crypto.changePercent24Hr).toFixed(2)}%
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
