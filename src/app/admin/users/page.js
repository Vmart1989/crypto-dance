"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

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

  // Filter users based on email and role
  const filteredUsers = users.filter((user) => {
    const emailMatch = user.email.toLowerCase().includes(emailFilter.toLowerCase());
    const roleMatch = roleFilter ? user.role.toLowerCase() === roleFilter.toLowerCase() : true;
    return emailMatch && roleMatch;
  });

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between w-100 mb-3">
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
      <div className="d-flex justify-content-start ">
      <div className="mb-3 me-5 w-75">
        <label htmlFor="emailFilter" className="form-label">
          Filter by Email:
        </label>
        <input
          type="text"
          id="emailFilter"
          className="form-control"
          placeholder="Enter email..."
          value={emailFilter}
          onChange={(e) => setEmailFilter(e.target.value)}
        />
      </div>
      <div className="mb-3 w-25">
        <label htmlFor="roleFilter" className="form-label">
          Filter by Role:
        </label>
        <select
          id="roleFilter"
          className="form-select"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
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
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-light">
                  No users match the filter criteria.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
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
                        if (confirm("Are you sure you want to delete this user?")) {
                          try {
                            const res = await fetch(`/api/admin/users/${user.id}`, {
                              method: "DELETE",
                            });
                            let data = {};
                            const text = await res.text();
                            if (text) {
                              data = JSON.parse(text);
                            }
                            if (!res.ok) {
                              alert(data.error || "Failed to delete user");
                            } else {
                              setUsers((prev) =>
                                prev.filter((u) => u.id !== user.id)
                              );
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
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
