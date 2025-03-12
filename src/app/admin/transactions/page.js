"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterUser, setFilterUser] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function fetchTransactions() {
      setLoading(true);
      setErrorMsg("");
      try {
        let url = "/api/admin/transactions";
        if (filterUser) {
          url += `?userId=${filterUser}`;
        }
        const res = await fetch(url);
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error || "Failed to fetch transactions");
        }
        setTransactions(json.transactions);
      } catch (error) {
        setErrorMsg(error.message);
      }
      setLoading(false);
    }
    fetchTransactions();
  }, [filterUser]);

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-content-center w-100">
        <div>
          <h1>Manage Transactions</h1>
        </div>
        <div>
          <Link className="links" href="/admin/dashboard">
          <i className="bi bi-arrow-return-left me-1"></i>
          
            Admin Dashboard
          </Link>
        </div>
      </div>
      <div className="mb-3">
        <label htmlFor="filterUser" className="form-label">
          Filter by User ID:
        </label>
        <input
          type="number"
          id="filterUser"
          className="form-control"
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
        />
      </div>
      {loading && (
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      )}
      {errorMsg && <p className="text-danger">{errorMsg}</p>}
      {!loading && !errorMsg && transactions.length === 0 && (
        <p>No transactions found.</p>
      )}
      {!loading && !errorMsg && transactions.length > 0 && (
        <table className="table table-dark table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>User ID</th>
              <th>Type</th>
              <th>Crypto</th>
              <th>Amount</th>
              <th>Price</th>
              <th>Fiat Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td>{tx.id}</td>
                <td>{tx.userId}</td>
                <td>{tx.type}</td>
                <td>{tx.cryptoSymbol}</td>
                <td>{tx.amount}</td>
                <td>{tx.price}</td>
                <td>{tx.fiatAmount} {tx.fiatCurrency}</td>
                <td>{new Date(tx.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
