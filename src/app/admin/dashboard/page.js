"use client";

import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="container mt-5">
      <p>Welcome, Admin! Choose an option below:</p>
      <ul className="list-group">
        <li className="list-group-item fs-2 text-center">
          <Link className="links link-primary " href="/admin/users">Manage Users</Link>
        </li>
        <li className="list-group-item fs-2 text-center ">
          <Link className="links link-primary " href="/admin/transactions">View Transactions</Link>
        </li>
      </ul>
    </div>
  );
}
