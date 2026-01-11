import { createClient } from "@/utils/supabase/server";
import { DashboardClient } from "./DashboardClient";
import { Order } from "@/types";

export const dynamic = "force-dynamic";

// Helper function to calculate stats for today
function calculateStats(ordersData: any[] | null) {
  if (!ordersData || ordersData.length === 0) {
    return {
      totalRevenue: 0,
      newOrders: 0,
      activeCustomers: 0,
      topService: "-",
    };
  }

  // Only count paid orders for revenue
  const totalRevenue = ordersData
    .filter((o) => o.status === "paid" || o.status === "completed")
    .reduce((acc, curr) => acc + (Number(curr.total_price) || 0), 0);

  const newOrders = ordersData.filter((o) => o.status === "pending").length;

  const uniqueCustomers = new Set(ordersData.map((o) => o.customer_phone)).size;

  // Calculate Top Service
  const serviceCounts: Record<string, number> = {};
  ordersData.forEach((order) => {
    order.order_items?.forEach((item: any) => {
      const name = item.service_name || "Unknown";
      serviceCounts[name] = (serviceCounts[name] || 0) + 1;
    });
  });
  const topService = Object.entries(serviceCounts).sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0];

  return {
    totalRevenue,
    newOrders,
    activeCustomers: uniqueCustomers,
    topService: topService || "-",
  };
}

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Get start and end of today in Asia/Jakarta timezone (WIB/UTC+7)
  // Supabase stores timestamptz which is timezone-aware
  const now = new Date();

  // Convert to Jakarta timezone and get start of day
  const jakartaOffset = 7 * 60; // UTC+7 in minutes
  const localOffset = now.getTimezoneOffset(); // Local offset in minutes
  const offsetDiff = jakartaOffset + localOffset; // Difference to add

  const todayJakarta = new Date(now.getTime() + offsetDiff * 60 * 1000);
  todayJakarta.setHours(0, 0, 0, 0);
  const startOfDay = new Date(
    todayJakarta.getTime() - offsetDiff * 60 * 1000
  ).toISOString();

  const tomorrowJakarta = new Date(todayJakarta);
  tomorrowJakarta.setDate(tomorrowJakarta.getDate() + 1);
  const endOfDay = new Date(
    tomorrowJakarta.getTime() - offsetDiff * 60 * 1000
  ).toISOString();

  // Fetch only TODAY's orders (Jakarta timezone) - Server-side rendering
  const { data: ordersData } = await supabase
    .from("orders")
    .select(
      "id, status, total_price, customer_name, customer_phone, created_at, order_items(service_name)"
    )
    .gte("created_at", startOfDay)
    .lt("created_at", endOfDay)
    .order("created_at", { ascending: false });

  // Fetch last 30 days revenue for Target Calculation
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: historicalData } = await supabase
    .from("orders")
    .select("total_price")
    .gte("created_at", thirtyDaysAgo.toISOString())
    .or("status.eq.paid,status.eq.completed");

  const totalRevenue30Days =
    historicalData?.reduce(
      (acc, curr) => acc + (Number(curr.total_price) || 0),
      0
    ) || 0;
  const averageDailyRevenue = totalRevenue30Days / 30; // Simple average
  const dailyTarget = Math.max(averageDailyRevenue * 1.1, 100000); // Target +10% growth, min 100k

  // Calculate stats on server (today's data only)
  const stats = calculateStats(ordersData);

  // Augment stats with dynamic insights
  const progress =
    dailyTarget > 0 ? (stats.totalRevenue / dailyTarget) * 100 : 0;
  let insightMessage = "Mulai hari ini dengan semangat!";

  if (progress >= 100) insightMessage = "Luar biasa! Target hari ini tercapai.";
  else if (progress >= 75) insightMessage = "Sedikit lagi mencapai target!";
  else if (progress >= 50) insightMessage = "Performa bagus, teruskan!";
  else if (stats.totalRevenue > 0)
    insightMessage = "Awal yang baik, kejar target!";

  const enhancedStats = {
    ...stats,
    dailyTarget,
    revenueProgress: progress,
    insightMessage,
  };

  const recentOrders = (ordersData?.slice(0, 5) || []) as Order[];

  return (
    <DashboardClient
      initialStats={enhancedStats}
      initialOrders={recentOrders}
    />
  );
}
