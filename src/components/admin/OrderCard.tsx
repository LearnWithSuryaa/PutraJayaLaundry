import { Order } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, FileText, Trash2, Printer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface OrderCardProps {
  order: Order;
  updateStatus: (id: number, status: string) => void;
  sendWhatsApp: (order: Order, type: "nota" | "status") => void;
  deleteOrder: (id: number) => void;
}

export function OrderCard({
  order,
  updateStatus,
  sendWhatsApp,
  deleteOrder,
}: OrderCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "processing":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "completed":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "paid":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);

  return (
    <Card className="border border-white/10 bg-slate-900/40 backdrop-blur-md overflow-hidden">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-slate-500">
                #{order.id}
              </span>
              <Badge className={`text-xs ${getStatusColor(order.status)}`}>
                {order.status}
              </Badge>
            </div>
            <h3 className="font-bold text-white">{order.customer_name}</h3>
            <p className="text-sm text-slate-400 font-mono">
              {order.customer_phone}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-emerald-400">
              {formatPrice(order.total_price)}
            </p>
          </div>
        </div>

        {/* Order Items */}
        <div className="space-y-1.5 py-3 border-y border-white/5">
          {order.order_items && order.order_items.length > 0 ? (
            order.order_items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/50"></span>
                  <span className="text-slate-300">{item.service_name}</span>
                </div>
                <span className="text-slate-500 text-xs">
                  {item.quantity} {item.unit}
                </span>
              </div>
            ))
          ) : (
            <span className="text-xs text-slate-600 italic">No items</span>
          )}
          {order.notes && (
            <div className="mt-2 pt-2 border-t border-white/5">
              <span className="text-xs text-amber-400/80 italic">
                Catatan: "{order.notes}"
              </span>
            </div>
          )}
        </div>

        {/* Status Update */}
        <div className="space-y-2">
          <label className="text-xs text-slate-400 font-medium">
            Update Status
          </label>
          <Select
            value={order.status}
            onValueChange={(val) => updateStatus(order.id, val)}
          >
            <SelectTrigger className="w-full bg-slate-900 border-white/10 text-white min-h-[44px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/10 text-white">
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-4 gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-full rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
            onClick={() => sendWhatsApp(order, "nota")}
            title="Kirim Nota"
          >
            <FileText className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-full rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
            onClick={() => sendWhatsApp(order, "status")}
            title="Update Status"
          >
            <Send className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-11 w-full rounded-lg ${
              order.status === "paid"
                ? "bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"
                : "bg-slate-800/50 text-slate-600 cursor-not-allowed opacity-50"
            }`}
            onClick={() => {
              if (order.status !== "paid") {
                alert("Struk hanya dapat dicetak jika status sudah 'Paid'.");
                return;
              }
              window.open(
                `/admin/orders/${order.id}/print`,
                "PrintReceipt",
                "width=400,height=600"
              );
            }}
            title="Cetak Struk"
          >
            <Printer className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-full rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
            onClick={() => deleteOrder(order.id)}
            title="Hapus"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
