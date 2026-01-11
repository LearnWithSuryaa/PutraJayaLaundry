"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Shirt,
  LogOut,
  PackageCheck,
  TrendingUp,
  Menu,
  X,
  BarChart3,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const menuItems = [
  {
    title: "Overview",
    href: "/admin",
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
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Keuangan",
    href: "/admin/finance",
    icon: Wallet,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Header with Hamburger */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-16 px-4 bg-slate-950/95 backdrop-blur-xl border-b border-white/10">
        <span className="text-lg font-bold text-white tracking-tight">
          Rynse<span className="text-cyan-400">Admin</span>
        </span>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Slide-out Menu */}
      <aside
        className={cn(
          "md:hidden fixed top-0 left-0 bottom-0 w-72 z-50 bg-slate-950 border-r border-white/10 transform transition-transform duration-300 ease-in-out flex flex-col",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center px-6 border-b border-white/10">
          <span className="text-xl font-bold text-white tracking-tight">
            Rynse<span className="text-cyan-400">Admin</span>
          </span>
        </div>

        <nav className="flex-1 overflow-auto py-6">
          <ul className="grid gap-2 px-4 text-sm font-medium">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
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

      {/* Desktop Sidebar (unchanged) */}
      <aside className="hidden md:flex w-72 flex-col border-r border-white/10 bg-slate-950/50 backdrop-blur-xl sticky top-0 h-screen">
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

      {/* Bottom Navigation for Mobile (Alternative) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-950/95 backdrop-blur-xl border-t border-white/10">
        <div className="flex items-center justify-around h-16 px-2">
          {menuItems.slice(0, 7).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[60px]",
                  isActive
                    ? "text-cyan-400 bg-cyan-500/10"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.title}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
