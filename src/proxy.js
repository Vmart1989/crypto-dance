import { NextResponse } from "next/server";
import { defaultLocale, locales, localizePath, stripLocale } from "@/i18n/config";

const SESSION_COOKIE = process.env.NODE_ENV === "production" ? "__Host-cd_session" : "cd_session";
const publicAdminPaths = ["/admin/login"];

function getLocale(pathname) {
  const segment = pathname.split("/")[1];
  return locales.includes(segment) && segment !== defaultLocale ? segment : defaultLocale;
}

function localizedRedirect(request, path, locale) {
  return NextResponse.redirect(new URL(localizePath(path, locale), request.url));
}

export async function proxy(request) {
  const visiblePath = request.nextUrl.pathname;
  const locale = getLocale(visiblePath);
  const pathname = stripLocale(visiblePath);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-site-locale", locale);
  requestHeaders.set("x-site-pathname", pathname);

  if (pathname.startsWith("/admin") && !publicAdminPaths.includes(pathname)) {
    if (!request.cookies.get(SESSION_COOKIE)?.value) return localizedRedirect(request, "/admin/login", locale);
  }
  if (pathname.startsWith("/dashboard")) {
    if (!request.cookies.get(SESSION_COOKIE)?.value) return localizedRedirect(request, "/register", locale);
  }

  const options = { request: { headers: requestHeaders } };
  if (pathname !== visiblePath) {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    return NextResponse.rewrite(url, options);
  }
  return NextResponse.next(options);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|sitemap-0.xml|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|map|txt|xml)$).*)"],
};
