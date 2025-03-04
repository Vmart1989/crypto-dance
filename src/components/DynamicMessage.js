"use client";

import { useUser } from "@/context/UserContext";
import { useCurrency } from "@/context/CurrencyContext";
import { usePathname } from "next/navigation";
import { useConversionRate } from "@/hooks/useConversionRate";

export default function DynamicMessage() {
  const { user } = useUser();
  const { currency } = useCurrency();
  const { rate } = useConversionRate(currency);
  const pathname = usePathname();

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
      <h3>
        Your Wallet Balance: {symbol} {formatCurrency(convertValue(fiatBalance), currency)}
      </h3>
    );
  }
  return <h3>Dive into the Crypto World without risks!</h3>;
}
