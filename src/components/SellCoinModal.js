"use client";

import { useState } from "react";
import { useUser } from "@/context/UserContext";

export default function SellCoinModal({ asset, currency }) {
  const { user, setUser } = useUser();
  const fiatSymbol = currency === "USD" ? "$" : "€";
  const [showModal, setShowModal] = useState(false);
  const [sellAmount, setSellAmount] = useState("");
  const [feedback, setFeedback] = useState("");

  const handleOpen = () => setShowModal(true);
  const handleClose = () => {
    setShowModal(false);
    setSellAmount("");
    setFeedback("");
  };

  const handleSell = async () => {
    const amount = parseFloat(sellAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid positive amount.");
      return;
    }
    if (amount > asset.balance) {
      alert("You don't have that many coins to sell.");
      return;
    }
    // Calculate revenue: amount * current price in USD
    const fiatRevenue = amount * asset.currentPriceUsd;

    // Fallback: if asset.coinId is null, use asset.symbol for coinId
    const safeCoinId = asset.coinId || asset.symbol;

    try {
      const res = await fetch("/api/transactions/sell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          coinSymbol: asset.symbol,     // short ticker
          coinId: safeCoinId,          // fallback to symbol if coinId is null
          amount,
          price: asset.currentPriceUsd,
          fiatRevenue,
          fiatCurrency: currency,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to complete sale.");
      } else {
        // Merge updated wallet and crypto assets into the user context
        setUser((prev) => ({
          ...prev,
          wallet: data.updatedWallet,
          cryptoAssets: data.updatedCryptoAssets,
        }));
        setFeedback("Sale successful!");
        setTimeout(() => setFeedback(""), 5000);
        handleClose();
      }
    } catch (error) {
      console.error("Sale error:", error);
      alert("An unexpected error occurred.");
    }
  };

  return (
    <>
      <span
        onClick={handleOpen}
        style={{ cursor: "pointer" }}
        title="Sell Coin"
      >
        <i className="bi bi-bag-x fs-4 ms-2 link-primary"></i>
      </span>

      {showModal && (
        <>
          <div className="modal show" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content bg-dark text-light">
                <div className="modal-header">
                  <div className="d-flex align-items-center">
                    <img
                      src={`/icons/${
                        (asset.assetSymbol || asset.symbol)
                      }.png`}
                      alt={asset.assetName || asset.symbol}
                      style={{
                        width: "30px",
                        height: "30px",
                        marginRight: "0.5rem",
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                    <h5 className="modal-title">
                      Sell {asset.assetName || asset.symbol}
                    </h5>
                  </div>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    aria-label="Close"
                    onClick={handleClose}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>
                    <strong>Your {asset.assetName || asset.symbol} Balance:</strong>{" "}
                    {asset.balance}
                  </p>
                  <p>
                    <strong>1 {asset.symbol} = </strong> {fiatSymbol}
                    {Number(asset.currentPriceUsd).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <div className="mb-3">
                    <label htmlFor="sellAmount" className="form-label">
                      Amount to Sell
                    </label>
                    <div className="input-group">
                      <input
                        type="number"
                        className="form-control"
                        id="sellAmount"
                        value={sellAmount}
                        onChange={(e) => setSellAmount(e.target.value)}
                        min="0"
                        max={asset.balance}
                      />
                      <button
                        type="button"
                        className="btn btn-secondary border border-light"
                        onClick={() => setSellAmount(String(asset.balance))}
                      >
                        Max
                      </button>
                    </div>
                  </div>
                  <p>
                    <strong>Total Revenue:</strong>{" "}
                    {parseFloat(sellAmount) > asset.balance ? (
                      <span className="text-danger">Insufficient balance</span>
                    ) : (
                      <span>
                        {(
                          asset.currentPriceUsd * parseFloat(sellAmount || 0)
                        ).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    )}
                  </p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleSell}
                  >
                    Confirm Sale
                  </button>
                </div>
                {feedback && (
                  <div className="alert alert-success m-2" role="alert">
                    {feedback}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </>
  );
}
