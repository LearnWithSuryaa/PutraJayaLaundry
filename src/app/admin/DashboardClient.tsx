"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Order } from "@/types";

interface DashboardStats {
  totalRevenue: number;
  newOrders: number;
  activeCustomers: number;
  topService: string;
}

interface DashboardClientProps {
  initialStats: DashboardStats;
  initialOrders: Order[];
}

export function DashboardClient({
  initialStats,
  initialOrders,
}: DashboardClientProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-400 mt-1">
            Overview performa laundry Anda hari ini.
          </p>
        </div>
        <Link href="/admin/orders">
          <Button className="bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-500/20 rounded-full px-6 py-6 font-semibold transition-all hover:scale-105">
            <Plus className="w-5 h-5 mr-2" />
            Buat Order Baru
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Pendapatan Hari Ini"
          value={new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
          }).format(initialStats.totalRevenue)}
          desc="Total pendapatan hari ini"
          icon={DollarSign}
          color="text-emerald-400"
          bg="bg-emerald-500/10"
        />
        <StatsCard
          title="Order Pending"
          value={initialStats.newOrders.toString()}
          desc="Perlu diproses segera"
          icon={ShoppingBag}
          color="text-blue-400"
          bg="bg-blue-500/10"
        />
        <StatsCard
          title="Pelanggan Hari Ini"
          value={initialStats.activeCustomers.toString()}
          desc="Pelanggan unik hari ini"
          icon={Users}
          color="text-violet-400"
          bg="bg-violet-500/10"
        />
        <StatsCard
          title="Layanan Terlaris"
          value={initialStats.topService}
          desc="Paling sering dipesan hari ini"
          icon={TrendingUp}
          color="text-orange-400"
          bg="bg-orange-500/10"
        />
      </div>

      {/* Recent Orders */}
      <Card className="border border-white/10 bg-slate-900/40 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl">
        <CardHeader className="border-b border-white/5 p-6 flex flex-row items-center justify-between">
          <CardTitle className="text-white text-lg font-semibold">
            Order Hari Ini
          </CardTitle>
          <Link href="/admin/orders">
            <Button
              variant="ghost"
              size="sm"
              className="text-cyan-400 hover:text-cyan-300 hover:bg-white/5"
            >
              Lihat Semua <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {initialOrders.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              Belum ada transaksi saat ini.
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {initialOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        order.status === "pending"
                          ? "bg-yellow-500/10 text-yellow-500"
                          : order.status === "processing"
                          ? "bg-blue-500/10 text-blue-500"
                          : order.status === "completed"
                          ? "bg-green-500/10 text-green-500"
                          : "bg-purple-500/10 text-purple-500"
                      }`}
                    >
                      #{order.id}
                    </div>
                    <div>
                      <p className="font-medium text-slate-200">
                        {order.customer_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        Top Item:{" "}
                        {order.order_items?.[0]?.service_name || "Layanan..."}
                        {order.order_items && order.order_items.length > 1
                          ? ` +${order.order_items.length - 1} lainnya`
                          : ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-400 text-sm">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        maximumFractionDigits: 0,
                      }).format(order.total_price)}
                    </p>
                    <span className="text-xs text-slate-500 capitalize">
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatsCard({
  title,
  value,
  desc,
  icon: Icon,
  color,
  bg,
}: {
  title: string;
  value: string;
  desc: string;
  icon: any;
  color: string;
  bg: string;
}) {
  return (
    <Card className="border border-white/10 bg-slate-900/40 backdrop-blur-md hover:border-white/20 transition-all rounded-2xl overflow-hidden group hover:shadow-lg hover:shadow-cyan-500/5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-400">
          {title}
        </CardTitle>
        <div
          className={`p-2.5 rounded-xl ${bg} ${color} group-hover:scale-110 transition-transform duration-300 shadow-inner`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white mb-1 tracking-tight">
          {value}
        </div>
        <p className="text-xs text-slate-500 font-medium">{desc}</p>
      </CardContent>
    </Card>
  );
}
