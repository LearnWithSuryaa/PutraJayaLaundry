export interface FinancialData {
  revenue: number;
  expenses: number;
  profit: number;
  margin: number;
}

export interface ComparisonResult {
  value: number;
  prevValue: number;
  growth: number; // percentage
  trend: "up" | "down" | "stable";
}

export interface ExpenseTrend {
  category: string;
  currentAmount: number;
  prevAmount: number;
  growth: number;
  isSignificant: boolean; // if growth > 10%
}

/**
 * Calculate basic growth percentage
 * Handles zero and negative values logic
 */
export function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;

  // Logic fix for negative denominator (e.g. Previous: -100, Current: 50)
  // Standard formula: (50 - (-100)) / -100 = -150% (Confusing)
  // Adjusted: (50 - (-100)) / |-100| = +150% (Clearer improvement)
  if (previous < 0) {
    return ((current - previous) / Math.abs(previous)) * 100;
  }

  return ((current - previous) / previous) * 100;
}

/**
 * Project end-of-month values based on current progress
 * Only valid if viewing the CURRENT month
 */
export function projectMonthEnd(
  currentValue: number,
  selectedMonth: number,
  selectedYear: number
): number {
  const now = new Date();
  // Check if selected is current month/year
  if (now.getMonth() === selectedMonth && now.getFullYear() === selectedYear) {
    const dayOfMonth = now.getDate();
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

    // Avoid division by zero or projecting on day 0
    if (dayOfMonth === 0) return currentValue;

    // Linear projection
    const dailyAverage = currentValue / dayOfMonth;
    return dailyAverage * daysInMonth;
  }
  return currentValue; // No projection for past months
}

/**
 * Analyze expense trends by category
 */
export function analyzeExpenseTrends(
  currentExpenses: any[],
  prevExpenses: any[]
): ExpenseTrend[] {
  const currentMap = currentExpenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  const prevMap = prevExpenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  // Get all unique categories
  const categories = Array.from(
    new Set([...Object.keys(currentMap), ...Object.keys(prevMap)])
  );

  return categories
    .map((cat) => {
      const current = currentMap[cat] || 0;
      const prev = prevMap[cat] || 0;
      const growth = calculateGrowth(current, prev);

      return {
        category: cat,
        currentAmount: current,
        prevAmount: prev,
        growth,
        isSignificant: Math.abs(growth) > 10 && prev > 10000, // Significant if >10% and base > 10k
      };
    })
    .sort((a, b) => b.growth - a.growth); // Sort by highest growth
}

export interface FinancialInsight {
  type: "success" | "warning" | "danger" | "info";
  title: string;
  message: string;
}

/**
 * Generate smart financial insights (AI Powered 2.0)
 * Returns structured data for UI rendering
 */
export function generateFinancialInsights(
  current: FinancialData,
  comparison: { revenue: number; expenses: number },
  trends: ExpenseTrend[]
): FinancialInsight[] {
  const insights: FinancialInsight[] = [];

  // Safe calculations with zero checks
  const revenueGrowth =
    comparison.revenue > 0
      ? calculateGrowth(current.revenue, comparison.revenue)
      : 0;
  const expenseGrowth =
    comparison.expenses > 0
      ? calculateGrowth(current.expenses, comparison.expenses)
      : 0;
  const netCashFlow = current.revenue - current.expenses;

  // 1. Efficiency Ratio (OpEx / Revenue)
  if (current.revenue > 0) {
    const efficiencyRatio = (current.expenses / current.revenue) * 100;
    if (efficiencyRatio > 80) {
      insights.push({
        type: "danger",
        title: "Inefficient Operation",
        message: `Biaya operasional memakan ${efficiencyRatio.toFixed(
          0
        )}% dari pendapatan. Ideal: <70%.`,
      });
    } else if (efficiencyRatio < 50 && current.expenses > 0) {
      insights.push({
        type: "success",
        title: "High Efficiency",
        message: `Bisnis sangat efisien! Biaya hanya ${efficiencyRatio.toFixed(
          0
        )}% dari pendapatan.`,
      });
    }
  }

  // 2. Revenue vs Expense Growth Velocity
  if (revenueGrowth > 10 && revenueGrowth > expenseGrowth + 5) {
    insights.push({
      type: "success",
      title: "Hyper Growth",
      message: `Revenue tumbuh ${revenueGrowth.toFixed(
        1
      )}%, jauh melebihi kenaikan biaya.`,
    });
  } else if (expenseGrowth > revenueGrowth + 10 && current.revenue > 0) {
    insights.push({
      type: "warning",
      title: "Cost Bleeding",
      message: `Pengeluaran naik ${expenseGrowth.toFixed(
        1
      )}% sementara revenue tertinggal. Review budget segera.`,
    });
  }

  // 3. Marketing ROI Analysis
  const marketingKeywords = [
    "marketing",
    "iklan",
    "promosi",
    "ads",
    "pemasaran",
  ];
  const marketingTrend = trends.find((t) =>
    marketingKeywords.some((k) => t.category.toLowerCase().includes(k))
  );
  if (marketingTrend && marketingTrend.currentAmount > 0) {
    if (revenueGrowth < 0 && marketingTrend.growth > 0) {
      insights.push({
        type: "warning",
        title: "Low Marketing ROI",
        message: `Budget marketing naik ${marketingTrend.growth.toFixed(
          0
        )}% tapi revenue malah turun.`,
      });
    } else if (revenueGrowth > 10 && marketingTrend.growth > 0) {
      insights.push({
        type: "success",
        title: "Effective Marketing",
        message:
          "Kenaikan marketing berkontribusi pada pertumbuhan revenue yang sehat.",
      });
    }
  }

  // 4. Burn Rate / Cash Flow Health
  if (netCashFlow < 0) {
    const burnRate = Math.abs(netCashFlow);
    insights.push({
      type: "danger",
      title: "Cash Burn",
      message: `Net cash flow minus ${new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(burnRate)}. Pastikan cadangan kas aman.`,
    });
  }

  // 5. Pareto Expense Analysis
  if (current.expenses > 0) {
    const sortedTrends = [...trends].sort(
      (a, b) => b.currentAmount - a.currentAmount
    );
    const topExpense = sortedTrends[0];
    if (topExpense) {
      const percentOfTotal =
        (topExpense.currentAmount / current.expenses) * 100;
      if (percentOfTotal > 40) {
        insights.push({
          type: "info",
          title: "Cost Concentration",
          message: `${percentOfTotal.toFixed(
            0
          )}% pengeluaran habis hanya untuk '${topExpense.category}'.`,
        });
      }
    }
  }

  // 6. Healthy Operations (Fallback positive)
  if (
    current.margin > 25 &&
    insights.filter((i) => i.type === "success").length === 0
  ) {
    if (current.expenses > 0 && current.expenses / current.revenue < 0.75) {
      insights.push({
        type: "success",
        title: "Healthy Margin",
        message: `Net Profit Margin ${current.margin.toFixed(
          1
        )}% tergolong sehat.`,
      });
    }
  }

  // Fallback for neutral/new months
  if (insights.length === 0) {
    if (current.revenue === 0 && current.expenses === 0) {
      insights.push({
        type: "info",
        title: "No Data",
        message:
          "Belum ada transaksi bulan ini. Mulai catat order dan pengeluaran.",
      });
    } else {
      insights.push({
        type: "info",
        title: "Stable Performance",
        message: "Keuangan bisnis berjalan stabil dan normal bulan ini.",
      });
    }
  }

  return insights.slice(0, 4);
}
