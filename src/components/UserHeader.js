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
  
  
  if (cleanPath.startsWith("/admin/dashboard") ) {
    return (
      <div className="d-flex align-items-baseline ">
      <i className="bi bi-person-fill ms-3 fs-5 "></i>
      <span className="fs-6 me-4">{user.name || user.email} (admin)</span>
      <a
        onClick={handleLogoutAdmin}
        style={{ cursor: "pointer" }}
        className="fs-6 link-offset-2 link-offset-3-hover link-underline-primary link-underline-opacity-0 link-underline-opacity-75-hover me-4"
      >
        <i className="bi bi-box-arrow-right fs-5 me-2"></i>
        {t("nav.logout")}
      </a>

      
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
