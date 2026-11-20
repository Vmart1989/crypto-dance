// src/components/CurrencyToggle.js
"use client";

import { useCurrency } from "../context/CurrencyContext";

export default function CurrencyToggle() {
  const { currency, setCurrency } = useCurrency(); // Access from context

  const handleChange = (e) => {
    setCurrency(e.target.value);
  };

  return (
    <div className="d-flex align-items-center">

      <select
        id="currencySelect"
        aria-label="Display currency"
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
