"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CryptoNewsPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function fetchNews() {
      setLoading(true);
      setErrorMsg("");
      try {
        const res = await fetch("/api/news");
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to fetch news");
        }
        const json = await res.json();
        // The news data is typically under json.results or json.articles,
        // but check the actual response shape from NewsData.io
        const allArticles = json.results || [];
        // Take the top 3
        const top6 = allArticles.slice(0, 6);
        setArticles(top6);
      } catch (err) {
        console.error("Error fetching news:", err);
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between">
        <h2>Today's Crypto News</h2>
        <a
          style={{ cursor: "pointer" }}
          className="fs-6 link-offset-2 me-4 link-offset-3-hover  link-underline-opacity-0 link-underline-opacity-75-hover"
        >
          <i className="bi bi-arrow-left fs-5 me-2"></i>
          <Link href="/dashboard">Back to dashboard</Link>
        </a>
      </div>
      {loading && (
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      )}
      {errorMsg && <p className="text-danger">{errorMsg}</p>}

      {!loading && !errorMsg && articles.length === 0 && (
        <p>No news articles found.</p>
      )}

      <div className="row">
        {articles.map((article, index) => (
          <div key={index} className="col-12 col-md-6 mb-3">
            <div className="card bg-dark text-light">
              <div className="card-body">
                {article.image_url && (
                  <img
                    src={article.image_url}
                    alt={article.title || "News Image"}
                    className="card-img-top mb-2"
                    style={{ objectFit: "cover", maxHeight: "300px" }}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                )}
                <h5 className="card-title">{article.title}</h5>

                {article.pubDate && (
                  <p className="card-subtitle mb-2 text-secondary">
                    {new Date(article.pubDate).toLocaleString()}
                  </p>
                )}
                <div className="d-flex justify-content-between align-items-center">
                {article.source_name && (
                  <div className="d-flex align-items-center">
                    {article.source_icon && (
                      <img
                        src={article.source_icon}
                        alt={article.source_name}
                        style={{
                          width: "20px",
                          height: "20px",
                          marginRight: "0.5rem",
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    )}
                    <small className="text-secondary">
                      {article.source_name}
                    </small>
                  </div>
                )}
                {article.link && (
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    See full article
                  </a>
                  
                )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
