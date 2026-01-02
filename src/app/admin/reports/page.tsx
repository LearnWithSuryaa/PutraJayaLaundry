"use client";

import { useEffect, useState, useMemo, memo } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Package,
  AlertTriangle,
  PackageCheck,
  Activity,
  Clock,
  WalletMinimal,
} from "lucide-react";
import { format, isSameDay, startOfWeek } from "date-fns";
import { id } from "date-fns/locale";
import {
  WeeklyRevenueChart,
  DailyRevenueChart,
} from "@/components/admin/ChartComponents";

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [loadinStatic, setLoadinStatic] = useState(true);

  // States
  const [orders, setOrders] = useState<any[]>([]); // Historical (Filtered)
  const [logs, setLogs] = useState<any[]>([]); // Historical (Filtered)

  const [liveOrders, setLiveOrders] = useState<any[]>([]); // Live (Static)
  const [inventory, setInventory] = useState<any[]>([]); // Live (Static)

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().getMonth().toString()
  );
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );
  const [selectedDate, setSelectedDate] = useState<string>(""); // Empty means monthly view

  const supabase = useMemo(() => createClient(), []);

  // 1. FETCH STATIC / LIVE DATA (Once on Mount)
  useEffect(() => {
    const fetchStaticData = async () => {
      setLoadinStatic(true);
      const startOfLiveWeek = startOfWeek(new Date(), {
        weekStartsOn: 1,
      }).toISOString();

      const [liveOrdersRes, inventoryRes] = await Promise.all([
        // Fetch Live Data (Current Week for Summary) - Optimized query
        supabase
          .from("orders")
          .select(
            "id, status, total_price, created_at, order_items(quantity, unit)"
          )
          .gte("created_at", startOfLiveWeek)
          .range(0, 999), // Reduced from 4999

        // Inventory
        supabase.from("inventory_items").select("*"),
      ]);

      if (liveOrdersRes.error)
        console.error("Error fetching live data:", liveOrdersRes.error);
      if (inventoryRes.error)
        console.error("Error fetching inventory:", inventoryRes.error);

      setLiveOrders(liveOrdersRes.data || []);
      setInventory(inventoryRes.data || []);
      setLoadinStatic(false);
    };

    fetchStaticData();
  }, [supabase]); // Run once

  // 2. FETCH HISTORICAL REPORT DATA (On Filter Change)
  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);

      // REPORT PERIOD: Selected Date (if specified) or Month
      let startDate: string;
      let endDate: string;

      if (selectedDate) {
        // Daily view: specific date
        const start = new Date(selectedDate);
        start.setHours(0, 0, 0, 0);
        startDate = start.toISOString();

        const end = new Date(selectedDate);
        end.setHours(23, 59, 59, 999);
        endDate = end.toISOString();
      } else {
        // Monthly view
        startDate = new Date(
          parseInt(selectedYear),
          parseInt(selectedMonth),
          1
        ).toISOString();

        endDate = new Date(
          parseInt(selectedYear),
          parseInt(selectedMonth) + 1,
          0,
          23,
          59,
          59
        ).toISOString();
      }

      const [ordersRes, logsRes] = await Promise.all([
        // Fetch Selected Month Data - Optimized query
        supabase
          .from("orders")
          .select(
            "id, status, total_price, created_at, order_items(quantity, unit)"
          )
          .gte("created_at", startDate)
          .lte("created_at", endDate)
          .order("created_at", { ascending: true })
          .range(0, 999), // Reduced from 4999

        // Restock Logs (Selected Month)
        supabase
          .from("inventory_logs")
          .select("*, inventory_items(name, unit)")
          .in("change_type", ["restock", "initial"])
          .gte("created_at", startDate)
          .lte("created_at", endDate)
          .order("created_at", { ascending: false })
          .range(0, 499), // Reduced from 1000
      ]);

      if (ordersRes.error)
        console.error("Error fetching report orders:", ordersRes.error);

      setOrders(ordersRes.data || []);
      setLogs(logsRes.data || []);
      setLoading(false);
    };

    fetchReportData();
  }, [supabase, selectedMonth, selectedYear]); // Run on filter change

  // --- ALGORITHMS & STATS ---

  const stats = useMemo(() => {
    const today = new Date();

    // A. LIVE STATS
    const revenueToday = liveOrders.reduce((sum, order) => {
      if (
        order.status === "paid" &&
        isSameDay(new Date(order.created_at), today)
      ) {
        return sum + order.total_price;
      }
      return sum;
    }, 0);

    const ordersToday = liveOrders.filter((o) =>
      isSameDay(new Date(o.created_at), today)
    ).length;

    const revenueThisWeek = liveOrders.reduce((sum, order) => {
      if (order.status === "paid") return sum + order.total_price;
      return sum;
    }, 0);

    // B. MONTHLY REPORT STATS
    const totalRevenue = orders.reduce((sum, order) => {
      if (order.status === "paid") return sum + order.total_price;
      return sum;
    }, 0);

    const potentialRevenue = orders.reduce((sum, order) => {
      if (order.status !== "paid") return sum + order.total_price;
      return sum;
    }, 0);

    const totalOrders = orders.length;

    // Production Volume
    let totalKg = 0;
    let totalPcs = 0;

    orders.forEach((order) => {
      if (order.order_items) {
        order.order_items.forEach((item: any) => {
          if (item.unit?.toLowerCase() === "kg") {
            totalKg += item.quantity || 0;
          } else {
            totalPcs += item.quantity || 0;
          }
        });
      }
    });

    // Daily Revenue Chart Data
    const daysInMonth = new Date(
      parseInt(selectedYear),
      parseInt(selectedMonth) + 1,
      0
    ).getDate();
    const dailyData = Array.from({ length: daysInMonth }, (_, i) => {
      const d = i + 1;
      const revenue = orders
        .filter(
          (o) => o.status === "paid" && new Date(o.created_at).getDate() === d
        )
        .reduce((sum, o) => sum + o.total_price, 0);
      return { name: `${d}`, total: revenue };
    });

    // Weekly Breakdown
    const weeklyData = [
      { name: "Minggu 1 (1-7)", range: [1, 7], total: 0 },
      { name: "Minggu 2 (8-14)", range: [8, 14], total: 0 },
      { name: "Minggu 3 (15-21)", range: [15, 21], total: 0 },
      { name: "Minggu 4 (22-28)", range: [22, 28], total: 0 },
      { name: "Minggu 5 (29+)", range: [29, 31], total: 0 },
    ];

    orders.forEach((order) => {
      if (order.status === "paid") {
        const day = new Date(order.created_at).getDate();
        const weekIndex = weeklyData.findIndex(
          (w) => day >= w.range[0] && day <= w.range[1]
        );
        if (weekIndex !== -1) {
          weeklyData[weekIndex].total += order.total_price;
        }
      }
    });

    const lowStockItems = inventory.filter(
      (item) => item.stock <= (item.min_stock || 5)
    );

    return {
      revenueToday,
      ordersToday,
      revenueThisWeek,
      totalRevenue,
      potentialRevenue,
      totalOrders,
      totalKg,
      totalPcs,
      dailyData,
      weeklyData: weeklyData.filter(
        (w) => w.total > 0 || parseInt(selectedMonth) === new Date().getMonth()
      ),
      lowStockItems,
    };
  }, [orders, liveOrders, inventory, selectedMonth, selectedYear]);

  // Loading State
  if (loading && loadinStatic) {
    // Only block if everything is loading
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            {selectedDate ? "Laporan Harian" : "Laporan Bulanan"}
          </h2>
          <p className="text-slate-400">
            {selectedDate
              ? `Laporan untuk ${format(
                  new Date(selectedDate),
                  "dd MMMM yyyy",
                  { locale: id }
                )}`
              : "Analisis performa bisnis dan inventaris Anda."}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[140px] bg-slate-900 border-white/10 text-white">
              <SelectValue placeholder="Bulan" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/10 text-white">
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i} value={i.toString()}>
                  {format(new Date(2000, i, 1), "MMMM", { locale: id })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[100px] bg-slate-900 border-white/10 text-white">
              <SelectValue placeholder="Tahun" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/10 text-white">
              {[2024, 2025, 2026, 2027].map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-white/10 text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate("")}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-md transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* --- LIVE SUMMARY CARDS (Global) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Pendapatan Hari Ini"
          value={`Rp ${stats.revenueToday.toLocaleString("id-ID")}`}
          subtext={`${stats.ordersToday} pesanan baru`}
          icon={Activity}
          trend="Live"
          color="cyan"
        />
        <SummaryCard
          title="Pendapatan Minggu Ini"
          value={`Rp ${stats.revenueThisWeek.toLocaleString("id-ID")}`}
          subtext="Sejak Senin"
          icon={TrendingUp}
          color="indigo"
        />
        <SummaryCard
          title="Produksi Bulan Ini"
          value={`${stats.totalKg.toFixed(1)} Kg`}
          subtext={`+ ${stats.totalPcs} Pcs Satuan`}
          icon={Package}
          color="emerald"
        />
        <SummaryCard
          title="Pendapatan (Lunas)"
          value={`Rp ${stats.totalRevenue.toLocaleString("id-ID")}`}
          subtext={`est. +Rp ${stats.potentialRevenue.toLocaleString(
            "id-ID"
          )} (Piutang)`}
          icon={WalletMinimal}
          color="violet"
        />
      </div>

      {loading ? (
        <div className="flex h-64 w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-500 opacity-50" />
        </div>
      ) : (
        <>
          {/* --- CHARTS ROW 1 --- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Weekly Revenue Bar Chart */}
            <Card className="bg-slate-900/60 border-white/10 backdrop-blur-xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-white text-lg">
                  Pendapatan Mingguan
                </CardTitle>
                <CardDescription>
                  Breakdown pendapatan per minggu bulan ini
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WeeklyRevenueChart data={stats.weeklyData} />
              </CardContent>
            </Card>

            {/* Daily Revenue Area Chart */}
            <Card className="bg-slate-900/60 border-white/10 backdrop-blur-xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-white text-lg">
                  Tren Harian
                </CardTitle>
                <CardDescription>
                  Fluktuasi pendapatan harian bulan ini
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DailyRevenueChart data={stats.dailyData} />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            {/* Low Stock Alert */}
            <Card className="bg-slate-900/60 border-white/10 backdrop-blur-xl lg:col-span-1 border-l-4 border-l-rose-500">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <AlertTriangle className="text-rose-500 w-5 h-5" />
                  Stok Menipis
                </CardTitle>
                <CardDescription>
                  Barang yang perlu segera direstock.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {stats.lowStockItems.length > 0 ? (
                    stats.lowStockItems.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center bg-rose-500/10 p-3 rounded-lg border border-rose-500/20"
                      >
                        <div>
                          <p className="font-medium text-rose-200">
                            {item.name}
                          </p>
                          <p className="text-xs text-rose-400">
                            Min: {item.min_stock} {item.unit}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-bold text-rose-500">
                            {item.stock}
                          </span>
                          <span className="text-xs text-rose-400 ml-1">
                            {item.unit}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                      <PackageCheck className="w-10 h-10 mb-2 opacity-20" />
                      <p>Semua stok aman</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Restock History Log */}
            <Card className="bg-slate-900/60 border-white/10 backdrop-blur-xl lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Package className="text-emerald-400 w-5 h-5" />
                  Riwayat Restock
                </CardTitle>
                <CardDescription>
                  Log pemasukan barang bulan ini.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border border-white/5 overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-950/50 text-slate-400 font-medium pt-3">
                      <tr>
                        <th className="px-4 py-3">Tanggal</th>
                        <th className="px-4 py-3">Barang</th>
                        <th className="px-4 py-3 text-right">Jumlah</th>
                        <th className="px-4 py-3 hidden md:table-cell">
                          Catatan
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 bg-slate-900/20">
                      {logs.length > 0 ? (
                        logs.map((log: any) => (
                          <tr
                            key={log.id}
                            className="hover:bg-white/5 transition-colors"
                          >
                            <td className="px-4 py-3 text-slate-400">
                              {format(
                                new Date(log.created_at),
                                "dd MMM HH:mm",
                                { locale: id }
                              )}
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-200">
                              {log.inventory_items?.name || "Unknown"}
                            </td>
                            <td className="px-4 py-3 text-right text-emerald-400 font-bold">
                              +{log.change_amount} {log.inventory_items?.unit}
                            </td>
                            <td className="px-4 py-3 text-slate-500 italic hidden md:table-cell max-w-[200px] truncate">
                              {log.notes || "-"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-4 py-8 text-center text-slate-500"
                          >
                            Belum ada data restock bulan ini.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

// Memoized SummaryCard for better performance
const SummaryCard = memo(function SummaryCard({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  color,
}: any) {
  const colorClasses: any = {
    cyan: "from-cyan-500 to-blue-500 text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
    indigo:
      "from-indigo-500 to-violet-500 text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
    emerald:
      "from-emerald-500 to-teal-500 text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    violet:
      "from-violet-500 to-fuchsia-500 text-violet-500 bg-violet-500/10 border-violet-500/20",
  };

  const activeColor = colorClasses[color] || colorClasses.cyan;

  return (
    <Card className="bg-slate-900/60 border-white/10 backdrop-blur-xl relative overflow-hidden group">
      <div
        className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${
          activeColor.split(" ")[0]
        } opacity-10 blur-2xl rounded-bl-full transition-transform group-hover:scale-150 duration-500`}
      />
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div
            className={`p-3 rounded-xl ${activeColor
              .split(" ")
              .slice(2)
              .join(" ")}`}
          >
            <Icon className="w-6 h-6" />
          </div>
          {trend && (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {trend}
            </span>
          )}
        </div>
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
            {value}
          </h3>
          <p className="text-slate-500 text-xs mt-1">{subtext}</p>
        </div>
      </CardContent>
    </Card>
  );
});
