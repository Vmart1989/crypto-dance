"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { href: "/admin/dashboard", label: "Overview", icon: "bi-grid-1x2" },
  { href: "/admin/users", label: "Users", icon: "bi-people" },
  { href: "/admin/transactions", label: "Transactions", icon: "bi-arrow-left-right" },
  { href: "/admin/activity", label: "Activity", icon: "bi-activity" },
];

export function formatAdminDate(value, options = {}) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  }).format(new Date(value));
}

export function AdminStatus({ tone = "neutral", children }) {
  return <span className={`admin-status admin-status-${tone}`}>{children}</span>;
}

export function AdminEmpty({ icon = "bi-inbox", title, copy }) {
  return (
    <div className="admin-empty">
      <i className={`bi ${icon}`} aria-hidden="true" />
      <strong>{title}</strong>
      {copy && <span>{copy}</span>}
    </div>
  );
}

export function AdminError({ message }) {
  if (!message) return null;
  return <div className="admin-alert admin-alert-error"><i className="bi bi-exclamation-circle" />{message}</div>;
}

export function AdminShell({ eyebrow = "Admin console", title, description, actions, children }) {
  const pathname = usePathname();

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-heading">
          <span className="admin-sidebar-kicker">Workspace</span>
          <strong>Operations</strong>
        </div>
        <nav className="admin-nav" aria-label="Admin navigation">
          {navigation.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(`${item.href}/`));
            return (
              <Link key={item.href} href={item.href} className={active ? "active" : ""}>
                <i className={`bi ${item.icon}`} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="admin-sidebar-foot">
          <span className="admin-live-dot" />
          <div><strong>Production</strong><small>cryptodance.app</small></div>
        </div>
      </aside>
      <section className="admin-workspace">
        <nav className="admin-mobile-nav" aria-label="Admin navigation">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className={pathname === item.href ? "active" : ""} aria-label={item.label}>
              <i className={`bi ${item.icon}`} aria-hidden="true" /><span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <header className="admin-page-head">
          <div>
            <span className="admin-eyebrow">{eyebrow}</span>
            <h1>{title}</h1>
            {description && <p>{description}</p>}
          </div>
          {actions && <div className="admin-head-actions">{actions}</div>}
        </header>
        {children}
      </section>
    </main>
  );
}
