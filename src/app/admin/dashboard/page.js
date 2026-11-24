"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminEmpty, AdminError, AdminShell, AdminStatus, formatAdminDate } from "@/components/AdminShell";

const metricConfig = [
  { key: "totalUsers", label: "Total users", icon: "bi-people", tone: "violet" },
  { key: "newUsers7d", label: "New in 7 days", icon: "bi-person-plus", tone: "blue" },
  { key: "activeSessions", label: "Active sessions", icon: "bi-broadcast", tone: "green" },
  { key: "transactions24h", label: "Trades in 24h", icon: "bi-arrow-left-right", tone: "amber" },
];

const categoryIcons = { account: "bi-person-check", auth: "bi-shield-check", trading: "bi-graph-up-arrow", wallet: "bi-wallet2", admin: "bi-sliders" };

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await fetch("/api/admin/dashboard", { cache: "no-store" });
        const payload = await response.json();
        if (response.status === 401) return router.replace("/admin/login");
        if (!response.ok) throw new Error(payload.error || "Unable to load the dashboard");
        if (active) setData(payload);
      } catch (loadError) {
        if (active) setError(loadError.message);
      }
    }
    load();
    return () => { active = false; };
  }, [router]);

  const maxRegistrations = Math.max(1, ...(data?.registrationSeries || []).map((item) => item.count));

  return (
    <AdminShell
      eyebrow="Operations overview"
      title="Command centre"
      description="Monitor adoption, platform activity, and account health from one place."
      actions={<><Link href="/admin/activity" className="admin-button admin-button-secondary"><i className="bi bi-activity" />View activity</Link><Link href="/admin/users" className="admin-button"><i className="bi bi-people" />Manage users</Link></>}
    >
      <AdminError message={error} />
      {!data && !error ? (
        <div className="admin-metric-grid">{metricConfig.map((metric) => <div className="admin-metric-card admin-skeleton" key={metric.key} />)}</div>
      ) : data && (
        <>
          <section className="admin-metric-grid" aria-label="Platform metrics">
            {metricConfig.map((metric) => (
              <article className="admin-metric-card" key={metric.key}>
                <span className={`admin-metric-icon admin-tone-${metric.tone}`}><i className={`bi ${metric.icon}`} /></span>
                <div><span>{metric.label}</span><strong>{Number(data.metrics[metric.key]).toLocaleString()}</strong></div>
              </article>
            ))}
          </section>

          <section className="admin-dashboard-grid">
            <article className="admin-panel admin-chart-panel">
              <div className="admin-panel-head"><div><span className="admin-section-kicker">Growth</span><h2>Registrations</h2></div><AdminStatus tone="positive">{data.metrics.verificationRate}% verified</AdminStatus></div>
              <div className="admin-bar-chart" role="img" aria-label="New user registrations over the last fourteen days">
                {data.registrationSeries.map((item) => (
                  <div className="admin-bar-column" key={item.date} title={`${item.date}: ${item.count} registrations`}>
                    <span className="admin-bar-value">{item.count || ""}</span>
                    <span className="admin-bar" style={{ height: `${Math.max(5, (item.count / maxRegistrations) * 100)}%` }} />
                    <small>{new Date(`${item.date}T12:00:00Z`).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</small>
                  </div>
                ))}
              </div>
              <div className="admin-chart-summary">
                <div><span>Verified accounts</span><strong>{data.metrics.verifiedUsers.toLocaleString()}</strong></div>
                <div><span>Total transactions</span><strong>{data.metrics.totalTransactions.toLocaleString()}</strong></div>
                <div><span>Simulated volume</span><strong>{data.volumeByCurrency.length ? data.volumeByCurrency.map((item) => `${item.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${item.currency}`).join(" · ") : "—"}</strong></div>
              </div>
            </article>

            <article className="admin-panel">
              <div className="admin-panel-head"><div><span className="admin-section-kicker">Live trail</span><h2>Recent activity</h2></div><Link href="/admin/activity" className="admin-text-link">View all</Link></div>
              <div className="admin-activity-list">
                {data.recentActivity.length ? data.recentActivity.map((item) => (
                  <div className="admin-activity-item" key={item.id}>
                    <span className={`admin-activity-icon admin-category-${item.category}`}><i className={`bi ${categoryIcons[item.category] || "bi-circle"}`} /></span>
                    <div><strong>{item.summary}</strong><span>{item.user?.email || item.actor?.email || item.event}</span></div>
                    <time>{formatAdminDate(item.createdAt, { year: undefined })}</time>
                  </div>
                )) : <AdminEmpty icon="bi-activity" title="No activity yet" copy="New events will appear here as users interact with the platform." />}
              </div>
            </article>
          </section>

          <section className="admin-panel">
            <div className="admin-panel-head"><div><span className="admin-section-kicker">Accounts</span><h2>Newest users</h2></div><Link href="/admin/users" className="admin-text-link">Open directory</Link></div>
            <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>User</th><th>Status</th><th>Role</th><th>Joined</th><th aria-label="Actions" /></tr></thead><tbody>
              {data.recentUsers.map((user) => <tr key={user.id}><td><div className="admin-person"><span>{(user.name || user.email).slice(0, 1).toUpperCase()}</span><div><strong>{user.name || "Unnamed user"}</strong><small>{user.email}</small></div></div></td><td><AdminStatus tone={user.emailVerifiedAt ? "positive" : "warning"}>{user.emailVerifiedAt ? "Verified" : "Pending"}</AdminStatus></td><td><AdminStatus tone={user.role === "admin" ? "violet" : "neutral"}>{user.role}</AdminStatus></td><td>{formatAdminDate(user.createdAt)}</td><td className="admin-table-action"><Link href={`/admin/users/${user.id}`} aria-label={`View ${user.email}`}><i className="bi bi-chevron-right" /></Link></td></tr>)}
            </tbody></table></div>
          </section>
        </>
      )}
    </AdminShell>
  );
}
