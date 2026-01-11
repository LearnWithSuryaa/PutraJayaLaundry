"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  ArrowRight,
  AlertTriangle,
  AlertCircle,
  Clock,
  CheckCircle2,
  Package,
  Search,
  Wallet,
  Settings,
  History,
} from "lucide-react";
import Link from "next/link";
import { Order } from "@/types";
import { formatCurrency } from "@/utils/format";

interface Alert {
  type: "warning" | "critical";
  title: string;
  message: string;
  link?: string;
}

interface DashboardStats {
  totalRevenue: number;
  newOrders: number;
  activeCustomers: number;
  topService: string;
  alerts?: Alert[];
  dailyTarget?: number;
  revenueProgress?: number;
  insightMessage?: string;
}

interface DashboardClientProps {
  initialStats: DashboardStats;
  initialOrders: Order[];
}

export function DashboardClient({
  initialStats,
  initialOrders,
}: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");

  const activeOrders = initialOrders.filter(
    (o) => o.status === "pending" || o.status === "processing"
  );

  const historyOrders = initialOrders.filter(
    (o) => o.status !== "pending" && o.status !== "processing"
  );

  const [stats, setStats] = useState(initialStats);

  // Load target settings override
  useEffect(() => {
    const savedTarget = localStorage.getItem("rynse_target_settings");
    if (savedTarget) {
      const { useDynamicTarget, manualTarget } = JSON.parse(savedTarget);

      if (useDynamicTarget === false && manualTarget > 0) {
        // Recalculate based on manual target
        const progress = (initialStats.totalRevenue / manualTarget) * 100;
        let insightMessage = "Mulai hari ini dengan semangat!";

        if (progress >= 100)
          insightMessage = "Luar biasa! Target hari ini tercapai.";
        else if (progress >= 75)
          insightMessage = "Sedikit lagi mencapai target!";
        else if (progress >= 50) insightMessage = "Performa bagus, teruskan!";
        else if (initialStats.totalRevenue > 0)
          insightMessage = "Awal yang baik, kejar target!";

        setStats((prev) => ({
          ...prev,
          dailyTarget: manualTarget,
          revenueProgress: progress,
          insightMessage,
        }));
      }
    }
  }, [initialStats]);

  return (
    <div className="space-y-8 pb-12">
      {/* Smart Header */}
      <SmartHeader stats={stats} />

      {/* Stats Grid - Visual Hierarchy refined */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Revenue"
          value={formatCurrency(stats.totalRevenue)}
          desc="Pendapatan hari ini"
          icon={DollarSign}
          color="text-emerald-400"
          bg="bg-emerald-500/10"
          trend="+12%" // Example trend
        />
        <StatsCard
          title="Orders"
          value={stats.newOrders.toString()}
          desc="Order baru masuk"
          icon={ShoppingBag}
          color="text-blue-400"
          bg="bg-blue-500/10"
        />
        <StatsCard
          title="Customers"
          value={stats.activeCustomers.toString()}
          desc="Pelanggan aktif"
          icon={Users}
          color="text-violet-400"
          bg="bg-violet-500/10"
        />
        <StatsCard
          title="Top Service"
          value={stats.topService}
          desc="Paling laris"
          icon={TrendingUp}
          color="text-orange-400"
          bg="bg-orange-500/10"
        />
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickActionButton
          href="/admin/orders"
          icon={Plus}
          label="Buat Order"
          primary
        />
        <QuickActionButton
          href="/admin/finance"
          icon={Wallet}
          label="Catat Biaya"
        />
        <QuickActionButton
          href="/admin/customers"
          icon={Users}
          label="Pelanggan"
        />
        <QuickActionButton
          href="/admin/settings"
          icon={Settings}
          label="Pengaturan"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Focus Area: Orders */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-cyan-400" />
              Order Focus
            </h3>

            {/* Custom Tab Switcher */}
            <div className="bg-slate-900/50 p-1 rounded-lg border border-white/10 flex gap-1">
              <button
                onClick={() => setActiveTab("active")}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  activeTab === "active"
                    ? "bg-cyan-500/20 text-cyan-400 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Perlu Diproses
                {activeOrders.length > 0 && (
                  <span className="ml-2 bg-cyan-500 text-slate-900 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                    {activeOrders.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  activeTab === "history"
                    ? "bg-slate-700/50 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Riwayat
              </button>
            </div>
          </div>

          <Card className="border border-white/10 bg-slate-900/40 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl min-h-[400px]">
            {activeTab === "active" ? (
              <ActiveOrdersList orders={activeOrders} />
            ) : (
              <HistoryOrdersList orders={historyOrders} />
            )}
          </Card>
        </div>

        {/* Right Sidebar: Alerts & Summary */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Insights</h3>
          </div>

          {/* Critical Alerts */}
          {stats.alerts && stats.alerts.length > 0 ? (
            <div className="space-y-3">
              {stats.alerts.map((alert, idx) => (
                <AlertCard key={idx} alert={alert} />
              ))}
            </div>
          ) : (
            <Card className="bg-emerald-500/5 border-emerald-500/10 p-6 flex flex-col items-center text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-3 opacity-50" />
              <p className="text-emerald-400 font-medium">Semua Aman</p>
              <p className="text-sm text-slate-400 mt-1">
                Tidak ada isu kritikal yang perlu perhatian.
              </p>
            </Card>
          )}

          {/* Mini Summary / Motivation */}
          <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-white/5 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <h4 className="font-bold text-white mb-2 relative z-10">
              Target Hari Ini
            </h4>
            <div className="space-y-4 relative z-10">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Revenue Goal</span>
                  <span>{stats.revenueProgress?.toFixed(0) || 0}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000"
                    style={{
                      width: `${Math.min(stats.revenueProgress || 0, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Current: {formatCurrency(stats.totalRevenue)}
                </span>
                <span className="text-slate-500">
                  Target: {formatCurrency(stats.dailyTarget || 0)}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {stats.insightMessage}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Sub-components

function SmartHeader({ stats }: { stats: DashboardStats }) {
  // Simple logic for greeting based on time
  const hour = new Date().getHours();
  let greeting = "Selamat Pagi";
  if (hour >= 12 && hour < 15) greeting = "Selamat Siang";
  else if (hour >= 15 && hour < 18) greeting = "Selamat Sore";
  else if (hour >= 18) greeting = "Selamat Malam";

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          {greeting}, Owner!
        </h1>
        <p className="text-slate-400 mt-1">
          {stats.newOrders > 5
            ? "🔥 Toko sedang ramai hari ini."
            : "☕ Situasi terkendali dan lancar."}
        </p>
      </div>
      <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-900/50 px-3 py-1.5 rounded-full border border-white/5">
        <Clock className="w-4 h-4" />
        <span>Update terakhir: Baru saja</span>
      </div>
    </div>
  );
}

function StatsCard({ title, value, desc, icon: Icon, color, bg }: any) {
  return (
    <Card className="border border-white/10 bg-slate-900/40 backdrop-blur-md hover:border-white/20 transition-all rounded-xl p-5 hover:bg-white/5 group relative overflow-hidden">
      <div
        className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}
      >
        <Icon className="w-12 h-12 -mr-2 -mt-2 transform rotate-12" />
      </div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <div className={`p-2 rounded-lg ${bg} ${color}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-white tracking-tight">
          {value}
        </div>
        <p className="text-xs text-slate-500 mt-1">{desc}</p>
      </div>
    </Card>
  );
}

function QuickActionButton({ href, icon: Icon, label, primary }: any) {
  return (
    <Link href={href} className="block">
      <div
        className={`
                flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all cursor-pointer h-full
                ${
                  primary
                    ? "bg-cyan-500/10 border-cyan-500/20 hover:bg-cyan-500/20 text-cyan-400"
                    : "bg-slate-900/40 border-white/10 hover:bg-white/5 text-slate-300 hover:text-white"
                }
            `}
      >
        <Icon
          className={`w-6 h-6 ${primary ? "text-cyan-400" : "opacity-70"}`}
        />
        <span className="text-sm font-medium">{label}</span>
      </div>
    </Link>
  );
}

function ActiveOrdersList({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <CheckCircle2 className="w-12 h-12 mb-3 opacity-20" />
        <p>Tidak ada order yang perlu diproses.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-white/5">
      {orders.map((order) => (
        <div
          key={order.id}
          className="p-4 hover:bg-white/5 transition-colors flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-2 h-12 rounded-full ${
                order.status === "pending" ? "bg-yellow-500" : "bg-blue-500"
              }`}
            ></div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-white text-lg">#{order.id}</h4>
                <Badge
                  variant="outline"
                  className={`
                                     ${
                                       order.status === "pending"
                                         ? "text-yellow-500 border-yellow-500/20 bg-yellow-500/10"
                                         : "text-blue-500 border-blue-500/20 bg-blue-500/10"
                                     }
                                 `}
                >
                  {order.status}
                </Badge>
              </div>
              <p className="text-slate-300 font-medium">
                {order.customer_name}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {order.order_items?.[0]?.service_name || "Layanan..."}
                {order.order_items && order.order_items.length > 1
                  ? ` +${order.order_items.length - 1} lainnya`
                  : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="font-bold text-emerald-400">
                {formatCurrency(order.total_price)}
              </p>
              <p className="text-xs text-slate-500">Estimasi: Hari ini</p>
            </div>
            <Link href={`/admin/orders`}>
              <Button
                size="sm"
                className="bg-white/5 hover:bg-white/10 text-white border-white/10"
              >
                Proses <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

function HistoryOrdersList({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <History className="w-12 h-12 mb-3 opacity-20" />
        <p>Belum ada riwayat order.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-white/5">
      {orders.slice(0, 5).map((order) => (
        <div
          key={order.id}
          className="p-3 px-5 hover:bg-white/5 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">
              #{order.id}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-300">
                {order.customer_name}
              </p>
              <p className="text-[10px] text-slate-500 uppercase">
                {order.status}
              </p>
            </div>
          </div>
          <p className="text-sm font-medium text-slate-400">
            {formatCurrency(order.total_price)}
          </p>
        </div>
      ))}
      {orders.length > 5 && (
        <div className="p-3 text-center">
          <Link
            href="/admin/orders"
            className="text-xs text-slate-500 hover:text-cyan-400 transition-colors"
          >
            Lihat semua riwayat →
          </Link>
        </div>
      )}
    </div>
  );
}

function AlertCard({ alert }: { alert: Alert }) {
  return (
    <div
      className={`p-4 rounded-xl border flex items-start gap-3 ${
        alert.type === "critical"
          ? "bg-rose-500/10 border-rose-500/20"
          : "bg-amber-500/10 border-amber-500/20"
      }`}
    >
      <div
        className={`mt-0.5 ${
          alert.type === "critical" ? "text-rose-400" : "text-amber-400"
        }`}
      >
        {alert.type === "critical" ? (
          <AlertCircle className="w-5 h-5" />
        ) : (
          <AlertTriangle className="w-5 h-5" />
        )}
      </div>
      <div>
        <h4
          className={`font-bold text-sm ${
            alert.type === "critical" ? "text-rose-400" : "text-amber-400"
          }`}
        >
          {alert.title}
        </h4>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
          {alert.message}
        </p>
        {alert.link && (
          <Link
            href={alert.link}
            className="text-xs font-semibold underline mt-2 block opacity-80 hover:opacity-100"
          >
            Check Now
          </Link>
        )}
      </div>
    </div>
  );
}
