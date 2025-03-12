"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setErrorMsg("");
      try {
        const res = await fetch("/api/admin/users");
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error || "Failed to fetch users");
        }
        setUsers(json.users);
      } catch (error) {
        setErrorMsg(error.message);
      }
      setLoading(false);
    }
    fetchUsers();
  }, []);

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between w-100">
        <div>
          <h1>Manage Users</h1>
        </div>
        <div>
          <Link className="links" href="/admin/dashboard">
          <i className="bi bi-arrow-return-left me-1"></i>
          
            Admin Dashboard
          </Link>
        </div>
      </div>
      {loading && (
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      )}
      {errorMsg && <p className="text-danger">{errorMsg}</p>}
      {!loading && !errorMsg && (
        <table className="table table-dark table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Name</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.email}</td>
                <td>{user.name || "N/A"}</td>
                <td>{user.role}</td>
                <td>
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="btn btn-sm btn-primary me-2"
                  >
                    Edit
                  </Link>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={async () => {
                      if (
                        confirm("Are you sure you want to delete this user?")
                      ) {
                        try {
                          const res = await fetch(
                            `/api/admin/users/${user.id}`,
                            {
                              method: "DELETE",
                            }
                          );
                          if (!res.ok) {
                            const data = await res.json();
                            alert(data.error || "Failed to delete user");
                          } else {
                            setUsers(users.filter((u) => u.id !== user.id));
                          }
                        } catch (error) {
                          console.error("Error deleting user:", error);
                        }
                      }
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
