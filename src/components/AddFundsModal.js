"use client";

import { useState } from "react";
import { useUser } from "@/context/UserContext";

export default function AddFundsModal() {
  const { setUser } = useUser();
  const [amount, setAmount] = useState("");
  const [feedback, setFeedback] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleOpen = () => setShowModal(true);
  const handleClose = () => {
    setShowModal(false);
    setAmount("");
  };

  const handleSubmit = async () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Please enter a valid positive amount.");
      return;
    }

    try {
      const res = await fetch("/api/wallet/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parsedAmount }),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to add funds.");
      } else {
        // Update the user context with new wallet information
        setUser((prev) => ({ ...prev, wallet: data.wallet }));
        setFeedback("Funds added successfully!");
        setTimeout(() => setFeedback(""), 5000);
        handleClose();
      }
    } catch (error) {
      console.error("Error adding funds:", error);
      alert("An unexpected error occurred.");
    }
  };

  return (
    <>
      <button className="btn btn-secondary" onClick={handleOpen}>
        Add Funds
      </button>

      {showModal && (
        <>
          <div className="modal show" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add Funds</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={handleClose}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="amount" className="form-label">
                      Enter amount to add (max total balance: 100,000)
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  {feedback && (
                    <div className="alert alert-success mt-2" role="alert">
                      {feedback}
                    </div>
                  )}
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
                    onClick={handleSubmit}
                  >
                    Add Funds
                  </button>
                </div>
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
