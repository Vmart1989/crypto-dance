// utils/sortCryptos.js
export function sortCryptos(cryptos, sortConfig) {
    const sorted = [...cryptos];
    sorted.sort((a, b) => {
      let aVal, bVal;
  
      switch (sortConfig.key) {
        case "marketCapUsd":
          aVal = Number(a.marketCapUsd);
          bVal = Number(b.marketCapUsd);
          break;
        case "priceUsd":
          aVal = Number(a.priceUsd);
          bVal = Number(b.priceUsd);
          break;
        
      }
  
      if (aVal < bVal) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aVal > bVal) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
    return sorted;
  }
  