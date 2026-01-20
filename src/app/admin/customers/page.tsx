"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Search,
  MessageCircle,
  ShoppingBag,
  DollarSign,
  Calendar,
  Loader2,
  ArrowUpDown,
} from "lucide-react";
import { formatCurrency } from "@/utils/format";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface Customer {
  id: string; // Phone number as ID for now
  name: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  status: "active" | "inactive" | "new";
}

export default function CustomersPage() {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Customer;
    direction: "asc" | "desc";
  }>({ key: "lastOrderDate", direction: "desc" });

  const supabase = createClient();

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);

      // Fetch all orders
      const { data: orders, error } = await supabase
        .from("orders")
        .select("id, customer_name, customer_phone, total_price, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error);
        setLoading(false);
        return;
      }

      // Aggregate by phone number
      const customerMap = new Map<string, Customer>();

      orders?.forEach((order) => {
        const phone = order.customer_phone || "Unknown";
        const name = order.customer_name || "Guest";

        // Skip if no phone (shouldn't happen ideally but just in case)
        if (!phone || phone === "Unknown") return;

        if (customerMap.has(phone)) {
          const existing = customerMap.get(phone)!;
          customerMap.set(phone, {
            ...existing,
            totalOrders: existing.totalOrders + 1,
            totalSpent: existing.totalSpent + order.total_price,
            // Keep the latest date since we iterate descending?
            // Wait, logic: if we iterate descending, the first one found is the latest.
            // But let's be safe.
            lastOrderDate:
              new Date(order.created_at) > new Date(existing.lastOrderDate)
                ? order.created_at
                : existing.lastOrderDate,
            // Update name if it looks "better" (longer)? For complete simplicity, keep first found (latest)
          });
        } else {
          customerMap.set(phone, {
            id: phone,
            name: name,
            phone: phone,
            totalOrders: 1,
            totalSpent: order.total_price,
            lastOrderDate: order.created_at,
            status: "new", // will calculate below
          });
        }
      });

      // Process status and convert to array
      const processedCustomers = Array.from(customerMap.values()).map((c) => {
        const daysSinceLastOrder = Math.floor(
          (new Date().getTime() - new Date(c.lastOrderDate).getTime()) /
            (1000 * 60 * 60 * 24)
        );

        let status: Customer["status"] = "active";
        if (daysSinceLastOrder > 60) status = "inactive";
        else if (c.totalOrders === 1 && daysSinceLastOrder < 30) status = "new";

        return { ...c, status };
      });

      setCustomers(processedCustomers);
      setLoading(false);
    };

    fetchCustomers();
  }, [supabase]);

  const handleSort = (key: keyof Customer) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "desc" ? "asc" : "desc",
    }));
  };

  const filteredCustomers = useMemo(() => {
    let result = [...customers];

    // Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [customers, searchQuery, sortConfig]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Users className="text-cyan-400 w-8 h-8" />
            <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Customers
            </span>
          </h2>
          <p className="text-slate-400 mt-1">
            Daftar pelanggan setia laundry Anda.
          </p>
        </div>
        <div className="w-full md:w-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Cari nama atau no. HP..."
            className="pl-9 bg-slate-900/50 border-white/10 w-full md:w-[300px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card className="bg-slate-900/60 border-white/10 backdrop-blur-xl">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              Belum ada data pelanggan.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-950/50">
                  <TableRow className="hover:bg-transparent border-white/5">
                    <TableHead
                      onClick={() => handleSort("name")}
                      className="cursor-pointer text-slate-400"
                    >
                      <div className="flex items-center gap-2">
                        Nama <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead className="text-slate-400">No. HP</TableHead>
                    <TableHead
                      onClick={() => handleSort("totalOrders")}
                      className="cursor-pointer text-slate-400 text-right"
                    >
                      <div className="flex items-center justify-end gap-2">
                        Total Order <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort("totalSpent")}
                      className="cursor-pointer text-slate-400 text-right"
                    >
                      <div className="flex items-center justify-end gap-2">
                        Total Belanja <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort("lastOrderDate")}
                      className="cursor-pointer text-slate-400"
                    >
                      <div className="flex items-center gap-2">
                        Terakhir Order <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-right text-slate-400">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow
                      key={customer.id}
                      className="border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <TableCell className="font-medium text-slate-200">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-bold text-xs">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          {customer.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-400">
                        {customer.phone}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-medium border border-white/5">
                          <ShoppingBag className="w-3 h-3" />
                          {customer.totalOrders}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium text-emerald-400">
                        {formatCurrency(customer.totalSpent)}
                      </TableCell>
                      <TableCell className="text-slate-400 text-sm">
                        {format(
                          new Date(customer.lastOrderDate),
                          "dd MMM yyyy",
                          { locale: id }
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`
                                            capitalize
                                            ${
                                              customer.status === "active"
                                                ? "text-emerald-400 border-emerald-400/20 bg-emerald-400/10"
                                                : ""
                                            }
                                            ${
                                              customer.status === "new"
                                                ? "text-blue-400 border-blue-400/20 bg-blue-400/10"
                                                : ""
                                            }
                                            ${
                                              customer.status === "inactive"
                                                ? "text-slate-500 border-slate-500/20 bg-slate-500/10"
                                                : ""
                                            }
                                        `}
                        >
                          {customer.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <a
                          href={`https://wa.me/${customer.phone
                            .replace(/^0/, "62")
                            .replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        </a>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
