// utils/sortCryptos.js
export function sortCryptos(cryptos, sortConfig) {
  // Ensure cryptos is an array; otherwise default to an empty array
  const sorted = Array.isArray(cryptos) ? [...cryptos] : [];
  
  sorted.sort((a, b) => {
    let aVal, bVal;
    // Your sorting logic here. For example:
    if (sortConfig.key === "marketCapUsd") {
      aVal = Number(a.marketCapUsd);
      bVal = Number(b.marketCapUsd);
    } else if (sortConfig.key === "priceUsd") {
      aVal = Number(a.priceUsd);
      bVal = Number(b.priceUsd);
    } else {
      // Default sort by rank
      aVal = Number(a.rank);
      bVal = Number(b.rank);
    }

    if (sortConfig.direction === "asc") {
      return aVal - bVal;
    } else {
      return bVal - aVal;
    }
  });

  return sorted;
}
