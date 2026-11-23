// src/components/CurrencyToggle.js
"use client";

import { useCurrency } from "../context/CurrencyContext";
import { useLanguage } from "@/context/LanguageContext";

export default function CurrencyToggle() {
  const { currency, setCurrency } = useCurrency(); // Access from context
  const { t } = useLanguage();

  const handleChange = (e) => {
    setCurrency(e.target.value);
  };

  return (
    <div className="d-flex align-items-center">

      <select
        id="currencySelect"
        aria-label={t("dashboard.desk")}
        value={currency}
        onChange={handleChange}
        className="form-select form-select-sm currency-select"
        style={{ width: "auto" }}
      >
        <option value="USD">USD</option>
        <option value="EUR">EUR</option>
      </select>
    </div>
  );
}
