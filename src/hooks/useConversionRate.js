import { useState, useEffect } from "react";

export function useConversionRate(targetCurrency) {
  const [rate, setRate] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    //console.log("Target currency in hook:", targetCurrency);
    async function fetchRate() {
      if (targetCurrency === "USD") {
        // No conversion needed for USD
        setRate(1);
        return;
      }
      setLoading(true);
      try {
        // Fetch conversion rate from your secure API route
        const res = await fetch(`/api/currency?target=${targetCurrency}`);
        const json = await res.json();
        // Assuming the API returns something like: { data: { EUR: 0.92 } }
        if (json.data && json.data[targetCurrency]) {
          setRate(json.data[targetCurrency]);
        }
      } catch (error) {
        console.error("Error fetching conversion rate", error);
      }
      setLoading(false);
    }
    fetchRate();
  }, [targetCurrency]);

  return { rate, loading };
}
