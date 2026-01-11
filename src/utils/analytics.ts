/**
 * Analytics Utility Functions
 * Helper functions for business intelligence calculations
 */

export interface CustomerData {
  id: string;
  phone: string;
  totalOrders: number;
  totalRevenue: number;
  firstOrderDate: Date;
  lastOrderDate: Date;
  avgOrderValue: number;
}

export interface CustomerSegment {
  id: string;
  phone: string;
  segment: "Champions" | "Loyal" | "Active" | "At Risk" | "Lost" | "New";
  totalRevenue: number;
  totalOrders: number;
  daysSinceLastOrder: number;
  clv: number;
  rfmScore: { r: number; f: number; m: number };
}

export interface ServiceAnalytics {
  serviceName: string;
  totalRevenue: number;
  totalOrders: number;
  avgPrice: number;
  percentage: number;
}

/**
 * Calculate Customer Lifetime Value (CLV)
 * CLV = Average Order Value × Purchase Frequency × Customer Lifespan
 */
export function calculateCLV(customer: CustomerData): number {
  const avgOrderValue = customer.avgOrderValue;
  const totalOrders = customer.totalOrders;

  // Calculate customer lifespan in months
  const firstOrder = new Date(customer.firstOrderDate);
  const lastOrder = new Date(customer.lastOrderDate);
  const lifespanMonths = Math.max(
    1,
    (lastOrder.getTime() - firstOrder.getTime()) / (1000 * 60 * 60 * 24 * 30)
  );

  // Purchase frequency per month
  const purchaseFrequency = totalOrders / lifespanMonths;

  // Projected lifespan (assume 12 months for new customers)
  const projectedLifespan = lifespanMonths < 3 ? 12 : lifespanMonths;

  return avgOrderValue * purchaseFrequency * projectedLifespan;
}

/**
 * Segment customers based on RFM Analysis (Recency, Frequency, Monetary)
 * Scores 1-5 for each metric
 */
export function segmentCustomers(customers: CustomerData[]): CustomerSegment[] {
  const now = new Date();

  // Helper to calculate score (1-5) based on quintiles
  const calculateScore = (
    value: number,
    sortedValues: number[],
    reverse = false
  ) => {
    const len = sortedValues.length;
    const position = sortedValues.findIndex((v) => v >= value);
    const percentile = (position + 1) / len;

    let score = 1;
    if (percentile <= 0.2) score = 1;
    else if (percentile <= 0.4) score = 2;
    else if (percentile <= 0.6) score = 3;
    else if (percentile <= 0.8) score = 4;
    else score = 5;

    return reverse ? 6 - score : score;
  };

  const rValues = customers
    .map((c) =>
      Math.floor(
        (now.getTime() - new Date(c.lastOrderDate).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    )
    .sort((a, b) => a - b);
  const fValues = customers.map((c) => c.totalOrders).sort((a, b) => a - b);
  const mValues = customers.map((c) => c.totalRevenue).sort((a, b) => a - b);

  return customers.map((customer) => {
    const daysSinceLastOrder = Math.floor(
      (now.getTime() - new Date(customer.lastOrderDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    const rScore = calculateScore(daysSinceLastOrder, rValues, true); // Lower recency is better
    const fScore = calculateScore(customer.totalOrders, fValues);
    const mScore = calculateScore(customer.totalRevenue, mValues);
    const fmScore = (fScore + mScore) / 2;

    const clv = calculateCLV(customer);

    let segment: CustomerSegment["segment"];

    // RFM Segmentation Logic
    if (rScore >= 4 && fmScore >= 4) {
      segment = "Champions";
    } else if (rScore >= 3 && fmScore >= 3) {
      segment = "Loyal";
    } else if (rScore >= 3 && fmScore <= 2) {
      segment = "Active";
    } else if (rScore <= 2 && rScore >= 2 && fmScore >= 3) {
      segment = "At Risk";
    } else if (rScore <= 1) {
      segment = "Lost";
    } else {
      segment = "New";
    }

    // Override for brand new customers (high recency, low frequency)
    if (daysSinceLastOrder <= 30 && customer.totalOrders === 1) {
      segment = "New";
    }

    return {
      id: customer.id,
      phone: customer.phone,
      segment,
      totalRevenue: customer.totalRevenue,
      totalOrders: customer.totalOrders,
      daysSinceLastOrder,
      clv,
      rfmScore: { r: rScore, f: fScore, m: mScore },
    };
  });
}

/**
 * Enhanced linear regression for revenue forecasting
 * Returns forecast, trend, confidence, and growth rate
 */
export function forecastRevenue(
  historicalData: { date: Date; revenue: number }[]
): {
  nextMonthForecast: number;
  trend: "up" | "down" | "stable";
  confidence: number;
  growthRate: number;
} {
  if (historicalData.length < 2) {
    return {
      nextMonthForecast: 0,
      trend: "stable",
      confidence: 0,
      growthRate: 0,
    };
  }

  // Sort by date
  const sorted = [...historicalData].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  // Calculate Growth Rate (Month over Month)
  const lastMonth = sorted[sorted.length - 1].revenue;
  const prevMonth = sorted[sorted.length - 2].revenue;
  const growthRate =
    prevMonth > 0 ? ((lastMonth - prevMonth) / prevMonth) * 100 : 0;

  // Calculate linear regression
  const n = sorted.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  sorted.forEach((point, index) => {
    const x = index;
    const y = point.revenue;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Forecast next month
  const nextMonthForecast = slope * n + intercept;

  // Determine trend
  const avgRevenue = sumY / n;
  const trendThreshold = avgRevenue * 0.05; // 5% threshold

  let trend: "up" | "down" | "stable";
  if (slope > trendThreshold) {
    trend = "up";
  } else if (slope < -trendThreshold) {
    trend = "down";
  } else {
    trend = "stable";
  }

  // Calculate R-squared for confidence
  let ssRes = 0;
  let ssTot = 0;

  sorted.forEach((point, index) => {
    const predicted = slope * index + intercept;
    ssRes += Math.pow(point.revenue - predicted, 2);
    ssTot += Math.pow(point.revenue - avgRevenue, 2);
  });

  const rSquared = ssTot === 0 ? 0 : 1 - ssRes / ssTot;
  const confidence = Math.max(0, Math.min(100, rSquared * 100));

  return {
    nextMonthForecast: Math.max(0, nextMonthForecast),
    trend,
    confidence,
    growthRate,
  };
}

/**
 * Calculate retention rate
 */
export function calculateRetentionRate(
  customersLastMonth: string[],
  customersThisMonth: string[]
): number {
  if (customersLastMonth.length === 0) return 0;

  const retained = customersLastMonth.filter((id) =>
    customersThisMonth.includes(id)
  ).length;

  return (retained / customersLastMonth.length) * 100;
}

/**
 * Calculate Average Order Value
 */
export function calculateAOV(orders: { total_price: number }[]): number {
  if (orders.length === 0) return 0;

  const totalRevenue = orders.reduce(
    (sum, order) => sum + order.total_price,
    0
  );
  return totalRevenue / orders.length;
}

/**
 * Analyze service performance from order items
 */
export function analyzeServices(orderItems: any[]): ServiceAnalytics[] {
  const serviceMap = new Map<string, { revenue: number; count: number }>();

  orderItems.forEach((item) => {
    // Priority: Snapshot name > Relation name > "Unknown"
    const serviceName =
      item.service_name || item.services?.name || "Unknown Service";

    // Priority: Snapshot price > price > 0
    const price = Number(item.service_price) || Number(item.price) || 0;

    const quantity = Number(item.quantity) || 1;
    const total = price * quantity;

    if (serviceMap.has(serviceName)) {
      const existing = serviceMap.get(serviceName)!;
      serviceMap.set(serviceName, {
        revenue: existing.revenue + total,
        count: existing.count + quantity,
      });
    } else {
      serviceMap.set(serviceName, { revenue: total, count: quantity });
    }
  });

  const totalRevenue = Array.from(serviceMap.values()).reduce(
    (sum, s) => sum + s.revenue,
    0
  );

  return Array.from(serviceMap.entries())
    .map(([serviceName, data]) => ({
      serviceName,
      totalRevenue: data.revenue,
      totalOrders: data.count,
      avgPrice: data.revenue / data.count,
      percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0,
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue);
}

/**
 * Calculate peak hours from orders with smart insights
 */
export function calculatePeakHours(orders: any[]): {
  hourlyData: { hour: number; count: number }[];
  peakHour: number;
  peakDay: string;
  dayParts: { name: string; count: number; percentage: number }[];
  recommendation: string;
} {
  const hourCounts = new Array(24).fill(0);
  const dayCounts: { [key: string]: number } = {
    Sunday: 0,
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0,
  };

  // Day Parts Containers
  const parts = {
    "Dini Hari (00-06)": 0,
    "Pagi (06-12)": 0,
    "Siang (12-18)": 0,
    "Malam (18-24)": 0,
  };

  orders.forEach((order) => {
    const date = new Date(order.created_at);

    // Explicitly convert to Asia/Jakarta (WIB)
    // Use Intl for robust timezone handling
    const hourStr = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Jakarta",
      hour: "numeric",
      hourCycle: "h23",
    }).format(date);

    const dayStr = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Jakarta",
      weekday: "long",
    }).format(date);

    const hour = parseInt(hourStr);
    const day = dayStr;

    if (!isNaN(hour)) {
      hourCounts[hour]++;
      dayCounts[day]++;

      if (hour < 6) parts["Dini Hari (00-06)"]++;
      else if (hour < 12) parts["Pagi (06-12)"]++;
      else if (hour < 18) parts["Siang (12-18)"]++;
      else parts["Malam (18-24)"]++;
    }
  });

  const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
  const peakDay = Object.entries(dayCounts).reduce((a, b) =>
    a[1] > b[1] ? a : b
  )[0];

  const hourlyData = hourCounts.map((count, hour) => ({ hour, count }));

  // Process Day Parts
  const totalOrders = orders.length || 1;
  const dayParts = Object.entries(parts)
    .map(([name, count]) => ({
      name,
      count,
      percentage: (count / totalOrders) * 100,
    }))
    .sort((a, b) => b.count - a.count);

  // Generate Smart Recommendation
  let recommendation = "";
  if (totalOrders === 0) {
    recommendation = "Belum cukup data untuk memberikan rekomendasi waktu.";
  } else {
    const peakPart = dayParts[0];
    if (peakPart.name.includes("Malam")) {
      recommendation = `🚀 **Action**: Toko sangat sibuk di malam hari (${peakPart.percentage.toFixed(
        0
      )}% order). Pastikan stok dan staf ready maksimal di jam 17:00 ke atas.`;
    } else if (peakPart.name.includes("Siang")) {
      recommendation = `☀️ **Action**: Order menumpuk di siang hari. Pertimbangkan shift pagi yang lebih kuat untuk handling pick-up siang.`;
    } else if (peakPart.name.includes("Pagi")) {
      recommendation = `🌅 **Action**: Banyak drop-off pagi. Buka toko lebih awal (07:00) bisa menangkap lebih banyak pelanggan berangkat kerja.`;
    } else {
      recommendation = `🌙 **Action**: Ada aktivitas dini hari yang unik. Cek apakah ini sistem error atau pelanggan begadang/insomnia?`;
    }
  }

  return { hourlyData, peakHour, peakDay, dayParts, recommendation };
}
