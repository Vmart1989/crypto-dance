"use client";

import { useState } from "react";
import { useUser } from "@/context/UserContext";

export default function BuyCoinModal({ coin, convertValue, symbol }) {
  const { user, setUser } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [buyAmount, setBuyAmount] = useState("");
  const [feedback, setFeedback] = useState("");

  const handleOpen = () => setShowModal(true);
  const handleClose = () => {
    setShowModal(false);
    setBuyAmount("");
    setFeedback("");
  };

  const handleBuy = async () => {
    const amount = parseFloat(buyAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid positive amount.");
      return;
    }

    // Calculate total fiat cost based on the coin's current price (converted)
    const fiatCost = amount * convertValue(coin.priceUsd);
    if (fiatCost > user.wallet.fiatBalance) {
      alert("Insufficient funds for this purchase.");
      return;
    }

    try {
      const res = await fetch("/api/transactions/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coinId: coin.id,
          amount,
          price: coin.priceUsd, // coin's price in USD
          fiatCost,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to complete purchase.");
      } else {
        // Update the UserContext with the new wallet and crypto asset data
        setUser((prev) => ({
          ...prev,
          wallet: data.updatedWallet,
          cryptoAssets: data.updatedCryptoAssets,
        }));
        setFeedback("Purchase successful!");
        setTimeout(() => setFeedback(""), 5000);
        handleClose();
      }
    } catch (error) {
      console.error("Purchase error:", error);
      alert("An unexpected error occurred.");
    }
  };

  return (
    <>
      {/* Buy icon (Bootstrap Icon) */}
      <span onClick={handleOpen} style={{ cursor: "pointer" }} title="Buy Coin">
        <i className="bi bi-bag-plus fs-4 ms-2"></i>
      </span>

      {showModal && (
        <>
          <div className="modal show" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content bg-dark text-light">
                <div className="modal-header">
                    
                <div className="d-flex align-items-center">
                    <img
                      src={`https://assets.coincap.io/assets/icons/${coin.symbol.toLowerCase()}@2x.png`}
                      alt={coin.name}
                      style={{ width: "40px", height: "40px", marginRight: "0.5rem" }}
                    />
                    <h5 className="modal-title">
                      Buy {coin.name} ({coin.symbol})
                    </h5>
                  </div>
                  
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={handleClose}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>
                    <strong>Your Fiat Balance: </strong> {symbol}
                    {user.wallet.fiatBalance.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p>
                    <strong>1 {coin.symbol} = </strong> {symbol}
                    {convertValue(coin.priceUsd).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <div className="mb-3">
                    <label htmlFor="buyAmount" className="form-label">
                      Amount to Buy
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="buyAmount"
                      value={buyAmount}
                      onChange={(e) => setBuyAmount(e.target.value)}
                      min="0"
                    />
                  </div>
                  <p>
                    <strong>Total Cost:</strong> {symbol}{" "}
                    {(convertValue(coin.priceUsd) * parseFloat(buyAmount || 0)).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
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
                    className="btn btn-primary"
                    onClick={handleBuy}
                  >
                    Confirm Purchase
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
          {/* Modal backdrop */}
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </>
  );
}
