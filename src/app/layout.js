import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import { Oswald, Open_Sans, Teko } from "next/font/google";
import { CurrencyProvider } from "../context/CurrencyContext";
import CurrencyToggle from "../components/CurrencyToggle";
import { UserProvider } from "../context/UserContext";
import DynamicMessage from "@/components/DynamicMessage";
import UserHeader from "@/components/UserHeader";
import Link from "next/link";
import Script from 'next/script';

const teko = Teko({ subsets: ["latin"], weight: ["400", "700"] });
const oswald = Oswald({ weight: ["400", "700"], subsets: ["latin"] });
const openSans = Open_Sans({ subsets: ["latin"], weight: ["400", "600", "700"] });

export const metadata = {
  metadataBase: new URL("https://cryptodance.app"),
  title: {
    default: "CryptoDance – Cryptocurrency Trading Simulator",
    template: "%s | CryptoDance",
  },
  description: "CryptoDance is an interactive cryptocurrency trading simulator. Learn crypto basics, simulate trades, and track cryptocurrency markets in real-time.",
  keywords: [
    "cryptocurrency",
    "trading simulator",
    "bitcoin",
    "crypto learning",
    "crypto trading",
    "crypto simulator",
    "crypto market",
    "ethereum",
    "solana",
    "cripto",
    "tether",
    "xrp",
    "binance",
    "usdc",
    "cardano",
    "dogecoin",
    "chainlink",
    "shiba inu",
    "pepe",
  ],
  openGraph: {
    title: "CryptoDance – Cryptocurrency Trading Simulator",
    description: "Learn cryptocurrency basics and simulate trading with real-time crypto market data.",
    url: "https://cryptodance.app",
    siteName: "CryptoDance",
    images: [
      {
        url: "/og-image.png", 
        width: 1200,
        height: 630,
        alt: "CryptoDance - Cryptocurrency Trading Simulator",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CryptoDance – Cryptocurrency Trading Simulator",
    description: "Learn crypto and simulate trading in real-time with CryptoDance.",
    images: ["/og-image.png"],
    creator: "@yourtwitterhandle", // replace with your actual handle
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png", // add these to public if available
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={oswald.className}>
      <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        />

        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
          strategy="beforeInteractive"
        />
        <CurrencyProvider>
          <UserProvider>
            {/* HEADER */}
            <div className="container">
              <header className="d-flex flex-wrap justify-content-center py-3 mb-4 ">
                <a href="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto link-body-emphasis text-decoration-none">
                  <h1>
                    <span className="display-1 text-primary fw-bold">
                      <img src="/logo.png" width="90px" alt="CryptoDance Logo" /> CryptoDance
                    </span>
                  </h1>
                </a>

                <ul className="nav nav-pills d-flex align-items-baseline w-100-movil me-3 me-md-0">
                  <li className="nav-item">
                    <UserHeader />
                  </li>
                  <li className="nav-item ms-auto">
                    <CurrencyToggle />
                  </li>
                </ul>
              </header>

              <div className="d-flex justify-content-center justify-content-md-between align-items-center ">
                <DynamicMessage />
              </div>
            </div>

            {children}

            {/* FOOTER */}
            <div className="container ">
              <footer className="py-3 my-4">
                <div className="d-flex justify-content-between align-baseline ">
                  <div>
                    <ul className="nav justify-content-start pb-3 mb-3">
                      <li className="nav-item">
                        <Link className="nav-link px-2 text-body-secondary link-underline-opacity-0" href="/">Home</Link>
                      </li>
                      <li className="nav-item"><a href="#" className="nav-link px-2 text-body-secondary">Features</a></li>
                      <li className="nav-item"><a href="#" className="nav-link px-2 text-body-secondary">FAQs</a></li>
                      <li className="nav-item"><a href="#" className="nav-link px-2 text-body-secondary">About</a></li>
                    </ul>
                  </div>
                  <div>
                    <p className="px-2 text-body-secondary">
                      Market data provided by <a href="https://www.coincap.io/">Coincap.io</a>
                    </p>
                  </div>
                </div>
                <p className="text-start text-secondary">© {new Date().getFullYear()} vmart.dev</p>
              </footer>
            </div>
          </UserProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}
