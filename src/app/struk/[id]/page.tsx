"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Order } from "@/types";
import { calculateRoundedPrice } from "@/utils/pricing";
import { formatCurrency } from "@/utils/format";
import { Loader2, CheckCircle2, Clock, Package, Download } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DigitalReceiptPage() {
  const params = useParams();
  const id = params?.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Settings State
  const [settings, setSettings] = useState({
    storeName: "PUTRAJAYA LAUNDRY",
    storePhone: "0812-3205-2919",
  });

  const supabase = createClient();

  useEffect(() => {
    const saved = localStorage.getItem("rynse_settings");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSettings((prev) => ({
        ...prev,
        storeName: parsed.storeName || "PUTRAJAYA LAUNDRY",
        storePhone: parsed.storePhone || "0812-3205-2919",
      }));
    }
  }, []);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      // Deteksi apakah "id" di URL adalah UUID (berarti receipt_token) atau integer ID
      const isUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          id,
        );

      let res;
      if (isUUID) {
        res = await supabase.rpc("get_receipt_by_token", { p_token: id });
      } else {
        res = await supabase
          .from("orders")
          .select("*, order_items(*)")
          .eq("id", id)
          .single();
      }

      if (res.data) setOrder(res.data);
      setLoading(false);
    };

    fetchOrder();
  }, [id, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-8">
        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin mb-4" />
        <p className="text-slate-400 font-medium">Memuat Struk Digital...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-8">
        <Package className="w-16 h-16 text-slate-600 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">
          Order Tidak Ditemukan
        </h2>
        <p className="text-slate-400 text-center">
          Maaf, kami tidak dapat menemukan data pesanan untuk struk ini.
        </p>
      </div>
    );
  }

  // Calculate Subtotal (Sum of Raw Prices)
  const subtotal = (order.order_items || []).reduce((acc, item) => {
    return acc + Number(item.service_price || 0) * Number(item.quantity);
  }, 0);

  const rounding = order.total_price - subtotal;

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "pending":
        return {
          label: "Menunggu",
          color: "text-amber-500",
          bg: "bg-amber-500/10",
          icon: <Clock className="w-4 h-4 mr-1" />,
        };
      case "processing":
        return {
          label: "Diproses",
          color: "text-blue-500",
          bg: "bg-blue-500/10",
          icon: <Package className="w-4 h-4 mr-1" />,
        };
      case "completed":
        return {
          label: "Selesai",
          color: "text-emerald-500",
          bg: "bg-emerald-500/10",
          icon: <CheckCircle2 className="w-4 h-4 mr-1" />,
        };
      case "paid":
        return {
          label: "Lunas",
          color: "text-purple-500",
          bg: "bg-purple-500/10",
          icon: <CheckCircle2 className="w-4 h-4 mr-1" />,
        };
      default:
        return {
          label: status,
          color: "text-slate-400",
          bg: "bg-slate-800",
          icon: null,
        };
    }
  };

  const statusDisplay = getStatusDisplay(order.status);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 sm:p-8 flex justify-center items-start pt-10 pb-20">
      <Card className="w-full max-w-md bg-slate-900/80 border-slate-800/50 shadow-2xl backdrop-blur-xl overflow-hidden">
        <div className="h-2 w-full bg-gradient-to-r from-cyan-500 to-blue-600"></div>

        <CardHeader className="text-center pb-2 pt-6">
          <CardTitle className="text-2xl font-black tracking-tight text-white mb-1 uppercase">
            {settings.storeName}
          </CardTitle>
          <p className="text-sm text-slate-400 italic">
            E-Receipt / Struk Digital
          </p>

          <div className="mt-4 inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-slate-700/50 bg-slate-800/50">
            <span className="text-cyan-400 font-mono font-bold tracking-wider">
              #{order.id}
            </span>
          </div>
        </CardHeader>

        <CardContent className="pt-6 pb-6 space-y-6">
          {/* Order Status */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/50 border border-slate-800/50">
            <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-2">
              Status Pesanan
            </span>
            <div
              className={`flex items-center px-3 py-1.5 rounded-full ${statusDisplay.bg} ${statusDisplay.color} font-bold`}
            >
              {statusDisplay.icon}
              {statusDisplay.label}
            </div>
            {order.status === "paid" || order.status === "completed" ? (
              <p className="text-xs text-emerald-500 mt-2 font-medium">
                Terima kasih atas pesanan Anda!
              </p>
            ) : (
              <p className="text-xs text-slate-400 mt-2">
                Pesanan sedang dalam proses.
              </p>
            )}
          </div>

          {/* Customer Detail */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2 flex justify-between">
              <span>Detail Pelanggan</span>
              <span className="font-mono text-xs text-slate-500">
                {new Date(order.created_at).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-slate-500">Nama</div>
              <div className="font-medium text-right text-white uppercase">
                {order.customer_name}
              </div>
              <div className="text-slate-500">No. HP</div>
              <div className="font-medium text-right text-white font-mono">
                {order.customer_phone}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2">
              Rincian Layanan
            </h3>
            <div className="space-y-3">
              {(order.order_items || []).map((item, idx) => {
                const roundedTotal = calculateRoundedPrice(
                  Number(item.service_price),
                  Number(item.quantity),
                );
                return (
                  <div
                    key={idx}
                    className="flex justify-between items-start text-sm"
                  >
                    <div className="flex-1 pr-4">
                      <div className="font-semibold text-slate-200 uppercase">
                        {item.service_name || item.name}
                      </div>
                      <div className="text-slate-500 text-xs mt-0.5">
                        {item.quantity} {item.unit} ×{" "}
                        {formatCurrency(Number(item.service_price || 0))}
                      </div>
                    </div>
                    <div className="font-bold text-white font-mono">
                      {formatCurrency(roundedTotal)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="space-y-2 pt-4 border-t border-slate-800/80 border-dashed">
            <div className="flex justify-between text-sm text-slate-400">
              <span>Subtotal</span>
              <span className="font-mono">{formatCurrency(subtotal)}</span>
            </div>
            {rounding !== 0 && (
              <div className="flex justify-between text-sm text-slate-400">
                <span>Pembulatan</span>
                <span className="font-mono">{formatCurrency(rounding)}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-lg font-black text-cyan-400 pt-2 border-t border-slate-800/50">
              <span>TOTAL</span>
              <span className="font-mono">
                {formatCurrency(order.total_price)}
              </span>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-wider block mb-1">
                Catatan:
              </span>
              <span className="text-sm text-amber-400/80 italic">
                {order.notes}
              </span>
            </div>
          )}
        </CardContent>

        <CardFooter className="bg-slate-950/50 border-t border-slate-800/50 p-6 flex flex-col gap-4">
          <Button
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold h-12 rounded-xl"
            onClick={() => window.print()}
          >
            <Download className="w-4 h-4 mr-2" />
            Simpan Struk
          </Button>
          <div className="text-center w-full space-y-1">
            <p className="text-xs text-slate-500">
              Hubungi kami melalui WhatsApp
            </p>
            <p className="text-sm font-mono text-cyan-500 font-semibold">
              {settings.storePhone}
            </p>
          </div>
        </CardFooter>
      </Card>

      {/* Print Styles for saving as PDF beautifully */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .lucide-download {
            display: none !important;
          }
          button {
            display: none !important;
          }
          .Card {
            box-shadow: none !important;
            border: 1px solid #e2e8f0 !important;
            background: white !important;
            color: black !important;
          }
          * {
            color: black !important;
            border-color: #e2e8f0 !important;
          }
          .text-slate-400,
          .text-slate-500,
          .text-slate-300 {
            color: #64748b !important;
          }
          .bg-slate-900,
          .bg-slate-950,
          .bg-slate-800 {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}
