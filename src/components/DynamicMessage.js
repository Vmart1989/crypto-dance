"use client";

import { useUser } from "@/context/UserContext";
import { useCurrency } from "@/context/CurrencyContext";
import { usePathname } from "next/navigation";
import { useConversionRate } from "@/hooks/useConversionRate";
import Link from "next/link";
import CryptoBalance from "./CryptoBalance";
import AddFundsModal from "./AddFundsModal";

export default function DynamicMessage() {
  const { user } = useUser();
  const { currency } = useCurrency();
  const { rate } = useConversionRate(currency);
  const pathname = usePathname();
  const symbol = currency === "USD" ? "$" : "€";

  // If on a coin details page, return a "Back to Dashboard" link
  if (pathname.startsWith("/dashboard/coin/")) {
    return (
      <div className="w-100 d-flex justify-content-end mb-3">
        <Link href="/dashboard" className="btn btn-outline-primary">
          <i className="bi bi-speedometer2 me-2"></i>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (pathname === "/dashboard" && user) {
    // Fiat balance from wallet (if available)
    const fiatBalance =
      user.wallet && typeof user.wallet.fiatBalance === "number"
        ? user.wallet.fiatBalance
        : 0;

    return (
      <div className="d-flex justify-content-between w-100 flex-wrap">
        <div>
          <h3>Fiat Balance</h3>
          <h2>
            {symbol}
            {Number(fiatBalance * rate).toLocaleString(
              currency === "USD" ? "en-US" : "de-DE",
              { minimumFractionDigits: 2, maximumFractionDigits: 2 }
            )} 
          </h2>
        </div>
        <div>
          <CryptoBalance user={user} symbol={symbol} />
        </div>
      </div>
    );
  }
  return <h3>Dive into the Crypto World without risks!</h3>;
}
