"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminEmpty, AdminError, AdminShell, AdminStatus, formatAdminDate } from "@/components/AdminShell";

const tones = { account: "blue", auth: "green", trading: "violet", wallet: "amber", admin: "red" };
const icons = { account: "bi-person-check", auth: "bi-shield-check", trading: "bi-graph-up-arrow", wallet: "bi-wallet2", admin: "bi-sliders" };

export default function AdminActivity() {
  const router = useRouter(); const searchParams = useSearchParams();
  const initialUserId = searchParams.get("userId") || "";
  const [filters, setFilters] = useState({ q: "", category: "", event: "", userId: initialUserId });
  const [applied, setApplied] = useState({ q: "", category: "", event: "", userId: initialUserId });
  const [page, setPage] = useState(1); const [data, setData] = useState(null); const [error, setError] = useState(""); const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { setLoading(true); setError(""); const params = new URLSearchParams({ page: String(page), limit: "30" }); Object.entries(applied).forEach(([k,v]) => v && params.set(k,v));
    try { const res = await fetch(`/api/admin/activity?${params}`, { cache: "no-store" }); const body = await res.json(); if (res.status === 401) return router.replace("/admin/login"); if (!res.ok) throw new Error(body.error || "Unable to load activity"); setData(body); } catch (err) { setError(err.message); } finally { setLoading(false); }
  }, [applied, page, router]);
  useEffect(() => { load(); }, [load]);
  function submit(e) { e.preventDefault(); setPage(1); setApplied(filters); }
  return <AdminShell title="Activity" description="A privacy-conscious audit trail for account, authentication, trading, wallet, and admin events." actions={<div className="admin-privacy-note"><i className="bi bi-shield-lock" /><span>IP addresses are one-way hashed</span></div>}>
    <form className="admin-filterbar" onSubmit={submit}><label className="admin-search"><i className="bi bi-search" /><input value={filters.q} onChange={(e)=>setFilters({...filters,q:e.target.value})} placeholder="Search event or description" /></label><select value={filters.category} onChange={(e)=>setFilters({...filters,category:e.target.value})}><option value="">All categories</option>{Object.keys(tones).map((item)=><option key={item}>{item}</option>)}</select><select value={filters.event} onChange={(e)=>setFilters({...filters,event:e.target.value})}><option value="">All events</option>{data?.events?.map((item)=><option key={item.event} value={item.event}>{item.event} ({item.count})</option>)}</select><input className="admin-compact-input" inputMode="numeric" value={filters.userId} onChange={(e)=>setFilters({...filters,userId:e.target.value.replace(/\D/g,"")})} placeholder="User ID" /><button className="admin-button admin-button-primary">Apply</button></form>
    <AdminError message={error} />
    <section className="admin-panel"><div className="admin-panel-head"><div><h2>Audit trail</h2><p>Events are immutable records; credentials and raw network addresses are never stored.</p></div><AdminStatus>{data?.pagination.total ?? 0} events</AdminStatus></div>
      {loading ? <div className="admin-loading"><span />Loading activity…</div> : !data?.logs.length ? <AdminEmpty icon="bi-activity" title="No activity found" copy="Events will appear as users interact with CryptoDance." /> : <div className="admin-activity-list admin-activity-full">{data.logs.map((log)=><article key={log.id} className="admin-activity-item"><div className={`admin-activity-icon ${tones[log.category] || "neutral"}`}><i className={`bi ${icons[log.category] || "bi-dot"}`} /></div><div className="admin-activity-copy"><div><strong>{log.summary}</strong><AdminStatus tone={tones[log.category] || "neutral"}>{log.category}</AdminStatus></div><span>{log.event}</span><div className="admin-activity-meta">{log.user ? <Link href={`/admin/users/${log.user.id}`}>{log.user.name || log.user.email}</Link> : log.userId ? <span>Deleted user #{log.userId}</span> : <span>System event</span>}{log.actor && log.actorUserId !== log.userId && <span>by {log.actor.name || log.actor.email}</span>}{log.ipHash && <span title="One-way network identifier"><i className="bi bi-router" /> {log.ipHash.slice(0,8)}…</span>}<time>{formatAdminDate(log.createdAt)}</time></div></div></article>)}</div>}
    </section>
    {data?.pagination.pages > 1 && <div className="admin-pagination"><span>Page {page} of {data.pagination.pages}</span><div><button disabled={page<=1} onClick={()=>setPage(page-1)}>Previous</button><button disabled={page>=data.pagination.pages} onClick={()=>setPage(page+1)}>Next</button></div></div>}
  </AdminShell>;
}
