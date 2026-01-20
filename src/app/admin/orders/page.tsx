"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Order } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrderForm } from "@/components/admin/OrderForm";
import { OrderCard } from "@/components/admin/OrderCard";
import {
  Send,
  FileText,
  Plus,
  Loader2,
  Trash2,
  Printer,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { calculateRoundedPrice } from "@/utils/pricing";

const ITEMS_PER_PAGE = 20;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const supabase = useMemo(() => createClient(), []);

  const fetchOrders = useCallback(
    async (currentPage: number) => {
      setIsLoading(true);
      const { data, count } = await supabase
        .from("orders")
        .select("*, order_items(*)", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(
          currentPage * ITEMS_PER_PAGE,
          (currentPage + 1) * ITEMS_PER_PAGE - 1
        );
      if (data) setOrders(data);
      if (count !== null) setTotalCount(count);
      setIsLoading(false);
    },
    [supabase]
  );

  useEffect(() => {
    fetchOrders(page);
  }, [page, fetchOrders]);

  const updateStatus = useCallback(
    async (id: number, newStatus: string) => {
      // Optimistic update
      setOrders((prevOrders) =>
        prevOrders.map((o) =>
          o.id === id ? { ...o, status: newStatus as any } : o
        )
      );

      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) {
        console.error("Failed to update status", error);
        alert("Gagal mengupdate status"); // Simple alert for v1
        fetchOrders(page); // Revert on failure
      }
    },
    [supabase, fetchOrders]
  );

  // WhatsApp Logic (Direct Link)
  const deleteOrder = useCallback(
    async (id: number) => {
      if (!confirm("Apakah Anda yakin ingin menghapus order ini?")) return;

      try {
        const { count, error } = await supabase
          .from("orders")
          .delete({ count: "exact" })
          .eq("id", id);

        if (error) throw error;

        if (count === 0) {
          alert("Gagal menghapus: Item tidak ditemukan atau izin ditolak.");
          return; // Do not update state if nothing deleted
        }

        setOrders((prevOrders) => prevOrders.filter((o) => o.id !== id));
      } catch (error) {
        console.error("Error deleting order:", error);
        alert("Gagal menghapus order");
      }
    },
    [supabase]
  );

  const sendWhatsApp = useCallback((order: Order, type: "nota" | "status") => {
    let message = "";
    const phone = order.customer_phone.startsWith("0")
      ? "62" + order.customer_phone.slice(1)
      : order.customer_phone;

    // Helper for currency
    const formatPrice = (price: number) =>
      new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(price);

    if (type === "nota") {
      // 1. NOTA FRIENDLY FORMAT
      const date = new Date(order.created_at).toLocaleDateString("id-ID", {
        day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
      });

      const itemsList =
        order.order_items && order.order_items.length > 0
          ? order.order_items
            .map((i, idx) => {
              const rawTotal = Number(i.service_price || 0) * Number(i.quantity);
              const roundedTotal = calculateRoundedPrice(Number(i.service_price), Number(i.quantity));

              return `${idx + 1}. ${i.service_name || i.name}\n   ${i.quantity} ${i.unit} x ${formatPrice(Number(i.service_price))}\n   (Hitungan: ${formatPrice(rawTotal)} menjadi *${formatPrice(roundedTotal)}*)`;
            })
            .join("\n\n")
          : "- Item tidak tersedia";

      message = `Halo Kak *${order.customer_name}*,\nTerima kasih sudah laundry di PutraJaya Laundry. Berikut rincian pesanan kakak ya:\n\nNo. Nota: #${order.id}\nWaktu: ${date}\n\n*Rincian Laundry:*\n${itemsList}\n\n*Total Tagihan: ${formatPrice(order.total_price)}*\nStatus: ${order.status.toUpperCase()}\n\n_Catatan: ${order.notes || "-"}_ \n\nTerima kasih, ditunggu order berikutnya ya Kak!`;
    } else {
      // 2. STATUS UPDATE TEMPLATE
      const statusMap: Record<string, string> = {
        pending: "Menunggu Konfirmasi ",
        processing: "Sedang Diproses",
        completed: "Selesai & Siap Diambil",
        paid: "Lunas & Selesai",
      };

      const statusMessageMap: Record<string, string> = {
        pending: "Mohon tunggu sebentar, admin kami akan segera memproses.",
        processing: "Pakaian Anda sedang kami kerjakan dengan hati-hati.",
        completed:
          "Hore! Pakaian Anda sudah bersih dan wangi. Silakan diambil di outlet ya.",
        paid: "Terima kasih banyak! Ditunggu laundry berikutnya ya kak.",
      };

      const translatedStatus =
        statusMap[order.status] || order.status.toUpperCase();
      const specificMessage = statusMessageMap[order.status] || "";

      message = `* Halo Kak ${order.customer_name} !*\n\n * Update Status Pesanan #${order.id}*\nStatus saat ini: * ${translatedStatus}*\n\n${specificMessage} \n\nTerima kasih!`;
    }

    // Use encodeURIComponent to strictly handle #, emojis, and newlines
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  }, []);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500/10 text-yellow-500 border-yellow-200/20",
      processing: "bg-blue-500/10 text-blue-500 border-blue-200/20",
      completed: "bg-green-500/10 text-green-500 border-green-200/20",
      paid: "bg-purple-500/10 text-purple-500 border-purple-200/20",
    };
    return colors[status] || "bg-gray-500/10 text-gray-500";
  };

  return (
    <div className="space-y-6">
      {/* Header - Responsive */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground/90">
            Manajemen Order
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Pantau dan kelola pesanan laundry.
          </p>
        </div>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="w-full md:w-auto rounded-xl shadow-lg shadow-cyan-500/20 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 min-h-[48px] font-bold text-white transition-all hover:scale-105 hover:shadow-cyan-500/40"
        >
          <Plus className="mr-2 h-5 w-5" /> Order Baru
        </Button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-md overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="hover:bg-transparent border-b border-white/10">
              <TableHead className="w-[80px] text-slate-300">ID</TableHead>
              <TableHead className="text-slate-300">Pelanggan</TableHead>
              <TableHead className="text-slate-300">Detail Order</TableHead>
              <TableHead className="text-slate-300">Total & Status</TableHead>
              <TableHead className="text-right text-slate-300">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center border-white/5"
                >
                  <div className="flex justify-center items-center gap-2 text-slate-400">
                    <Loader2 className="animate-spin h-5 w-5" /> Memuat data...
                  </div>
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center h-48 text-slate-500 border-white/5"
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-4xl opacity-20">📦</span>
                    <p>Belum ada order masuk.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow
                  key={order.id}
                  className="hover:bg-white/5 transition-colors border-b border-white/5 group"
                >
                  <TableCell className="font-mono text-slate-500">
                    #{order.id}
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-white">
                      {order.customer_name}
                    </div>
                    <div className="text-sm text-slate-500 font-mono flex items-center gap-1">
                      {order.customer_phone}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {order.order_items && order.order_items.length > 0 ? (
                        order.order_items.map((item, idx) => (
                          <div
                            key={idx}
                            className="text-sm text-slate-300 flex items-center gap-2"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/50"></span>
                            <span>{item.service_name}</span>
                            <span className="text-slate-500 text-xs">
                              x{item.quantity} {item.unit}
                            </span>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-slate-600 italic">
                          No items (Legacy)
                        </span>
                      )}

                      {/* Display Notes if available */}
                      {order.notes && (
                        <div className="mt-2 pt-2 border-t border-white/5 flex items-start gap-2">
                          <span className="text-xs text-amber-400/80 italic">
                            Catatan: "{order.notes}"
                          </span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-emerald-400 mb-2">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        maximumFractionDigits: 0,
                      }).format(order.total_price)}
                    </div>
                    <Select
                      defaultValue={order.status}
                      onValueChange={(val) => updateStatus(order.id, val)}
                    >
                      <SelectTrigger
                        className={`w-[130px] h-8 text-xs font-semibold capitalize border transition-all ${getStatusColor(
                          order.status
                        )} focus:ring-0 focus:ring-offset-0`}
                      >
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10">
                        <SelectItem
                          value="pending"
                          className="focus:bg-white/10 focus:text-white"
                        >
                          Pending
                        </SelectItem>
                        <SelectItem
                          value="processing"
                          className="focus:bg-white/10 focus:text-white"
                        >
                          Processing
                        </SelectItem>
                        <SelectItem
                          value="completed"
                          className="focus:bg-white/10 focus:text-white"
                        >
                          Completed
                        </SelectItem>
                        <SelectItem
                          value="paid"
                          className="focus:bg-white/10 focus:text-white"
                        >
                          Paid
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300"
                        onClick={() => sendWhatsApp(order, "nota")}
                        title="Kirim Nota via WA"
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300"
                        onClick={() => sendWhatsApp(order, "status")}
                        title="Update Status via WA"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 rounded-lg transition-all ${order.status === "paid"
                          ? "bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300"
                          : "bg-slate-800/50 text-slate-600 cursor-not-allowed opacity-50"
                          }`}
                        onClick={() => {
                          if (order.status !== "paid") {
                            alert(
                              "Struk hanya dapat dicetak jika status pembayaran sudah 'Paid' (Lunas)."
                            );
                            return;
                          }
                          window.open(
                            `/admin/orders/${order.id}/print`,
                            "PrintReceipt",
                            "width=400,height=600"
                          );
                        }}
                        title={
                          order.status === "paid"
                            ? "Cetak Struk Thermal"
                            : "Bayar dulu untuk mencetak"
                        }
                      >
                        <Printer className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300"
                        onClick={() => deleteOrder(order.id)}
                        title="Hapus Order"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex items-center gap-2 text-slate-400">
              <Loader2 className="animate-spin h-5 w-5" /> Memuat data...
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <div className="flex flex-col items-center gap-2">
              <span className="text-4xl opacity-20">📦</span>
              <p>Belum ada order masuk.</p>
            </div>
          </div>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              updateStatus={updateStatus}
              sendWhatsApp={sendWhatsApp}
              deleteOrder={deleteOrder}
            />
          ))
        )}
      </div>

      <OrderForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={() => fetchOrders(page)}
      />

      {/* Pagination Controls - Responsive */}
      {totalCount > ITEMS_PER_PAGE && (
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mt-6 px-2">
          <p className="text-xs md:text-sm text-slate-400 text-center md:text-left">
            Showing {page * ITEMS_PER_PAGE + 1} to{" "}
            {Math.min((page + 1) * ITEMS_PER_PAGE, totalCount)} of {totalCount}{" "}
            orders
          </p>
          <div className="flex gap-2 justify-center md:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0 || isLoading}
              className="bg-slate-900/40 border-white/10 hover:bg-white/5 text-white min-h-[44px] flex-1 md:flex-none"
            >
              <ChevronLeft className="w-4 h-4 md:mr-1" />
              <span className="hidden md:inline">Previous</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={(page + 1) * ITEMS_PER_PAGE >= totalCount || isLoading}
              className="bg-slate-900/40 border-white/10 hover:bg-white/5 text-white min-h-[44px] flex-1 md:flex-none"
            >
              <span className="hidden md:inline">Next</span>
              <ChevronRight className="w-4 h-4 md:ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
