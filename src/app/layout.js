import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import { Manrope, Space_Grotesk } from "next/font/google";
import { CurrencyProvider } from "../context/CurrencyContext";
import CurrencyToggle from "../components/CurrencyToggle";
import { UserProvider } from "../context/UserContext";
import DynamicMessage from "@/components/DynamicMessage";
import UserHeader from "@/components/UserHeader";
import Link from "next/link";
import Script from "next/script";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-body" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });

export const metadata = {
  metadataBase: new URL("https://cryptodance.app"),
  title: { default: "CryptoDance - Cryptocurrency Trading Simulator", template: "%s | CryptoDance" },
  description: "CryptoDance is an interactive cryptocurrency trading simulator. Learn crypto basics, simulate trades, and track cryptocurrency markets in real-time.",
  keywords: ["cryptocurrency", "trading simulator", "bitcoin", "crypto learning", "crypto market", "ethereum", "solana"],
  openGraph: {
    title: "CryptoDance - Cryptocurrency Trading Simulator",
    description: "Learn cryptocurrency basics and simulate trading with real-time crypto market data.",
    url: "https://cryptodance.app",
    siteName: "CryptoDance",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CryptoDance - Cryptocurrency Trading Simulator",
    description: "Learn crypto and simulate trading in real-time with CryptoDance.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-48WTNGSD0T" />
        <Script id="google-analytics">{`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-48WTNGSD0T');`}</Script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
      </head>
      <body className={`${manrope.variable} ${spaceGrotesk.variable}`}>
        <CurrencyProvider>
          <UserProvider>
            <div className="site-glow site-glow-one" />
            <div className="site-glow site-glow-two" />
            <header className="app-header">
              <div className="container app-header-inner">
                <Link href="/" className="brand" aria-label="CryptoDance home">
                  <span className="brand-mark"><img src="/logo.png" alt="" width="34" height="34" /></span>
                  <span>Crypto<span>Dance</span></span>
                </Link>
                <div className="header-actions"><UserHeader /><CurrencyToggle /></div>
              </div>
            </header>

            <div className="container context-bar"><DynamicMessage /></div>
            <div className="site-content">{children}</div>

            <footer className="app-footer">
              <div className="container footer-inner">
                <div>
                  <Link href="/" className="brand brand-small">
                    <span className="brand-mark"><img src="/logo.png" alt="" width="24" height="24" /></span>
                    <span>Crypto<span>Dance</span></span>
                  </Link>
                  <p>Practice the market. Keep the risk virtual.</p>
                </div>
                <div className="footer-meta">
                  <span>Market data by <a href="https://www.coincap.io/">CoinCap</a></span>
                  <span>© {new Date().getFullYear()} CryptoDance</span>
                </div>
              </div>
            </footer>
          </UserProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}
