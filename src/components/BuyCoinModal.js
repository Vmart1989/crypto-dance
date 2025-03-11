"use client";

import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { useCurrency } from "@/context/CurrencyContext";
import { usePathname } from "next/navigation";

export default function BuyCoinModal({
  coin,
  convertValue,
  fiatSymbol,
  coinId,
  image, // image URL passed from parent
}) {
  const { user, setUser } = useUser();
  const pathname = usePathname();
  const [showModal, setShowModal] = useState(false);
  const [buyAmount, setBuyAmount] = useState("");
  const [feedback, setFeedback] = useState("");
  const { currency } = useCurrency();

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

    // Calculate total fiat cost based on coin's current price (converted)
    const fiatCost = amount * convertValue(coin.priceUsd);
    if (fiatCost > user.wallet.fiatBalance) {
      alert("Insufficient funds for this purchase.");
      return;
    }

    try {
      const res = await fetch("/api/transactions/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          coinSymbol: coin.symbol, // use coin.symbol for ticker
          coinId, // passed in prop (should be the correct coin id, e.g. "bitcoin")
          amount,
          price: coin.priceUsd,
          fiatCost,
          fiatCurrency: currency,
        }),
      });
      
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to complete purchase.");
      } else {
        // Merge the updated data into the UserContext so that any component
        // using UserContext.user refreshes automatically.
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
      {pathname.startsWith("/dashboard/coin/") ? (
        <button className="btn btn-primary mt-2" onClick={handleOpen}>
          Buy {coin.symbol}
        </button>
      ) : (
        <span onClick={handleOpen} style={{ cursor: "pointer" }} title="Buy Coin">
          <i className="bi bi-bag-plus fs-4 ms-2 link-primary"></i>
        </span>
      )}

      {showModal && (
        <>
          <div className="modal show" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content bg-dark text-light">
                <div className="modal-header">
                  <div className="d-flex align-items-center">
                    {/* Use the image prop passed from parent */}
                    <img
                      src={image}
                      alt={coin.name}
                      style={{
                        width: "40px",
                        height: "40px",
                        marginRight: "0.5rem",
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                    <h5 className="modal-title">
                      Buy {coin.name} ({coin.symbol})
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
                    <strong>Your Fiat Balance: </strong>
                    {fiatSymbol}
                    {user.wallet.fiatBalance.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p>
                    <strong>1 {coin.symbol} = </strong>
                    {fiatSymbol}
                    {convertValue(coin.priceUsd).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits:
                        coin.priceUsd < 0.099 ? 7 : 2,
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
                    <strong>Total Cost:</strong> {fiatSymbol}{" "}
                    {(
                      convertValue(coin.priceUsd) * parseFloat(buyAmount || 0)
                    ).toLocaleString(undefined, {
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
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </>
  );
}
