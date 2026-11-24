"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminEmpty, AdminError, AdminShell, AdminStatus, formatAdminDate } from "@/components/AdminShell";

export default function AdminTransactions() {
  const router = useRouter();
  const [filters, setFilters] = useState({ q: "", userId: "", type: "" });
  const [applied, setApplied] = useState(filters);
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true); setError("");
    const params = new URLSearchParams({ page: String(page), limit: "30" });
    Object.entries(applied).forEach(([k, v]) => v && params.set(k, v));
    try {
      const res = await fetch(`/api/admin/transactions?${params}`, { cache: "no-store" }); const payload = await res.json();
      if (res.status === 401) return router.replace("/admin/login");
      if (!res.ok) throw new Error(payload.error || "Unable to load transactions"); setData(payload);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }, [applied, page, router]);
  useEffect(() => { load(); }, [load]);
  function submit(e) { e.preventDefault(); setPage(1); setApplied(filters); }
  return <AdminShell title="Transactions" description="Audit virtual trading activity and inspect volume across currencies.">
    {data?.totals?.length > 0 && <div className="admin-mini-metrics">{data.totals.map((total) => <div key={total.currency}><span>{total.currency} volume</span><strong>{Number(total.amount).toLocaleString("en-GB", { style: "currency", currency: total.currency })}</strong><small>{total.count} transactions</small></div>)}</div>}
    <form className="admin-filterbar" onSubmit={submit}>
      <label className="admin-search"><i className="bi bi-search" /><input value={filters.q} onChange={(e) => setFilters({...filters, q:e.target.value})} placeholder="Search user or email" /></label>
      <input className="admin-compact-input" inputMode="numeric" value={filters.userId} onChange={(e) => setFilters({...filters, userId:e.target.value.replace(/\D/g, "")})} placeholder="User ID" aria-label="User ID" />
      <select value={filters.type} onChange={(e) => setFilters({...filters, type:e.target.value})}><option value="">All types</option><option value="buy">Buy</option><option value="sell">Sell</option><option value="deposit">Deposit</option><option value="withdrawal">Withdrawal</option></select>
      <button className="admin-button admin-button-primary">Apply filters</button>
    </form>
    <AdminError message={error} />
    <section className="admin-panel"><div className="admin-panel-head"><div><h2>Transaction ledger</h2><p>Newest virtual transactions appear first.</p></div><AdminStatus tone="neutral">{data?.pagination.total ?? 0} entries</AdminStatus></div>
      {loading ? <div className="admin-loading"><span />Loading transactions…</div> : !data?.transactions.length ? <AdminEmpty icon="bi-receipt" title="No transactions found" copy="No entries match these filters." /> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Transaction</th><th>User</th><th>Asset</th><th>Crypto amount</th><th>Fiat value</th><th>Date</th></tr></thead><tbody>
        {data.transactions.map((tx) => <tr key={tx.id}><td><div className="admin-stack"><AdminStatus tone={tx.type === "buy" ? "green" : tx.type === "sell" ? "amber" : "violet"}>{tx.type}</AdminStatus><small>#{tx.id}</small></div></td><td><Link className="admin-user-link" href={`/admin/users/${tx.user.id}`}>{tx.user.name || tx.user.email}<small>{tx.user.name ? tx.user.email : `User #${tx.user.id}`}</small></Link></td><td><strong>{tx.cryptoName || tx.cryptoId}</strong><small className="admin-block-muted">{tx.cryptoId}</small></td><td>{Number(tx.cryptoAmount).toLocaleString("en-GB", { maximumFractionDigits: 8 })}</td><td><strong>{Number(tx.fiatAmount).toLocaleString("en-GB", { style: "currency", currency: tx.fiatCurrency })}</strong></td><td><span className="admin-muted">{formatAdminDate(tx.createdAt)}</span></td></tr>)}
      </tbody></table></div>}
    </section>
    {data?.pagination.pages > 1 && <div className="admin-pagination"><span>Page {page} of {data.pagination.pages}</span><div><button disabled={page<=1} onClick={()=>setPage(page-1)}>Previous</button><button disabled={page>=data.pagination.pages} onClick={()=>setPage(page+1)}>Next</button></div></div>}
  </AdminShell>;
}
