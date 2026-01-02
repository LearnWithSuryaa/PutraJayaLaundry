import { createClient } from "@/utils/supabase/server";
import { DashboardClient } from "./DashboardClient";
import { Order } from "@/types";

// Helper function to calculate stats
function calculateStats(ordersData: any[] | null) {
  if (!ordersData || ordersData.length === 0) {
    return {
      totalRevenue: 0,
      newOrders: 0,
      activeCustomers: 0,
      topService: "-",
    };
  }

  const totalRevenue = ordersData.reduce(
    (acc, curr) => acc + (Number(curr.total_price) || 0),
    0
  );

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

  // Fetch only necessary data with limit - Server-side rendering
  const { data: ordersData } = await supabase
    .from("orders")
    .select(
      "id, status, total_price, customer_name, customer_phone, created_at, order_items(service_name)"
    )
    .order("created_at", { ascending: false })
    .limit(100); // Limit to 100 most recent orders for stats

  // Calculate stats on server
  const stats = calculateStats(ordersData);
  const recentOrders = (ordersData?.slice(0, 5) || []) as Order[];

  return <DashboardClient initialStats={stats} initialOrders={recentOrders} />;
}
