
export function formatLargeNumber(num) {
    const abs = Math.abs(num); // for negative values
    if (abs >= 1e12) {
      // Trillions
      return (num / 1e12).toFixed(2) + "T";
    } else if (abs >= 1e9) {
      // Billions
      return (num / 1e9).toFixed(2) + "B";
    } else if (abs >= 1e6) {
      // Millions
      return (num / 1e6).toFixed(2) + "M";
    } else if (abs >= 1e3) {
      // Thousands
      return (num / 1e3).toFixed(2) + "K";
    } else {
      // Below 1000
      return num.toFixed(2);
    }
  }
  