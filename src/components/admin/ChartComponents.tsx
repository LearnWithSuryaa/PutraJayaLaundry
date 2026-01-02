"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

// Lazy load chart components for better bundle size
const BarChart = dynamic(() => import("recharts").then((mod) => mod.BarChart), {
  loading: () => (
    <div className="flex h-[300px] w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-cyan-500 opacity-50" />
    </div>
  ),
  ssr: false,
});

const Bar = dynamic(() => import("recharts").then((mod) => mod.Bar), {
  ssr: false,
});

const AreaChart = dynamic(
  () => import("recharts").then((mod) => mod.AreaChart),
  {
    loading: () => (
      <div className="flex h-[300px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500 opacity-50" />
      </div>
    ),
    ssr: false,
  }
);

const Area = dynamic(() => import("recharts").then((mod) => mod.Area), {
  ssr: false,
});

// Weekly Revenue Bar Chart Component
export function WeeklyRevenueChart({ data }: { data: any[] }) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#ffffff10"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `Rp ${value / 1000}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              borderColor: "#1e293b",
              color: "#fff",
            }}
            itemStyle={{ color: "#22d3ee" }}
            formatter={(value: any) => [
              `Rp ${value.toLocaleString("id-ID")}`,
              "Pendapatan",
            ]}
            cursor={{ fill: "#ffffff05" }}
          />
          <Bar
            dataKey="total"
            fill="url(#colorCyan)"
            radius={[4, 4, 0, 0]}
            barSize={40}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={index % 2 === 0 ? "#06b6d4" : "#0891b2"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Daily Revenue Area Chart Component
export function DailyRevenueChart({ data }: { data: any[] }) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#ffffff10"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            stroke="#64748b"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            minTickGap={15}
          />
          <YAxis
            stroke="#64748b"
            fontSize={10}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              borderColor: "#1e293b",
              color: "#fff",
            }}
            formatter={(value: any) => [
              `Rp ${value.toLocaleString("id-ID")}`,
              "Harian",
            ]}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#8b5cf6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorRevenue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
