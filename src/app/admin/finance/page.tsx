"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Wallet,
  TrendingDown,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Plus,
  Calendar,
  PieChart,
  Lightbulb,
  Info,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/format";
import { ExpenseForm } from "@/components/admin/ExpenseForm";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { id } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  calculateGrowth,
  projectMonthEnd,
  analyzeExpenseTrends,
  generateFinancialInsights,
} from "@/utils/finance";

interface Expense {
  id: number;
  amount: number;
  category: string;
  description: string;
  expense_date: string;
  payment_method: string;
  created_at: string;
}

export default function FinancePage() {
  const [loading, setLoading] = useState(true);

  // Data State
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  // Comparison Data State (Previous Month)
  const [prevExpenses, setPrevExpenses] = useState<Expense[]>([]);
  const [prevOrders, setPrevOrders] = useState<any[]>([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().getMonth().toString()
  );
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );

  const supabase = useMemo(() => createClient(), []);

  const fetchData = useCallback(async () => {
    setLoading(true);

    // Current Month Range
    const currentDate = new Date(
      parseInt(selectedYear),
      parseInt(selectedMonth)
    );
    const startDate = startOfMonth(currentDate).toISOString();
    const endDate = endOfMonth(currentDate).toISOString();

    // Previous Month Range
    const prevDate = subMonths(currentDate, 1);
    const prevStartDate = startOfMonth(prevDate).toISOString();
    const prevEndDate = endOfMonth(prevDate).toISOString();

    const [expensesRes, ordersRes, prevExpensesRes, prevOrdersRes] =
      await Promise.all([
        // Current Month Data
        supabase
          .from("expenses")
          .select("*")
          .gte("expense_date", startDate)
          .lte("expense_date", endDate)
          .order("expense_date", { ascending: false }),
        supabase
          .from("orders")
          .select("id, total_price, status, created_at, customer_phone")
          .gte("created_at", startDate)
          .lte("created_at", endDate)
          .range(0, 4999),

        // Previous Month Comparison Data
        supabase
          .from("expenses")
          .select("amount, category")
          .gte("expense_date", prevStartDate)
          .lte("expense_date", prevEndDate),
        supabase
          .from("orders")
          .select("total_price, status")
          .gte("created_at", prevStartDate)
          .lte("created_at", prevEndDate)
          .filter("status", "in", '("paid","completed")'),
      ]);

    if (expensesRes.data) setExpenses(expensesRes.data);
    if (ordersRes.data) setOrders(ordersRes.data);
    if (prevExpensesRes.data) setPrevExpenses(prevExpensesRes.data as any);
    if (prevOrdersRes.data) setPrevOrders(prevOrdersRes.data);

    setLoading(false);
  }, [supabase, selectedMonth, selectedYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = useCallback(
    async (id: number) => {
      if (confirm("Yakin ingin menghapus pengeluaran ini?")) {
        await supabase.from("expenses").delete().eq("id", id);
        fetchData();
      }
    },
    [supabase, fetchData]
  );

  const handleEdit = useCallback((expense: Expense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  }, []);

  // Financial calculations
  const financials = useMemo(() => {
    // 1. Current Month Metrics
    const paidOrders = orders.filter(
      (o) => o.status === "paid" || o.status === "completed"
    );
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total_price, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const pendingOrders = orders.filter(
      (o) =>
        o.status !== "paid" &&
        o.status !== "completed" &&
        o.status !== "cancelled" // Fix: Exclude cancelled orders from Piutang
    );
    const totalPiutang = pendingOrders.reduce(
      (sum, o) => sum + o.total_price,
      0
    );
    const grossProfit = totalRevenue - totalExpenses;
    const profitMargin =
      totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    // 2. Previous Month Metrics (for Comparison)
    const prevRevenue = prevOrders.reduce((sum, o) => sum + o.total_price, 0);
    const prevTotalExpenses = prevExpenses.reduce(
      (sum, e) => sum + e.amount,
      0
    );
    const prevProfit = prevRevenue - prevTotalExpenses;

    // 3. Growth Calculations
    const revenueGrowth = calculateGrowth(totalRevenue, prevRevenue);
    const expenseGrowth = calculateGrowth(totalExpenses, prevTotalExpenses);
    const profitGrowth = calculateGrowth(grossProfit, prevProfit);

    // 4. Projections (If current month)
    const projectedRevenue = projectMonthEnd(
      totalRevenue,
      parseInt(selectedMonth),
      parseInt(selectedYear)
    );
    const projectedExpenses = projectMonthEnd(
      totalExpenses,
      parseInt(selectedMonth),
      parseInt(selectedYear)
    );

    // 5. Expense Analysis
    const expensesByCategory = expenses.reduce((acc, expense) => {
      const category = expense.category || "Lainnya";
      acc[category] = (acc[category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const expenseTrends = analyzeExpenseTrends(expenses, prevExpenses);

    // 6. Generate Insights
    const smartInsights = generateFinancialInsights(
      {
        revenue: totalRevenue,
        expenses: totalExpenses,
        profit: grossProfit,
        margin: profitMargin,
      },
      { revenue: prevRevenue, expenses: prevTotalExpenses },
      expenseTrends
    );

    // Cash flow
    const netCashFlow = totalRevenue - totalExpenses;

    // Piutang aging
    const now = new Date();
    const piutangAging = {
      "0-7": 0,
      "8-14": 0,
      "15-30": 0,
      ">30": 0,
    };

    pendingOrders.forEach((order) => {
      const daysSince = Math.floor(
        (now.getTime() - new Date(order.created_at).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      if (daysSince <= 7) piutangAging["0-7"] += order.total_price;
      else if (daysSince <= 14) piutangAging["8-14"] += order.total_price;
      else if (daysSince <= 30) piutangAging["15-30"] += order.total_price;
      else piutangAging[">30"] += order.total_price;
    });

    return {
      totalRevenue,
      totalExpenses,
      grossProfit,
      profitMargin,
      totalPiutang,
      netCashFlow,
      expensesByCategory,
      piutangAging,
      pendingOrdersCount: pendingOrders.length,
      comparisons: {
        revenueGrowth,
        expenseGrowth,
        profitGrowth,
      },
      projections: {
        revenue: projectedRevenue,
        expenses: projectedExpenses,
      },
      expenseTrends,
      smartInsights,
    };
  }, [orders, expenses, prevOrders, prevExpenses, selectedMonth, selectedYear]);

  if (loading) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Wallet className="text-cyan-400 w-8 h-8" />
            <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Smart Economics
            </span>
          </h2>
          <p className="text-slate-400 mt-1">
            Analisa keuangan cerdas & optimasi profitabilitas
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-full sm:w-[140px] bg-slate-900 border-white/10 text-white min-h-[44px]">
              <SelectValue placeholder="Bulan" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/10 text-white">
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i} value={i.toString()}>
                  {format(new Date(2024, i, 1), "MMMM", { locale: id })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-full sm:w-[120px] bg-slate-900 border-white/10 text-white min-h-[44px]">
              <SelectValue placeholder="Tahun" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/10 text-white">
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - 2 + i;
                return (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <Button
            onClick={() => setIsFormOpen(true)}
            className="w-full md:w-auto rounded-xl shadow-lg shadow-cyan-500/20 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 min-h-[48px] font-bold text-white transition-all hover:scale-105 hover:shadow-cyan-500/40"
          >
            <Plus className="mr-2 h-5 w-5" /> Tambah Pengeluaran
          </Button>
        </div>
      </div>

      {/* Smart Insights Banner */}
      {financials.smartInsights.length > 0 && (
        <Card className="bg-gradient-to-r from-violet-500/10 to-blue-500/10 border-violet-500/20 backdrop-blur-xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-violet-500/20 text-violet-400">
                <Lightbulb className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm uppercase tracking-wider opacity-90">
                AI Financial Insights
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {financials.smartInsights.map((insight, idx) => {
                let icon = <Info className="w-4 h-4" />;
                let colorClass =
                  "text-blue-400 bg-blue-500/10 border-blue-500/20";

                switch (insight.type) {
                  case "success":
                    icon = <CheckCircle className="w-4 h-4" />;
                    colorClass =
                      "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
                    break;
                  case "warning":
                    icon = <AlertTriangle className="w-4 h-4" />;
                    colorClass =
                      "text-amber-400 bg-amber-500/10 border-amber-500/20";
                    break;
                  case "danger":
                    icon = <TrendingDown className="w-4 h-4" />;
                    colorClass =
                      "text-rose-400 bg-rose-500/10 border-rose-500/20";
                    break;
                }

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border flex items-start gap-3 ${colorClass}`}
                  >
                    <div className="mt-0.5 shrink-0">{icon}</div>
                    <div>
                      <p className="font-bold text-sm mb-0.5">
                        {insight.title}
                      </p>
                      <p className="text-xs opacity-90 leading-relaxed">
                        {insight.message}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Financial Summary Cards with Comparisons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <FinancialCard
          title="Total Pendapatan"
          value={formatCurrency(financials.totalRevenue)}
          growth={financials.comparisons.revenueGrowth}
          subtext={`vs ${formatCurrency(
            financials.totalRevenue /
              (1 + financials.comparisons.revenueGrowth / 100)
          )} last month`}
          icon={TrendingUp}
          color="emerald"
        />
        <FinancialCard
          title="Total Pengeluaran"
          value={formatCurrency(financials.totalExpenses)}
          growth={financials.comparisons.expenseGrowth}
          inverseGrowth // Growth is bad for expenses
          subtext="Total spending"
          icon={TrendingDown}
          color="rose"
        />
        <FinancialCard
          title="Gross Profit"
          value={formatCurrency(financials.grossProfit)}
          growth={financials.comparisons.profitGrowth}
          subtext={`Margin: ${financials.profitMargin.toFixed(1)}%`}
          icon={DollarSign}
          color={financials.grossProfit >= 0 ? "violet" : "rose"}
        />
        <FinancialCard
          title="Piutang"
          value={formatCurrency(financials.totalPiutang)}
          subtext={`${financials.pendingOrdersCount} pesanan pending`}
          icon={AlertCircle}
          color="amber"
        />
      </div>

      {/* Comparisons & Projections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Flow & Trends */}
        <div className="space-y-6">
          <Card className="bg-slate-900/60 border-white/10 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <TrendingUp className="text-cyan-400 w-5 h-5" />
                Cash Flow
              </CardTitle>
              <CardDescription>Arus kas aktual bulan ini</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <span className="text-emerald-400 font-medium">Cash In</span>
                <span className="text-2xl font-bold text-emerald-400">
                  {formatCurrency(financials.totalRevenue)}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-rose-500/10 rounded-lg border border-rose-500/20">
                <span className="text-rose-400 font-medium">Cash Out</span>
                <span className="text-2xl font-bold text-rose-400">
                  {formatCurrency(financials.totalExpenses)}
                </span>
              </div>
              <div
                className={`flex justify-between items-center p-4 rounded-lg border ${
                  financials.netCashFlow >= 0
                    ? "bg-cyan-500/10 border-cyan-500/20"
                    : "bg-rose-500/10 border-rose-500/20"
                }`}
              >
                <span
                  className={`font-medium ${
                    financials.netCashFlow >= 0
                      ? "text-cyan-400"
                      : "text-rose-400"
                  }`}
                >
                  Net Cash Flow
                </span>
                <span
                  className={`text-2xl font-bold ${
                    financials.netCashFlow >= 0
                      ? "text-cyan-400"
                      : "text-rose-400"
                  }`}
                >
                  {formatCurrency(financials.netCashFlow)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Newest: Detailed Expense Trends */}
          <Card className="bg-slate-900/60 border-white/10 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <PieChart className="text-violet-400 w-5 h-5" />
                Category Trends
              </CardTitle>
              <CardDescription>Perubahan spending per kategori</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                {financials.expenseTrends.length > 0 ? (
                  financials.expenseTrends.slice(0, 5).map((trend) => (
                    <div
                      key={trend.category}
                      className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-white/5"
                    >
                      <div>
                        <p className="font-medium text-white">
                          {trend.category}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatCurrency(trend.currentAmount)}
                        </p>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        {trend.prevAmount > 0 && (
                          <div
                            className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${
                              trend.growth > 0
                                ? "bg-rose-500/10 text-rose-400"
                                : "bg-emerald-500/10 text-emerald-400"
                            }`}
                          >
                            {trend.growth > 0 ? "+" : ""}
                            {trend.growth.toFixed(1)}%
                          </div>
                        )}
                        {!trend.prevAmount && (
                          <Badge variant="outline" className="text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-500 py-4">
                    Belum ada data secukupnya
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expense List */}
        <div className="space-y-6">
          <Card className="bg-slate-900/60 border-white/10 backdrop-blur-xl h-full">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Calendar className="text-cyan-400 w-5 h-5" />
                Riwayat Pengeluaran
              </CardTitle>
              <CardDescription>
                Semua transaksi pengeluaran bulan ini
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-950/50 text-slate-400 font-medium">
                      <tr>
                        <th className="px-4 py-3 text-left">Tanggal</th>
                        <th className="px-4 py-3 text-left">Kategori</th>
                        <th className="px-4 py-3 text-right">Jumlah</th>
                        <th className="px-4 py-3 text-right w-[80px]">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {expenses.length > 0 ? (
                        expenses.map((expense) => (
                          <tr
                            key={expense.id}
                            className="hover:bg-white/5 transition-colors"
                          >
                            <td className="px-4 py-3 text-slate-400">
                              {format(new Date(expense.expense_date), "dd/MM", {
                                locale: id,
                              })}
                            </td>
                            <td className="px-4 py-3">
                              <Badge
                                variant="outline"
                                className="bg-white/5 text-slate-300 border-white/10"
                              >
                                {expense.category}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-rose-400">
                              {formatCurrency(expense.amount)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-cyan-400 hover:text-cyan-300"
                                  onClick={() => handleEdit(expense)}
                                >
                                  <div className="w-3 h-3 border-2 border-current rounded-sm" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-rose-400 hover:text-rose-300"
                                  onClick={() => handleDelete(expense.id)}
                                >
                                  <div className="w-3 h-3 text-lg leading-none -mt-1">
                                    ×
                                  </div>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-12 text-center text-slate-500"
                          >
                            Belum ada pengeluaran bulan ini
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ExpenseForm
        open={isFormOpen}
        onOpenChange={(open: boolean) => {
          setIsFormOpen(open);
          if (!open) setEditingExpense(undefined);
        }}
        onSuccess={fetchData}
        initialData={editingExpense}
      />
    </div>
  );
}

// Financial Card Component with Growth Indicator
function FinancialCard({
  title,
  value,
  subtext,
  icon: Icon,
  color,
  growth,
  inverseGrowth = false,
}: any) {
  const colorClasses: any = {
    emerald:
      "from-emerald-500 to-teal-500 text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    rose: "from-rose-500 to-orange-500 text-rose-500 bg-rose-500/10 border-rose-500/20",
    violet:
      "from-violet-500 to-fuchsia-500 text-violet-500 bg-violet-500/10 border-violet-500/20",
    amber:
      "from-amber-500 to-orange-500 text-amber-500 bg-amber-500/10 border-amber-500/20",
  };

  const activeColor = colorClasses[color] || colorClasses.emerald;

  // Growth Logic
  const hasGrowth = growth !== undefined && !isNaN(growth);
  const isPositiveGrowth = growth > 0;
  const isGoodGrowth = inverseGrowth ? !isPositiveGrowth : isPositiveGrowth;

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
          {hasGrowth && (
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                isGoodGrowth
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-rose-500/10 text-rose-400"
              }`}
            >
              {isPositiveGrowth ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {Math.abs(growth).toFixed(1)}%
            </div>
          )}
        </div>
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
            {value}
          </h3>
          <p className="text-slate-500 text-xs mt-1 truncate max-w-full">
            {subtext}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
