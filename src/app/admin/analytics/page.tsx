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
  Loader2,
  TrendingUp,
  Users,
  Target,
  Activity,
  BarChart3,
  Clock,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Crown,
  Heart,
  AlertTriangle,
  UserX,
  UserPlus,
  Lightbulb,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatPercentage } from "@/utils/format";
import {
  segmentCustomers,
  forecastRevenue,
  calculateAOV,
  calculatePeakHours,
  analyzeServices,
  CustomerData,
} from "@/utils/analytics";

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [customers, setCustomers] = useState<CustomerData[]>([]);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // 1. Fetch orders
      const { data: ordersData } = await supabase
        .from("orders")
        .select("id, customer_phone, total_price, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5000);

      if (ordersData && ordersData.length > 0) {
        setOrders(ordersData);
        console.log("Analytics: Fetched orders:", ordersData.length);

        // 2. Fetch order items for service analytics (avoiding nested query limit)
        const orderIds = ordersData.map((o) => o.id);
        const { data: itemsData, error: itemsError } = await supabase
          .from("order_items")
          .select("*") // Use snapshot data only, removing potentially broken relation
          .in("order_id", orderIds);

        if (itemsError) {
          console.error("Analytics: Error fetching items:", itemsError);
        }

        if (itemsData) {
          console.log("Analytics: Fetched items:", itemsData.length);
          setOrderItems(itemsData);
        } else {
          console.log("Analytics: No items fetched or error occurred");
        }

        // 3. Process customer data
        const customerMap = new Map<string, CustomerData>();

        ordersData.forEach((order) => {
          const phone = order.customer_phone;
          if (!phone) return;

          if (customerMap.has(phone)) {
            const existing = customerMap.get(phone)!;
            customerMap.set(phone, {
              ...existing,
              totalOrders: existing.totalOrders + 1,
              totalRevenue: existing.totalRevenue + order.total_price,
              lastOrderDate:
                new Date(order.created_at) > existing.lastOrderDate
                  ? new Date(order.created_at)
                  : existing.lastOrderDate,
              avgOrderValue:
                (existing.totalRevenue + order.total_price) /
                (existing.totalOrders + 1),
            });
          } else {
            customerMap.set(phone, {
              id: phone,
              phone,
              totalOrders: 1,
              totalRevenue: order.total_price,
              firstOrderDate: new Date(order.created_at),
              lastOrderDate: new Date(order.created_at),
              avgOrderValue: order.total_price,
            });
          }
        });

        setCustomers(Array.from(customerMap.values()));
      }

      setLoading(false);
    };

    fetchData();
  }, [supabase]);

  // Analytics calculations
  const analytics = useMemo(() => {
    if (orders.length === 0) {
      return null;
    }

    // Customer Segmentation (RFM)
    let segments: any[] = [];
    let segmentCounts = {
      Champions: 0,
      Loyal: 0,
      Active: 0,
      "At Risk": 0,
      Lost: 0,
      New: 0,
    };
    let topCustomers: any[] = [];

    if (customers.length > 0) {
      segments = segmentCustomers(customers);
      segmentCounts = {
        Champions: segments.filter((s) => s.segment === "Champions").length,
        Loyal: segments.filter((s) => s.segment === "Loyal").length,
        Active: segments.filter((s) => s.segment === "Active").length,
        "At Risk": segments.filter((s) => s.segment === "At Risk").length,
        Lost: segments.filter((s) => s.segment === "Lost").length,
        New: segments.filter((s) => s.segment === "New").length,
      };

      topCustomers = [...segments]
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 10);
    }

    // Revenue Forecasting
    const now = new Date();
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const monthOrders = orders.filter((o) => {
        const orderDate = new Date(o.created_at);
        return (
          orderDate.getMonth() === date.getMonth() &&
          orderDate.getFullYear() === date.getFullYear() &&
          (o.status === "paid" || o.status === "completed")
        );
      });
      const revenue = monthOrders.reduce((sum, o) => sum + o.total_price, 0);
      return { date, revenue };
    });

    const forecast = forecastRevenue(last6Months);

    // Peak Hours
    const peakHours = calculatePeakHours(orders);

    // Service Analytics
    const serviceAnalytics = analyzeServices(orderItems);

    // Average Order Value
    const paidOrders = orders.filter(
      (o) => o.status === "paid" || o.status === "completed"
    );
    const aov = calculateAOV(paidOrders);

    // Customer Retention
    const thisMonth = new Date();
    const lastMonth = new Date(
      thisMonth.getFullYear(),
      thisMonth.getMonth() - 1
    );

    const customersThisMonth = new Set(
      orders
        .filter((o) => {
          const d = new Date(o.created_at);
          return (
            d.getMonth() === thisMonth.getMonth() &&
            d.getFullYear() === thisMonth.getFullYear()
          );
        })
        .map((o) => o.customer_phone)
        .filter(Boolean)
    );

    const customersLastMonth = new Set(
      orders
        .filter((o) => {
          const d = new Date(o.created_at);
          return (
            d.getMonth() === lastMonth.getMonth() &&
            d.getFullYear() === lastMonth.getFullYear()
          );
        })
        .map((o) => o.customer_phone)
        .filter(Boolean)
    );

    const retainedCustomers = Array.from(customersLastMonth).filter((phone) =>
      customersThisMonth.has(phone)
    ).length;

    const retentionRate =
      customersLastMonth.size > 0
        ? (retainedCustomers / customersLastMonth.size) * 100
        : 0;

    return {
      segmentCounts,
      topCustomers,
      forecast,
      peakHours,
      serviceAnalytics,
      aov,
      retentionRate,
      totalCustomers: customers.length,
      activeCustomers:
        segmentCounts.Champions + segmentCounts.Loyal + segmentCounts.Active,
    };
  }, [customers, orders, orderItems]);

  if (loading) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex flex-col h-96 w-full items-center justify-center text-slate-500 gap-4">
        <BarChart3 className="w-16 h-16 opacity-20" />
        <div className="text-center">
          <p className="text-lg font-medium">Belum ada data untuk dianalisis</p>
          <p className="text-sm mt-2">
            Mulai dengan membuat order pertama Anda
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <BarChart3 className="text-cyan-400 w-8 h-8" />
          <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            RFM Analytics Dashboard
          </span>
        </h2>
        <p className="text-slate-400 mt-1">
          Maximized insights dengan algoritma Recency-Frequency-Monetary
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Pelanggan"
          value={analytics.totalCustomers.toString()}
          subtext={`${analytics.activeCustomers} aktif`}
          icon={Users}
          color="cyan"
        />
        <MetricCard
          title="Retention Rate"
          value={formatPercentage(analytics.retentionRate, false)}
          subtext="Bulan ini"
          icon={Target}
          color="emerald"
        />
        <MetricCard
          title="Avg Order Value"
          value={formatCurrency(analytics.aov)}
          subtext="Per transaksi"
          icon={Activity}
          color="violet"
        />
        <MetricCard
          title="Forecast Bulan Depan"
          value={formatCurrency(analytics.forecast.nextMonthForecast)}
          subtext={`Growth: ${formatPercentage(
            analytics.forecast.growthRate,
            true
          )}`}
          icon={TrendingUp}
          color="indigo"
          trend={analytics.forecast.trend}
        />
      </div>

      {/* RFM Segmentation */}
      <Card className="bg-slate-900/60 border-white/10 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Users className="text-cyan-400 w-5 h-5" />
            RFM Customer Segmentation
          </CardTitle>
          <CardDescription>
            Pengelompokan pelanggan berdasarkan Recency, Frequency, dan Monetary
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            <SegmentCard
              label="Champions"
              count={analytics.segmentCounts.Champions}
              color="violet"
              icon={Crown}
              description="Best customers"
            />
            <SegmentCard
              label="Loyal"
              count={analytics.segmentCounts.Loyal}
              color="emerald"
              icon={Heart}
              description="High spending"
            />
            <SegmentCard
              label="Active"
              count={analytics.segmentCounts.Active}
              color="blue"
              icon={Activity}
              description="Recent orders"
            />
            <SegmentCard
              label="New"
              count={analytics.segmentCounts.New}
              color="cyan"
              icon={UserPlus}
              description="Recent joiners"
            />
            <SegmentCard
              label="At Risk"
              count={analytics.segmentCounts["At Risk"]}
              color="amber"
              icon={AlertTriangle}
              description="Need attention"
            />
            <SegmentCard
              label="Lost"
              count={analytics.segmentCounts.Lost}
              color="rose"
              icon={UserX}
              description="Inactive > 60d"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Customers */}
        <Card className="bg-slate-900/60 border-white/10 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Star className="text-amber-400 w-5 h-5" />
              Top 10 Pelanggan
            </CardTitle>
            <CardDescription>Berdasarkan total revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
              {analytics.topCustomers.length > 0 ? (
                analytics.topCustomers.map((customer: any, index: number) => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-white/5 hover:border-cyan-500/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-500/10 text-cyan-400 font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {customer.phone}
                        </p>
                        <p className="text-xs text-slate-400">
                          {customer.totalOrders} pesanan • RFM:{" "}
                          {customer.rfmScore.r}
                          {customer.rfmScore.f}
                          {customer.rfmScore.m}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-400">
                        {formatCurrency(customer.totalRevenue)}
                      </p>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          customer.segment === "Champions"
                            ? "bg-violet-500/10 text-violet-400 border-violet-500/20"
                            : customer.segment === "Loyal"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : customer.segment === "Active"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            : customer.segment === "New"
                            ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                            : customer.segment === "At Risk"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}
                      >
                        {customer.segment}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-500 py-8">
                  Belum ada data pelanggan
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Service Performance Analysis */}
        <Card className="bg-slate-900/60 border-white/10 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Activity className="text-violet-400 w-5 h-5" />
              Performa Layanan
            </CardTitle>
            <CardDescription>Revenue berdasarkan jenis layanan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
              {analytics.serviceAnalytics.length > 0 ? (
                analytics.serviceAnalytics.slice(0, 10).map((service: any) => (
                  <div
                    key={service.serviceName}
                    className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-white/5"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-white">
                        {service.serviceName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-slate-700/50 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-full rounded-full transition-all"
                            style={{ width: `${service.percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400 min-w-[45px] text-right">
                          {formatPercentage(service.percentage, false)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold text-violet-400">
                        {formatCurrency(service.totalRevenue)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {service.totalOrders} order
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-500 py-8">
                  Belum ada data layanan
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Peak Hours */}
      {/* Peak Hours & Smart Timing */}
      <Card className="bg-slate-900/60 border-white/10 backdrop-blur-xl">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Clock className="text-indigo-400 w-5 h-5" />
                Analisa Waktu Sibuk (Peak Timing)
              </CardTitle>
              <CardDescription>
                Pola kedatangan order berdasarkan waktu
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase tracking-wider">
                Hari Tersibuk
              </p>
              <p className="text-xl font-bold text-indigo-400">
                {analytics.peakHours.peakDay}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Recommendation Banner */}
          {analytics.peakHours.recommendation && (
            <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex gap-3 items-start">
              <Lightbulb className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <p
                className="text-sm text-indigo-100/90 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: analytics.peakHours.recommendation.replace(
                    /\*\*(.*?)\*\*/g,
                    "<b>$1</b>"
                  ),
                }}
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Day Parts Breakdown */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-slate-300">
                Distribusi Waktu
              </h4>
              <div className="space-y-3">
                {analytics.peakHours.dayParts.map((part) => (
                  <div key={part.name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">{part.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-medium">
                          {part.count} Order
                        </span>
                        <Badge
                          variant="outline"
                          className="text-indigo-400 border-indigo-500/20 h-5 text-[10px]"
                        >
                          {part.percentage.toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          part.percentage > 30
                            ? "bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                            : "bg-slate-600"
                        }`}
                        style={{ width: `${part.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Detailed Hourly Graph */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-slate-300">
                Detail Per Jam (24h)
              </h4>
              <div className="flex items-end h-36 gap-1 pt-4 pb-2">
                {(() => {
                  const maxCount =
                    Math.max(
                      ...analytics.peakHours.hourlyData.map((d) => d.count)
                    ) || 1;

                  return analytics.peakHours.hourlyData.map((data) => {
                    const intensity = (data.count / maxCount) * 100;
                    const isPeak = intensity === 100 && data.count > 0;

                    return (
                      <div
                        key={data.hour}
                        className="flex-1 min-w-[3px] h-full flex flex-col justify-end items-center gap-1 group relative rounded-sm"
                      >
                        {/* Bar Container */}
                        <div className="w-full h-full flex items-end bg-slate-800/30 rounded-t-sm overflow-hidden relative">
                          {/* The Bar Itself */}
                          <div
                            className={`w-full bg-indigo-500 transition-all duration-500 rounded-t-sm ${
                              isPeak
                                ? "opacity-100 shadow-[0_0_15px_rgba(99,102,241,0.6)]"
                                : "opacity-40 group-hover:opacity-80"
                            }`}
                            style={{ height: `${Math.max(intensity, 0)}%` }}
                          />
                        </div>

                        {/* Simple x-axis every 6 hours */}
                        {data.hour % 6 === 0 ? (
                          <span className="text-[10px] text-slate-500 font-mono absolute -bottom-5">
                            {data.hour}
                          </span>
                        ) : null}

                        {/* Tooltip */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-900 border border-indigo-500/30 px-2 py-1 rounded text-[10px] text-white whitespace-nowrap z-20 shadow-lg pointer-events-none">
                          <span className="font-bold text-indigo-400">
                            {data.hour}:00
                          </span>{" "}
                          • {data.count} order
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Metric Card Component
const MetricCard = memo(function MetricCard({
  title,
  value,
  subtext,
  icon: Icon,
  color,
  trend,
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

  const TrendIcon =
    trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;

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
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                trend === "up"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : trend === "down"
                  ? "bg-rose-500/10 text-rose-400"
                  : "bg-slate-500/10 text-slate-400"
              }`}
            >
              <TrendIcon className="w-3 h-3" />
            </div>
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

// Segment Card Component
const SegmentCard = memo(function SegmentCard({
  label,
  count,
  color,
  description,
  icon: Icon,
}: any) {
  const colorClasses: any = {
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    violet: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  };

  return (
    <div
      className={`p-4 rounded-xl border ${colorClasses[color]} backdrop-blur-sm flex flex-col justify-between`}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium">{label}</p>
          {Icon && <Icon className="w-4 h-4 opacity-50" />}
        </div>
        <p className="text-3xl font-bold mb-1">{count}</p>
      </div>
      <p className="text-xs opacity-70 mt-2">{description}</p>
    </div>
  );
});
