"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminEmpty, AdminError, AdminShell, AdminStatus, formatAdminDate } from "@/components/AdminShell";

export default function AdminUsers() {
  const router = useRouter();
  const [filters, setFilters] = useState({ q: "", role: "", verification: "" });
  const [applied, setApplied] = useState(filters);
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    const params = new URLSearchParams({ page: String(page), limit: "25" });
    Object.entries(applied).forEach(([key, value]) => value && params.set(key, value));
    try {
      const response = await fetch(`/api/admin/users?${params}`, { cache: "no-store" });
      const payload = await response.json();
      if (response.status === 401) return router.replace("/admin/login");
      if (!response.ok) throw new Error(payload.error || "Unable to load users");
      setData(payload);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }, [applied, page, router]);

  useEffect(() => { load(); }, [load]);
  function submit(event) { event.preventDefault(); setPage(1); setApplied(filters); }

  return (
    <AdminShell title="Users" description="Search accounts, review verification, and manage access and virtual balances."
      actions={<AdminStatus tone="violet">{data?.pagination.total ?? 0} accounts</AdminStatus>}>
      <form className="admin-filterbar" onSubmit={submit}>
        <label className="admin-search"><i className="bi bi-search" /><input value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} placeholder="Search name or email" aria-label="Search users" /></label>
        <select value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })} aria-label="Filter by role"><option value="">All roles</option><option value="user">Users</option><option value="admin">Admins</option></select>
        <select value={filters.verification} onChange={(e) => setFilters({ ...filters, verification: e.target.value })} aria-label="Filter by verification"><option value="">Any status</option><option value="verified">Verified</option><option value="pending">Pending</option></select>
        <button className="admin-button admin-button-primary" type="submit">Apply filters</button>
      </form>
      <AdminError message={error} />
      <section className="admin-panel">
        <div className="admin-panel-head"><div><h2>Account directory</h2><p>Current wallet and engagement signals for every account.</p></div></div>
        {loading ? <div className="admin-loading"><span />Loading users…</div> : !data?.users.length ? <AdminEmpty icon="bi-people" title="No users found" copy="Try broadening your filters." /> : (
          <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>User</th><th>Status</th><th>Role</th><th>Virtual balance</th><th>Activity</th><th>Joined</th><th><span className="visually-hidden">Open</span></th></tr></thead><tbody>
            {data.users.map((user) => <tr key={user.id}>
              <td><div className="admin-person"><span>{(user.name || user.email)[0].toUpperCase()}</span><div><strong>{user.name || "Unnamed user"}</strong><small>{user.email}</small></div></div></td>
              <td><AdminStatus tone={user.emailVerifiedAt ? "green" : "amber"}>{user.emailVerifiedAt ? "Verified" : "Pending"}</AdminStatus></td>
              <td><AdminStatus tone={user.role === "admin" ? "violet" : "neutral"}>{user.role}</AdminStatus></td>
              <td><strong>€{Number(user.wallet?.fiatBalance || 0).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
              <td><span className="admin-muted">{user._count.transactions} trades · {user._count.sessions} sessions</span></td>
              <td><span className="admin-muted">{formatAdminDate(user.createdAt, { hour: undefined, minute: undefined })}</span></td>
              <td><Link className="admin-row-link" href={`/admin/users/${user.id}`} aria-label={`Open ${user.email}`}><i className="bi bi-arrow-up-right" /></Link></td>
            </tr>)}
          </tbody></table></div>
        )}
      </section>
      {data?.pagination.pages > 1 && <Pagination {...data.pagination} onChange={setPage} />}
    </AdminShell>
  );
}

function Pagination({ page, pages, total, onChange }) {
  return <div className="admin-pagination"><span>Page {page} of {pages} · {total} results</span><div><button disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</button><button disabled={page >= pages} onClick={() => onChange(page + 1)}>Next</button></div></div>;
}
