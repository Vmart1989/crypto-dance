import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import { Manrope, Space_Grotesk } from "next/font/google";
import { headers } from "next/headers";
import Link from "next/link";
import Script from "next/script";
import { CurrencyProvider } from "../context/CurrencyContext";
import { UserProvider } from "../context/UserContext";
import { LanguageProvider } from "../context/LanguageContext";
import CurrencyToggle from "../components/CurrencyToggle";
import LanguageSelector from "../components/LanguageSelector";
import DynamicMessage from "@/components/DynamicMessage";
import UserHeader from "@/components/UserHeader";
import { locales, localizePath, normalizeLocale, translate } from "@/i18n/config";
import { guideContent } from "@/i18n/guide";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-body" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });

async function requestContext() {
  const requestHeaders = await headers();
  return {
    locale: normalizeLocale(requestHeaders.get("x-site-locale")),
    pathname: requestHeaders.get("x-site-pathname") || "/",
  };
}

export async function generateMetadata() {
  const { locale, pathname } = await requestContext();
  const page = pathname === "/register" ? "register" : pathname === "/guide" ? "guide" : pathname.startsWith("/coin/") ? "coin" : "home";
  const title = page === "guide" ? guideContent[locale].metaTitle : translate(locale, page === "home" ? "meta.title" : `meta.${page}Title`);
  const description = page === "guide" ? guideContent[locale].metaDescription : translate(locale, page === "home" ? "meta.description" : `meta.${page}Description`);
  const canonical = localizePath(pathname, locale);
  const languages = Object.fromEntries(locales.map((code) => [code, localizePath(pathname, code)]));
  languages["x-default"] = localizePath(pathname, "en");
  const privatePage = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

  return {
    metadataBase: new URL("https://cryptodance.app"),
    title: { default: `${title} | CryptoDance`, template: "%s | CryptoDance" },
    description,
    keywords: ["cryptocurrency trading simulator", "crypto market", "bitcoin simulator", "virtual crypto portfolio", "learn cryptocurrency"],
    alternates: { canonical, languages },
    openGraph: { title: `${title} | CryptoDance`, description, url: canonical, siteName: "CryptoDance", locale, images: [{ url: "/og-image.png", width: 1200, height: 630 }], type: "website" },
    twitter: { card: "summary_large_image", title: `${title} | CryptoDance`, description, images: ["/og-image.png"] },
    robots: privatePage ? { index: false, follow: false } : { index: true, follow: true },
    icons: { icon: "/favicon.ico" },
  };
}

export default async function RootLayout({ children }) {
  const { locale } = await requestContext();
  const t = (key) => translate(locale, key);
  const homeHref = localizePath("/", locale);
  const guideHref = localizePath("/guide", locale);
  const guideLabel = guideContent[locale].nav;

  return (
    <html lang={locale} data-scroll-behavior="smooth">
      <head>
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-48WTNGSD0T" />
        <Script id="google-analytics">{`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-48WTNGSD0T');`}</Script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
      </head>
      <body className={`${manrope.variable} ${spaceGrotesk.variable}`}>
        <LanguageProvider initialLocale={locale}>
          <CurrencyProvider>
            <UserProvider>
              <div className="site-glow site-glow-one" />
              <div className="site-glow site-glow-two" />
              <header className="app-header">
                <div className="container app-header-inner">
                  <Link href={homeHref} className="brand" aria-label="CryptoDance home">
                    <span className="brand-mark"><img src="/logo.png" alt="" width="34" height="34" /></span>
                    <span>Crypto<span>Dance</span></span>
                  </Link>
                  <div className="header-actions">
                    <Link href={guideHref} className="nav-action guide-nav-link" aria-label={guideLabel}>
                      <i className="bi bi-compass" aria-hidden="true" /><span className="d-none d-md-inline">{guideLabel}</span>
                    </Link>
                    <UserHeader /><LanguageSelector /><CurrencyToggle />
                  </div>
                </div>
              </header>
              <div className="container context-bar"><DynamicMessage /></div>
              <div className="site-content">{children}</div>
              <footer className="app-footer">
                <div className="container footer-inner">
                  <div>
                    <Link href={homeHref} className="brand brand-small">
                      <span className="brand-mark"><img src="/logo.png" alt="" width="24" height="24" /></span>
                      <span>Crypto<span>Dance</span></span>
                    </Link>
                    <p>{t("footer.tagline")}</p>
                    <Link href={guideHref} className="footer-guide-link"><i className="bi bi-compass" aria-hidden="true" /> {guideLabel}</Link>
                  </div>
                  <div className="footer-meta">
                    <span>{t("footer.marketData")} <a href="https://www.coincap.io/" rel="noopener noreferrer">CoinCap</a></span>
                    <span>© {new Date().getFullYear()} CryptoDance</span>
                  </div>
                </div>
              </footer>
            </UserProvider>
          </CurrencyProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
