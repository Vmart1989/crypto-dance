"use client";

import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { stripLocale } from "@/i18n/config";

export default function UserHeader() {
  const { user, setUser } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const { t, href } = useLanguage();
  const cleanPath = stripLocale(pathname);

  const handleLogout = async () => {
    // Call logout endpoint and clear user context
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push(href("/"));
  };

  const handleLogoutAdmin = async () => {
    // Call logout endpoint and clear user context
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push(href("/admin/login"));
  };

  // Only render something if the user is logged in.
  if (!user || cleanPath.startsWith("/admin/login")) return null;
  
  
  if (cleanPath.startsWith("/admin")) {
    return (
      <div className="admin-user-menu">
      <span className="admin-user-avatar"><i className="bi bi-person-fill" /></span>
      <span className="admin-user-identity"><strong>{user.name || "Administrator"}</strong><small>{user.email}</small></span>
      <button
        onClick={handleLogoutAdmin}
        className="admin-logout-button"
        type="button"
        aria-label={t("nav.logout")}
      >
        <i className="bi bi-box-arrow-right"></i>
      </button>
    </div>
    )
  }
   
  else 

  return (
    <div className="d-flex align-items-center gap-3 user-nav">
      <span className="d-none d-lg-inline user-name"><i className="bi bi-person-circle me-2"></i>{user.name || user.email}</span>
      <a
        onClick={handleLogout}
        style={{ cursor: "pointer" }}
        className="nav-action"
      >
        <i className="bi bi-box-arrow-right"></i><span className="d-none d-md-inline"> {t("nav.logout")}</span>
      </a>

      <Link
        className="nav-action"
        href={href("/dashboard/news")}
      >
        <i className="bi bi-newspaper"></i><span className="d-none d-md-inline"> {t("nav.news")}</span>
      </Link>
    </div>
  );
}
