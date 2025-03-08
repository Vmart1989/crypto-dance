import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import { Oswald } from "next/font/google";
import { Open_Sans } from "next/font/google";
import { Teko } from "next/font/google";
import { CurrencyProvider } from "../context/CurrencyContext";
import CurrencyToggle from "../components/CurrencyToggle";
import { UserProvider } from "../context/UserContext";
import DynamicMessage from "@/components/DynamicMessage";
import UserHeader from "@/components/UserHeader";



const teko = Teko({
  subsets: ["latin"],
  weight: ["400", "700"], // Adjust weights as needed
});

const oswald = Oswald({
  weight: ["400", "700"],
  subsets: ["latin"],
});

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata = {
  title: "CryptoDance",
  description: "Simulate trading and learn the basics of cryptocurrency",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Simulate trading and learn the basics of cryptocurrency with CryptoDance."
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        />
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={oswald.className}>
        <CurrencyProvider>
          <UserProvider>
            {/* HEADER */}
            <div className="container">
              <header className="d-flex flex-wrap justify-content-center py-3 mb-4 ">
                <a
                  href="/"
                  className="d-flex align-items-center mb-3 mb-md-0 me-md-auto link-body-emphasis text-decoration-none"
                >
                  <h1>
                    <span className="display-1 text-primary fw-bold">
                      <img
                        src="/logo.png"
                        width="90px"
                        alt="CryptoDance Logo"
                      ></img>{" "}
                      CryptoDance
                    </span>
                  </h1>
                </a>

                <ul className="nav nav-pills d-flex align-items-baseline">
                  <li className="nav-item">
                    <UserHeader />
                  </li>

                  <li className="nav-item">
                    <CurrencyToggle />
                  </li>
                </ul>
              </header>
              {/* Dynamic header text */}
              <div className="d-flex justify-content-between align-items-center m-2">
                <DynamicMessage />
              </div>
            </div>
            {/* HEADER ENDS */}

            {children}
            {/* FOOTER  */}
            <div className="container ">
              <footer className="py-3 my-4">
                <ul className="nav justify-content-start border-bottom border-primary-subtle pb-3 mb-3">
                  <li className="nav-item">
                    <a href="#" className="nav-link px-2 text-body-secondary">
                      Home
                    </a>
                  </li>
                  <li className="nav-item">
                    <a href="#" className="nav-link px-2 text-body-secondary">
                      Features
                    </a>
                  </li>
                  <li className="nav-item">
                    <a href="#" className="nav-link px-2 text-body-secondary">
                      Pricing
                    </a>
                  </li>
                  <li className="nav-item">
                    <a href="#" className="nav-link px-2 text-body-secondary">
                      FAQs
                    </a>
                  </li>
                  <li className="nav-item">
                    <a href="#" className="nav-link px-2 text-body-secondary">
                      About
                    </a>
                  </li>
                </ul>
                <p className="text-start text-secondary">
                  © {new Date().getFullYear()} vmart.dev
                </p>
              </footer>
            </div>
          </UserProvider>
        </CurrencyProvider>

      </body>
    </html>
  );
}
