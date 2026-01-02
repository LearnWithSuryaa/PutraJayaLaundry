"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Shirt,
  LogOut,
  PackageCheck,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const menuItems = [
  {
    title: "Overview",
    href: "/admin", // Changed to /admin if we make it the dashboard
    icon: LayoutDashboard,
  },
  {
    title: "Order Baru",
    href: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    title: "Layanan",
    href: "/admin/services",
    icon: Shirt,
  },
  {
    title: "Stok",
    href: "/admin/inventory",
    icon: PackageCheck,
  },
  {
    title: "Laporan",
    href: "/admin/reports",
    icon: TrendingUp,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 flex-col border-r border-white/10 bg-slate-950/50 backdrop-blur-xl md:flex sticky top-0 h-screen">
      <div className="flex h-20 items-center px-8 border-b border-white/10">
        <span className="text-xl font-bold text-white tracking-tight">
          Rynse<span className="text-cyan-400">Admin</span>
        </span>
      </div>

      <nav className="flex-1 overflow-auto py-8">
        <ul className="grid gap-2 px-4 text-sm font-medium">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all duration-300 group",
                    isActive
                      ? "bg-cyan-500/10 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.1)] border border-cyan-500/20"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5 transition-colors",
                      isActive
                        ? "text-cyan-400"
                        : "text-slate-500 group-hover:text-white"
                    )}
                  />
                  {item.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-6 border-t border-white/10">
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
              A
            </div>
            <div>
              <p className="text-sm font-bold text-white">Admin User</p>
              <p className="text-xs text-slate-500">Administrator</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>
    </aside>
  );
}
