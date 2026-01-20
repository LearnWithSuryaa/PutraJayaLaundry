export const formatCurrency = (amount: number): string => {
  return (
    "Rp" +
    new Intl.NumberFormat("id-ID", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(amount)
  );
};

/**
 * Format percentage with sign indicator
 */
export function formatPercentage(
  value: number,
  showSign: boolean = true
): string {
  const sign = showSign && value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

/**
 * Format trend comparison
 */
export function formatTrend(
  current: number,
  previous: number
): {
  percentage: number;
  direction: "up" | "down" | "stable";
  formatted: string;
} {
  if (previous === 0) {
    return {
      percentage: current > 0 ? 100 : 0,
      direction: current > 0 ? "up" : "stable",
      formatted: current > 0 ? "+100%" : "0%",
    };
  }

  const percentage = ((current - previous) / previous) * 100;
  const direction = percentage > 0 ? "up" : percentage < 0 ? "down" : "stable";
  const formatted = formatPercentage(percentage, true);

  return { percentage, direction, formatted };
}
