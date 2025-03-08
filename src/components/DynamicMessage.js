"use client";

import { useUser } from "@/context/UserContext";
import { useCurrency } from "@/context/CurrencyContext";
import { usePathname } from "next/navigation";
import { useConversionRate } from "@/hooks/useConversionRate";
import Link from "next/link";


export default function DynamicMessage() {
  const { user } = useUser();
  const { currency } = useCurrency();
  const { rate } = useConversionRate(currency);
  const pathname = usePathname();

  // If on a coin details page, return a "Back to Dashboard" link
  if (pathname.startsWith("/dashboard/coin/")) {
    return (
      <div className="w-100 d-flex justify-content-end">
      <div className="mb-3">
        <Link
          href="/dashboard"
          className="btn btn-outline-primary"
        >
          <i className="bi bi-speedometer2 me-2"></i>
          Back to Dashboard
        </Link>
      </div>
      </div>
      
    );
  }

  // Helper functions
  const convertValue = (value) => Number(value) * rate;
  const formatCurrency = (value, currency) => {
    const locale = currency === "USD" ? "en-US" : "de-DE";
    return Number(value).toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };
  const symbol = currency === "USD" ? "$" : "€";

  if (pathname === "/dashboard" && user) {
    // Use a default balance of 0 if wallet is null or undefined
    const fiatBalance = user.wallet && typeof user.wallet.fiatBalance === "number"
      ? user.wallet.fiatBalance
      : 0;
    return (
      <div className="d-flex justify-content-between w-100">
      <div>
      <h3>
        Fiat Balance
      </h3>
      <h2>{symbol}{formatCurrency(convertValue(fiatBalance), currency)}</h2>
      </div>
      
      <div>
      <h3>Crypto Balance </h3>
      <h2>{symbol}56895 (+5%)</h2>
      </div>
      </div>
      
    );
    
  }
  return <h3>Dive into the Crypto World without risks!</h3>;
}
