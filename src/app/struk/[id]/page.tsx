"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Order } from "@/types";
import { calculateRoundedPrice } from "@/utils/pricing";
import { formatCurrency } from "@/utils/format";
import {
  Loader2,
  CheckCircle2,
  Clock,
  Package,
  Download,
  WashingMachine,
  MapPin,
  Phone,
  CalendarDays,
  Hash,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function DigitalReceiptPage() {
  const params = useParams();
  const id = params?.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const [settings, setSettings] = useState({
    storeName: "PUTRAJAYA LAUNDRY",
    storePhone: "+62 081232052919",
    storeAddress: "Jl. Kelapa No. 141 RT/RW 07/02\nKabunan, Balen, Bojonegoro",
    receiptFooter:
      "1. Barang tidak diambil 30 hari menjadi hak laundry\n2. Komplain maksimal 2x24 jam setelah pengambilan",
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
        storeAddress:
          parsed.storeAddress ||
          "Jl. Kelapa No. 141 RT/RW 07/02\nKabunan, Balen, Bojonegoro",
        receiptFooter:
          parsed.receiptFooter ||
          "1. Barang tidak diambil 30 hari menjadi hak laundry\n2. Komplain maksimal 2x24 jam setelah pengambilan",
      }));
    }
  }, []);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
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
      <div className="min-h-screen bg-[#0a0f1e] flex flex-col justify-center items-center p-8">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-xl animate-pulse" />
          <Loader2 className="relative w-10 h-10 text-cyan-400 animate-spin" />
        </div>
        <p className="text-slate-400 font-medium mt-4 text-sm tracking-wide">
          Memuat Struk Digital...
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex flex-col justify-center items-center p-8">
        <Package className="w-16 h-16 text-slate-700 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">
          Order Tidak Ditemukan
        </h2>
        <p className="text-slate-500 text-center text-sm">
          Maaf, kami tidak dapat menemukan data pesanan untuk struk ini.
        </p>
      </div>
    );
  }

  const subtotal = (order.order_items || []).reduce((acc, item) => {
    return acc + Number(item.service_price || 0) * Number(item.quantity);
  }, 0);

  const rounding = order.total_price - subtotal;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return {
          label: "MENUNGGU",
          color: "text-amber-400",
          bg: "bg-amber-400/10 border-amber-400/30",
          dot: "bg-amber-400",
          icon: <Clock className="w-3.5 h-3.5" />,
        };
      case "processing":
        return {
          label: "DIPROSES",
          color: "text-blue-400",
          bg: "bg-blue-400/10 border-blue-400/30",
          dot: "bg-blue-400",
          icon: <Package className="w-3.5 h-3.5" />,
        };
      case "completed":
        return {
          label: "SELESAI",
          color: "text-emerald-400",
          bg: "bg-emerald-400/10 border-emerald-400/30",
          dot: "bg-emerald-400",
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        };
      case "paid":
        return {
          label: "LUNAS",
          color: "text-purple-400",
          bg: "bg-purple-400/10 border-purple-400/30",
          dot: "bg-purple-400",
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        };
      default:
        return {
          label: status.toUpperCase(),
          color: "text-slate-400",
          bg: "bg-slate-700/30 border-slate-600/30",
          dot: "bg-slate-400",
          icon: null,
        };
    }
  };

  const downloadPDF = async () => {
    try {
      setIsDownloading(true);
      const { toPng } = await import("html-to-image");
      const { jsPDF } = await import("jspdf");

      const element = document.getElementById("receipt-content");
      const footerElement = document.getElementById("receipt-footer");

      if (!element) return;

      if (footerElement) footerElement.style.display = "none";
      await new Promise((resolve) => setTimeout(resolve, 50));

      const imgData = await toPng(element, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: "#0a0f1e",
      });

      if (footerElement) footerElement.style.display = "flex";

      const pdfWidth = 100;
      const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [pdfWidth, pdfHeight],
      });

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Struk_Laundry_${order.customer_name}_${order.id}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Gagal mengunduh PDF. Silakan coba lagi nanti.");
      const footerElement = document.getElementById("receipt-footer");
      if (footerElement) footerElement.style.display = "flex";
    } finally {
      setIsDownloading(false);
    }
  };

  const statusConfig = getStatusConfig(order.status);
  const formattedDate = new Date(order.created_at).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const formattedTime = new Date(order.created_at).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex justify-center items-start pt-8 pb-24 px-4 sm:px-6">
      {/* Ambient glow background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div id="receipt-content" className="w-full max-w-sm relative">
        {/* ── BOARDING PASS CARD ── */}
        <div
          className="relative rounded-3xl overflow-hidden shadow-2xl"
          style={{
            background:
              "linear-gradient(160deg, #111827 0%, #0d1526 50%, #111827 100%)",
            boxShadow:
              "0 0 0 1px rgba(56,189,248,0.12), 0 32px 80px -12px rgba(0,0,0,0.8), 0 0 60px -20px rgba(6,182,212,0.15)",
          }}
        >
          {/* Top accent strip */}
          <div className="h-1.5 w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500" />

          {/* ── HEADER ZONE (Airline-style top section) ── */}
          <div className="relative px-6 pt-6 pb-7 overflow-hidden">
            {/* Background pattern */}
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)`,
                backgroundSize: "24px 24px",
              }}
            />

            {/* Logo + Store Name */}
            <div className="relative flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 flex-shrink-0">
                  <WashingMachine className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-cyan-400/70 font-bold tracking-[0.2em] uppercase leading-none mb-0.5">
                    e-receipt
                  </p>
                  <h1 className="text-base font-black text-white tracking-tight leading-tight">
                    {settings.storeName}
                  </h1>
                </div>
              </div>

              {/* Status badge */}
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[10px] font-bold tracking-widest ${statusConfig.bg} ${statusConfig.color}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} animate-pulse`}
                />
                {statusConfig.label}
              </div>
            </div>

            {/* Store Info */}
            <div className="relative space-y-1.5">
              <div className="flex items-start gap-2 text-slate-500 text-[11px]">
                <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0 text-cyan-500/50" />
                <span className="whitespace-pre-line leading-relaxed">
                  {settings.storeAddress}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                <Phone className="w-3 h-3 flex-shrink-0 text-cyan-500/50" />
                <span>{settings.storePhone}</span>
              </div>
            </div>
          </div>

          {/* ── PERFORATED TEAR LINE ── */}
          <div className="relative flex items-center">
            {/* Left notch */}
            <div className="absolute -left-4 w-8 h-8 rounded-full bg-[#0a0f1e] z-10 shadow-inner" />
            {/* Right notch */}
            <div className="absolute -right-4 w-8 h-8 rounded-full bg-[#0a0f1e] z-10 shadow-inner" />
            {/* Dashed line */}
            <div className="flex-1 mx-6 border-t-2 border-dashed border-slate-700/60" />
          </div>

          {/* ── TICKET BODY ── */}
          <div className="px-6 py-6 space-y-5">
            {/* Ticket header row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/40 rounded-2xl p-3 border border-slate-700/30">
                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-1 flex items-center gap-1">
                  <Hash className="w-2.5 h-2.5" /> Nomor Order
                </p>
                <p className="text-sm font-black text-cyan-400 font-mono tracking-wide">
                  #{order.id}
                </p>
              </div>
              <div className="bg-slate-800/40 rounded-2xl p-3 border border-slate-700/30">
                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-1 flex items-center gap-1">
                  <CalendarDays className="w-2.5 h-2.5" /> Tanggal
                </p>
                <p className="text-[11px] font-bold text-white leading-tight">
                  {formattedDate}
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  {formattedTime}
                </p>
              </div>
            </div>

            {/* Passenger-style section: Customer */}
            <div className="bg-slate-800/30 rounded-2xl p-4 border border-slate-700/30">
              <p className="text-[9px] text-cyan-400/60 uppercase tracking-[0.2em] font-bold mb-3">
                Pelanggan
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-black text-white uppercase tracking-wide leading-tight">
                    {order.customer_name}
                  </p>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    {order.customer_phone}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600/50 flex items-center justify-center">
                  <span className="text-sm font-black text-slate-300">
                    {order.customer_name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Service Items ── */}
            <div>
              <p className="text-[9px] text-cyan-400/60 uppercase tracking-[0.2em] font-bold mb-3">
                Rincian Layanan
              </p>
              <div className="space-y-2.5">
                {(order.order_items || []).map((item, idx) => {
                  const roundedTotal = calculateRoundedPrice(
                    Number(item.service_price),
                    Number(item.quantity),
                  );
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-slate-800/40 border border-slate-700/20"
                    >
                      <div className="flex-1 pr-3">
                        <p className="text-[11px] font-bold text-slate-200 uppercase tracking-wide">
                          {item.service_name || item.name}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
                          {item.quantity} {item.unit} ×{" "}
                          {formatCurrency(Number(item.service_price || 0))}
                        </p>
                      </div>
                      <p className="text-sm font-black text-white font-mono">
                        {formatCurrency(roundedTotal)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/8 border border-amber-500/20">
                <div className="w-1 h-full min-h-[16px] rounded-full bg-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[9px] font-bold text-amber-400 uppercase tracking-widest mb-0.5">
                    Catatan
                  </p>
                  <p className="text-[11px] text-amber-300/80 italic leading-relaxed">
                    {order.notes}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── SECOND PERFORATED LINE (before total) ── */}
          <div className="relative flex items-center">
            <div className="absolute -left-4 w-8 h-8 rounded-full bg-[#0a0f1e] z-10" />
            <div className="absolute -right-4 w-8 h-8 rounded-full bg-[#0a0f1e] z-10" />
            <div className="flex-1 mx-6 border-t-2 border-dashed border-slate-700/60" />
          </div>

          {/* ── TOTAL ZONE (Barcode area-style) ── */}
          <div className="px-6 py-5">
            {/* Price breakdown */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Subtotal</span>
                <span className="font-mono">{formatCurrency(subtotal)}</span>
              </div>
              {rounding !== 0 && (
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Pembulatan</span>
                  <span className="font-mono">{formatCurrency(rounding)}</span>
                </div>
              )}
            </div>

            {/* Total — bold airline gate number style */}
            <div
              className="rounded-2xl px-5 py-4 flex items-center justify-between"
              style={{
                background:
                  "linear-gradient(135deg, rgba(6,182,212,0.12) 0%, rgba(59,130,246,0.12) 100%)",
                border: "1px solid rgba(6,182,212,0.2)",
              }}
            >
              <div>
                <p className="text-[9px] text-cyan-400/60 uppercase tracking-[0.2em] font-bold mb-0.5">
                  Total Pembayaran
                </p>
                <p
                  className="text-2xl font-black text-white font-mono tracking-tight"
                  style={{
                    textShadow: "0 0 20px rgba(6,182,212,0.4)",
                  }}
                >
                  {formatCurrency(order.total_price)}
                </p>
              </div>
              <div className="text-right">
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold ${statusConfig.bg} ${statusConfig.color}`}
                >
                  {statusConfig.icon}
                  {statusConfig.label}
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="mt-5 pt-4 border-t border-slate-800/60">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2 text-center">
                Syarat &amp; Ketentuan
              </p>
              <p className="text-[10px] text-slate-600 whitespace-pre-line leading-relaxed text-center">
                {settings.receiptFooter}
              </p>
            </div>
          </div>

          {/* Bottom accent strip */}
          <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400 opacity-50" />
        </div>

        {/* ── Actions (outside the receipt card, not captured in PDF) ── */}
        <div
          id="receipt-footer"
          className="mt-5 flex flex-col gap-3"
          data-html2canvas-ignore
        >
          <Button
            className="w-full h-12 rounded-2xl font-bold text-sm tracking-wide text-white border-0"
            style={{
              background: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
              boxShadow: "0 4px 24px rgba(6,182,212,0.25)",
            }}
            onClick={downloadPDF}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {isDownloading ? "Memproses PDF..." : "Simpan Struk (PDF)"}
          </Button>

          <div className="flex flex-col items-center gap-2">
            <p className="text-[11px] text-slate-600 font-medium">
              Butuh Bantuan?
            </p>
            <a
              href={`https://wa.me/${settings.storePhone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-5 py-2 rounded-full text-xs font-bold font-mono tracking-wide transition-all"
              style={{
                background: "rgba(37,211,102,0.1)",
                color: "#25D366",
                border: "1px solid rgba(37,211,102,0.25)",
              }}
            >
              Hubungi via WhatsApp
            </a>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          button,
          #receipt-footer {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
