"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function AdminUserDetails() {
  const { id } = useParams(); // user id from URL
  const [userData, setUserData] = useState(null);
  const [fiatBalance, setFiatBalance] = useState("");
  const [role, setRole] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch user details on mount
  useEffect(() => {
    async function fetchUserDetails() {
      setLoading(true);
      setErrorMsg("");
      try {
        const res = await fetch(`/api/admin/users/${id}`);
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error || "Failed to fetch user details");
        }
        setUserData(json.user);
        // If the user has a wallet, initialize fiatBalance from it, else default to 0.
        setFiatBalance(json.user.wallet ? json.user.wallet.fiatBalance : 0);
        setRole(json.user.role);
      } catch (error) {
        setErrorMsg(error.message);
      }
      setLoading(false);
    }
    fetchUserDetails();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fiatBalance: Number(fiatBalance),
          role, // if you want to allow updating the role
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to update user details");
      }
      setFeedback("User updated successfully!");
    } catch (error) {
      setFeedback(error.message);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!userData) {
    return <div className="container mt-5">No user found.</div>;
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between w-100">
        <div>
          <h1>User Details</h1>
        </div>
        <div>
          <Link className="links" href="/admin/users">
          <i className="bi bi-arrow-return-left me-1"></i>
          
            Back to Users
          </Link>
        </div>
      </div>
      {errorMsg && <p className="text-danger">{errorMsg}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input
            type="text"
            className="form-control"
            value={userData.name || ""}
            readOnly
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            value={userData.email || ""}
            readOnly
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Fiat Balance</label>
          <input
            type="number"
            className="form-control"
            value={fiatBalance}
            onChange={(e) => setFiatBalance(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Role</label>
          <select
            className="form-select"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary">
          Update User
        </button>
      </form>
      {feedback && <p className="mt-3">{feedback}</p>}
      <div className="mt-5">
        <h3>Assets Owned</h3>
        {userData.cryptoAssets && userData.cryptoAssets.length > 0 ? (
          <ul className="list-group">
            {userData.cryptoAssets.map((asset) => (
              <li key={asset.id} className="list-group-item">
                {asset.symbol}: {asset.balance}
              </li>
            ))}
          </ul>
        ) : (
          <p>No assets owned.</p>
        )}
      </div>
    </div>
  );
}
