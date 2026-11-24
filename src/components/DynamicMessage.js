"use client";

import { useUser } from "@/context/UserContext";
import { useCurrency } from "@/context/CurrencyContext";
import { usePathname } from "next/navigation";
import { useConversionRate } from "@/hooks/useConversionRate";
import Link from "next/link";
import CryptoBalance from "./CryptoBalance";
import { useLanguage } from "@/context/LanguageContext";
import { stripLocale } from "@/i18n/config";


export default function DynamicMessage() {
  const { user } = useUser();
  const { currency } = useCurrency();
  const { rate } = useConversionRate(currency);
  const pathname = usePathname();
  const cleanPath = stripLocale(pathname);
  const { t, href } = useLanguage();
  const symbol = currency === "USD" ? "$" : "€";

  // If on a coin details page, return a "Back to Dashboard" link
  if (cleanPath.startsWith("/dashboard/coin/")) {
    return (
      <div className="w-100 d-flex justify-content-end mb-3">
        <Link href={href("/dashboard")} className="btn btn-outline-primary">
          <i className="bi bi-speedometer2 me-2"></i>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (cleanPath === "/dashboard" && user) {
    // Fiat balance from wallet (if available)
    const fiatBalance =
      user.wallet && typeof user.wallet.fiatBalance === "number"
        ? user.wallet.fiatBalance
        : 0;

    return (
      <div className="premium-panel portfolio-summary w-100">
        <div>
          <div className="eyebrow mb-2">{t("dashboard.availableCash")}</div>
          <h2>
            {symbol}
            {Number(fiatBalance * rate).toLocaleString(
              currency === "USD" ? "en-US" : "de-DE",
              { minimumFractionDigits: 2, maximumFractionDigits: 2 }
            )} 
          </h2>
        </div>
        <div>
          <CryptoBalance user={user} fiatSymbol={symbol} />
        </div>
      </div>
    );
  }

  if (cleanPath.startsWith("/coin") && user) {
    
   

    return (
      <div className="w-100 text-end">
          <Link className="links" href={href("/dashboard")}>
          <i className="bi bi-arrow-return-left me-1"></i>
          
            Dashboard
          </Link>
        </div>
    );
  }
  if (cleanPath.startsWith("/coin") && !user) {
    
   

    return (
      <div className="w-100 text-end">
          <Link className="links" href={href("/")}>
          <i className="bi bi-arrow-return-left me-1"></i>
          
            {t("coin.home")}
          </Link>
        </div>
    );
  }


  return null;
}
