"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Order } from "@/types";
import { calculateRoundedPrice } from "@/utils/pricing";
import { formatCurrency } from "@/utils/format";
import {
  Loader2,
  Package,
  CheckCircle2,
  Clock,
  WashingMachine,
  MapPin,
  Phone,
  Download,
  Share2,
} from "lucide-react";
import { toast } from "sonner";

/* ─────────────────────────────────────────
   Decorative barcode (visual only)
───────────────────────────────────────── */
const BAR_PATTERN = [
  3, 0, 1, 0, 3, 0, 4, 0, 1, 0, 3, 0, 1, 0, 3, 0, 4, 0, 1, 0, 3, 0, 1, 0, 3, 0,
  1, 0, 4, 0, 3, 0, 1, 0, 3, 0, 1, 0, 4, 0, 3, 0, 1,
];
// 0 = gap-normal, negative = gap, positive = bar width

function Barcode({ value }: { value: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        flexShrink: 0,
      }}
    >
      <div
        style={{ display: "flex", gap: 1, height: 50, alignItems: "stretch" }}
      >
        {BAR_PATTERN.map((v, i) => (
          <div
            key={i}
            style={{
              width: v === 0 ? 2 : Math.abs(v),
              background: v === 0 ? "transparent" : "rgba(6,182,212,0.7)",
              borderRadius: 1,
            }}
          />
        ))}
      </div>
      <span
        style={{
          fontFamily: "ui-monospace, 'Cascadia Code', monospace",
          fontSize: 7,
          color: "rgba(100,116,139,0.8)",
          letterSpacing: "0.15em",
        }}
      >
        {value}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────
   Status config (selaras dengan admin UI)
───────────────────────────────────────── */
function getStatusConfig(status: string) {
  switch (status) {
    case "pending":
      return {
        label: "MENUNGGU",
        dot: "#eab308",
        textColor: "#fbbf24",
        bgGlow: "rgba(234,179,8,0.12)",
        border: "rgba(234,179,8,0.3)",
        stampColor: "#92400e",
        icon: <Clock style={{ width: 12, height: 12 }} />,
      };
    case "processing":
      return {
        label: "DIPROSES",
        dot: "#3b82f6",
        textColor: "#60a5fa",
        bgGlow: "rgba(59,130,246,0.12)",
        border: "rgba(59,130,246,0.3)",
        stampColor: "#1e3a5f",
        icon: <Package style={{ width: 12, height: 12 }} />,
      };
    case "completed":
      return {
        label: "SELESAI",
        dot: "#22c55e",
        textColor: "#4ade80",
        bgGlow: "rgba(34,197,94,0.12)",
        border: "rgba(34,197,94,0.3)",
        stampColor: "#14532d",
        icon: <CheckCircle2 style={{ width: 12, height: 12 }} />,
      };
    case "paid":
      return {
        label: "LUNAS",
        dot: "#a855f7",
        textColor: "#c084fc",
        bgGlow: "rgba(168,85,247,0.12)",
        border: "rgba(168,85,247,0.3)",
        stampColor: "#581c87",
        icon: <CheckCircle2 style={{ width: 12, height: 12 }} />,
      };
    default:
      return {
        label: status.toUpperCase(),
        dot: "#64748b",
        textColor: "#94a3b8",
        bgGlow: "rgba(100,116,139,0.12)",
        border: "rgba(100,116,139,0.3)",
        stampColor: "#334155",
        icon: null,
      };
  }
}

/* ─────────────────────────────────────────
   Main Page
───────────────────────────────────────── */
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
        storeName: parsed.storeName || prev.storeName,
        storePhone: parsed.storePhone || prev.storePhone,
        storeAddress: parsed.storeAddress || prev.storeAddress,
        receiptFooter: parsed.receiptFooter || prev.receiptFooter,
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
      const res = isUUID
        ? await supabase.rpc("get_receipt_by_token", { p_token: id })
        : await supabase
            .from("orders")
            .select("*, order_items(*)")
            .eq("id", id)
            .single();
      if (res.data) setOrder(res.data);
      setLoading(false);
    };
    fetchOrder();
  }, [id, supabase]);

  /* ── loading ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-xl animate-pulse" />
          <Loader2 className="relative w-10 h-10 text-cyan-400 animate-spin" />
        </div>
        <p className="text-slate-500 text-xs font-mono tracking-widest uppercase">
          Memuat Struk...
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <Package className="w-12 h-12 text-slate-700" />
        <p className="text-slate-500 text-sm">Order tidak ditemukan</p>
      </div>
    );
  }

  /* ── calculations ── */
  const subtotal = (order.order_items || []).reduce(
    (acc, item) =>
      acc + Number(item.service_price || 0) * Number(item.quantity),
    0,
  );
  const rounding = order.total_price - subtotal;

  /* ── formatting ── */
  const d = new Date(order.created_at);
  const dayMonth = d
    .toLocaleDateString("id-ID", { day: "2-digit", month: "short" })
    .toUpperCase();
  const yearStr = d.getFullYear().toString();
  const timeStr = d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const fullDate = d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const stampDate = `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${String(d.getFullYear()).slice(2)}`;
  const barcodeVal = `${String(order.id).padStart(4, "0")}-${d.getDate().toString().padStart(2, "0")}${(d.getMonth() + 1).toString().padStart(2, "0")}${d.getFullYear()}`;

  const status = getStatusConfig(order.status);

  /* ── PDF download ── */
  const downloadPDF = async () => {
    try {
      setIsDownloading(true);
      const { toPng } = await import("html-to-image");
      const { jsPDF } = await import("jspdf");
      const element = document.getElementById("receipt-content");
      const footerEl = document.getElementById("receipt-footer");
      if (!element) return;
      if (footerEl) footerEl.style.display = "none";
      await new Promise((r) => setTimeout(r, 60));
      const imgData = await toPng(element, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: "#020617",
      });
      if (footerEl) footerEl.style.display = "flex";
      const pdfWidth = 100;
      const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [pdfWidth, pdfHeight],
      });
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Struk_Laundry_${order.customer_name}_${order.id}.pdf`);
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengunduh PDF.");
      const footerEl = document.getElementById("receipt-footer");
      if (footerEl) footerEl.style.display = "flex";
    } finally {
      setIsDownloading(false);
    }
  };

  /* ══════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════ */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Bebas+Neue&display=swap');

        @keyframes passIn {
          from { opacity:0; transform:translateY(-18px) rotate(-0.4deg); }
          to   { opacity:1; transform:translateY(0) rotate(0deg); }
        }
        @keyframes stubIn {
          from { opacity:0; transform:translateY(-8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .pass-anim  { animation: passIn 0.75s cubic-bezier(0.16,1,0.3,1) forwards; }
        .stub-anim  { animation: stubIn 0.75s 0.1s cubic-bezier(0.16,1,0.3,1) forwards; opacity:0; }

        .action-btn { transition: all 0.18s ease; }
        .action-btn:hover { transform: translateY(-2px); }
        .action-btn:active { transform: translateY(0); }
      `}</style>

      {/* Page background — same as rest of app */}
      <div
        className="min-h-screen bg-slate-950 flex justify-center items-start py-10 px-4"
        style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }}
      >
        {/* Ambient glows — same pattern as admin layout */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-48 -left-48 w-96 h-96 bg-cyan-600/8 rounded-full blur-3xl" />
          <div className="absolute -bottom-48 -right-48 w-96 h-96 bg-blue-700/8 rounded-full blur-3xl" />
        </div>

        {/* ══ PDF capture area ══ */}
        <div
          id="receipt-content"
          style={{
            width: "100%",
            maxWidth: 440,
            display: "flex",
            flexDirection: "column",
            position: "relative",
            zIndex: 1,
            gap: 0,
          }}
        >
          {/* ════════════════════════════════
              MAIN PASS
          ════════════════════════════════ */}
          <div
            className="pass-anim relative overflow-hidden"
            style={{
              borderRadius: "12px 12px 0 0",
              background:
                "linear-gradient(160deg, #0f172a 0%, #0c1628 60%, #0f172a 100%)",
              boxShadow:
                "0 0 0 1px rgba(56,189,248,0.1), 0 24px 64px -12px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            {/* Subtle dot-grid texture */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                zIndex: 0,
                backgroundImage:
                  "radial-gradient(circle at 1.5px 1.5px, rgba(255,255,255,0.025) 1px, transparent 0)",
                backgroundSize: "22px 22px",
              }}
            />

            {/* Watermark — faint status label */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%) rotate(-28deg)",
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 90,
                color: "rgba(255,255,255,0.018)",
                whiteSpace: "nowrap",
                pointerEvents: "none",
                letterSpacing: "0.08em",
                zIndex: 0,
              }}
            >
              {status.label}
            </div>

            {/* ── Top stripe — cyan-to-blue gradient (same as admin CTA button) ── */}
            <div
              style={{
                background:
                  "linear-gradient(90deg, #06b6d4 0%, #3b82f6 60%, #6366f1 100%)",
                height: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 20px",
                position: "relative",
                zIndex: 2,
                overflow: "hidden",
              }}
            >
              {/* Diagonal shine */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage:
                    "repeating-linear-gradient(45deg,transparent,transparent 14px,rgba(255,255,255,0.04) 14px,rgba(255,255,255,0.04) 28px)",
                }}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  zIndex: 1,
                }}
              >
                <WashingMachine
                  style={{
                    width: 18,
                    height: 18,
                    color: "rgba(255,255,255,0.9)",
                  }}
                />
                <span
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 20,
                    color: "#fff",
                    letterSpacing: "0.12em",
                  }}
                >
                  {settings.storeName}
                </span>
              </div>
              <span
                style={{
                  fontSize: 9,
                  color: "rgba(255,255,255,0.65)",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  zIndex: 1,
                }}
              >
                E-Receipt
              </span>
            </div>

            {/* ── Route section (ORD → PLJ) ── */}
            <div
              style={{
                padding: "16px 20px 14px",
                display: "flex",
                alignItems: "center",
                borderBottom: "1px dashed rgba(51,65,85,0.8)",
                position: "relative",
                zIndex: 1,
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 52,
                    color: "#f8fafc",
                    lineHeight: 1,
                    letterSpacing: "0.04em",
                  }}
                >
                  ORD
                </div>
                <div
                  style={{
                    fontSize: 8.5,
                    color: "#475569",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    marginTop: 2,
                  }}
                >
                  Order #{order.id}
                </div>
              </div>

              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  padding: "0 10px",
                }}
              >
                <div
                  style={{
                    fontSize: 8.5,
                    color: "#475569",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  PJ · {yearStr}
                </div>
                {/* dotted route line */}
                <div
                  style={{
                    width: "100%",
                    height: 1,
                    backgroundImage:
                      "repeating-linear-gradient(90deg,#334155 0,#334155 4px,transparent 4px,transparent 9px)",
                  }}
                />
                <div style={{ fontSize: 18 }}>✈</div>
              </div>

              <div style={{ flex: 1, textAlign: "right" }}>
                <div
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 52,
                    color: "#f8fafc",
                    lineHeight: 1,
                    letterSpacing: "0.04em",
                  }}
                >
                  PLJ
                </div>
                <div
                  style={{
                    fontSize: 8.5,
                    color: "#475569",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    marginTop: 2,
                  }}
                >
                  Kab. Bojonegoro
                </div>
              </div>
            </div>

            {/* ── Info grid ── */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                padding: "12px 20px",
                gap: 10,
                borderBottom: "1px dashed rgba(51,65,85,0.8)",
                position: "relative",
                zIndex: 1,
              }}
            >
              {[
                { label: "Tanggal", value: dayMonth },
                { label: "Waktu", value: timeStr },
                { label: "Status", value: status.label.slice(0, 6) },
                {
                  label: "Telp",
                  value:
                    "···" + settings.storePhone.replace(/\D/g, "").slice(-4),
                },
              ].map((cell) => (
                <div key={cell.label}>
                  <div
                    style={{
                      fontSize: 7,
                      color: "#475569",
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      marginBottom: 4,
                    }}
                  >
                    {cell.label}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: 15,
                      color:
                        cell.label === "Status" ? status.textColor : "#e2e8f0",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {cell.value}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Customer / Passenger ── */}
            <div
              style={{
                padding: "12px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px dashed rgba(51,65,85,0.8)",
                position: "relative",
                zIndex: 1,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 7,
                    color: "#475569",
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                    marginBottom: 4,
                  }}
                >
                  Nama Pelanggan
                </div>
                <div
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 26,
                    color: "#f1f5f9",
                    letterSpacing: "0.06em",
                    lineHeight: 1,
                  }}
                >
                  {order.customer_name.toUpperCase()}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "#475569",
                    marginTop: 3,
                    letterSpacing: "0.06em",
                  }}
                >
                  {order.customer_phone}
                </div>
              </div>
              {/* Status pill — same palette as admin badge */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 12px",
                  borderRadius: 999,
                  background: status.bgGlow,
                  border: `1px solid ${status.border}`,
                  color: status.textColor,
                  fontSize: 9,
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: status.dot,
                    display: "inline-block",
                    boxShadow: `0 0 6px ${status.dot}`,
                  }}
                />
                {status.label}
              </div>
            </div>

            {/* ── Store info ── */}
            <div
              style={{
                padding: "10px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 5,
                borderBottom: "1px dashed rgba(51,65,85,0.8)",
                position: "relative",
                zIndex: 1,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 6,
                  color: "#475569",
                  fontSize: 10,
                }}
              >
                <MapPin
                  style={{
                    width: 11,
                    height: 11,
                    marginTop: 1,
                    flexShrink: 0,
                    color: "rgba(6,182,212,0.4)",
                  }}
                />
                <span style={{ whiteSpace: "pre-line", lineHeight: 1.5 }}>
                  {settings.storeAddress}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: "#475569",
                  fontSize: 10,
                }}
              >
                <Phone
                  style={{
                    width: 11,
                    height: 11,
                    flexShrink: 0,
                    color: "rgba(6,182,212,0.4)",
                  }}
                />
                {settings.storePhone}
              </div>
            </div>

            {/* ── Item layanan ── */}
            <div
              style={{ padding: "14px 20px", position: "relative", zIndex: 1 }}
            >
              {/* header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 7.5,
                  color: "#475569",
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  marginBottom: 10,
                  paddingBottom: 6,
                  borderBottom: "1px solid rgba(30,41,59,0.8)",
                }}
              >
                <span>Item Layanan</span>
                <span>Harga</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {(order.order_items || []).map((item, idx) => {
                  const roundedTotal = calculateRoundedPrice(
                    Number(item.service_price),
                    Number(item.quantity),
                  );
                  return (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        padding: "7px 0",
                        gap: 8,
                        borderBottom:
                          idx < (order.order_items || []).length - 1
                            ? "1px solid rgba(30,41,59,0.5)"
                            : "none",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "flex-start",
                          flex: 1,
                        }}
                      >
                        {/* cyan dot — same as admin order list */}
                        <span
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: "50%",
                            background: "rgba(6,182,212,0.5)",
                            flexShrink: 0,
                            marginTop: 5,
                          }}
                        />
                        <div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "#e2e8f0",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                            }}
                          >
                            {item.service_name || item.name}
                          </div>
                          <div
                            style={{
                              fontSize: 9.5,
                              color: "#475569",
                              marginTop: 2,
                            }}
                          >
                            {item.quantity} {item.unit} ×{" "}
                            {formatCurrency(Number(item.service_price || 0))}
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: 11.5,
                          color: "#e2e8f0",
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatCurrency(roundedTotal)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Notes */}
              {order.notes && (
                <div
                  style={{
                    marginTop: 12,
                    padding: "8px 10px",
                    background: "rgba(251,191,36,0.06)",
                    borderLeft: "2px solid rgba(251,191,36,0.4)",
                    borderRadius: "0 4px 4px 0",
                  }}
                >
                  <div
                    style={{
                      fontSize: 7.5,
                      color: "rgba(251,191,36,0.7)",
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      marginBottom: 2,
                    }}
                  >
                    Catatan
                  </div>
                  <div
                    style={{
                      fontSize: 10.5,
                      color: "rgba(251,191,36,0.8)",
                      fontStyle: "italic",
                      lineHeight: 1.5,
                    }}
                  >
                    {order.notes}
                  </div>
                </div>
              )}

              {/* Terms */}
              <div
                style={{
                  marginTop: 14,
                  paddingTop: 10,
                  borderTop: "1px dashed rgba(51,65,85,0.8)",
                }}
              >
                <p
                  style={{
                    fontSize: 7.5,
                    color: "#334155",
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                    textAlign: "center",
                    marginBottom: 4,
                  }}
                >
                  Syarat &amp; Ketentuan
                </p>
                <p
                  style={{
                    fontSize: 9.5,
                    color: "#334155",
                    whiteSpace: "pre-line",
                    lineHeight: 1.7,
                    textAlign: "center",
                  }}
                >
                  {settings.receiptFooter}
                </p>
              </div>
            </div>
          </div>

          {/* ════════════════════════════════
              TEAR PERFORATION
          ════════════════════════════════ */}
          <div
            style={{
              height: 22,
              background: "#080f1d",
              position: "relative",
              display: "flex",
              alignItems: "center",
              overflow: "visible",
            }}
          >
            {/* Left notch */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: -11,
                transform: "translateY(-50%)",
                width: 22,
                height: 22,
                background: "#020617",
                borderRadius: "50%",
                zIndex: 10,
              }}
            />
            {/* Right notch */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                right: -11,
                transform: "translateY(-50%)",
                width: 22,
                height: 22,
                background: "#020617",
                borderRadius: "50%",
                zIndex: 10,
              }}
            />
            {/* Cyan dashed line */}
            <div
              style={{
                flex: 1,
                margin: "0 14px",
                height: 1,
                backgroundImage:
                  "repeating-linear-gradient(90deg,rgba(6,182,212,0.25) 0,rgba(6,182,212,0.25) 5px,transparent 5px,transparent 11px)",
              }}
            />
            {/* Label */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: 6.5,
                color: "rgba(71,85,105,0.7)",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                whiteSpace: "nowrap",
                background: "#080f1d",
                padding: "0 8px",
              }}
            >
              STUB PELANGGAN
            </div>
          </div>

          {/* ════════════════════════════════
              STUB
          ════════════════════════════════ */}
          <div
            className="stub-anim relative overflow-hidden"
            style={{
              borderRadius: "0 0 12px 12px",
              background: "linear-gradient(160deg, #0c1628 0%, #0f172a 100%)",
              boxShadow:
                "0 0 0 1px rgba(56,189,248,0.08), 0 20px 60px -12px rgba(0,0,0,0.9)",
            }}
          >
            {/* Dot texture */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                backgroundImage:
                  "radial-gradient(circle at 1.5px 1.5px, rgba(255,255,255,0.018) 1px, transparent 0)",
                backgroundSize: "22px 22px",
              }}
            />

            {/* Stamp — dynamic status */}
            <div
              style={{
                position: "absolute",
                top: 14,
                right: 16,
                width: 58,
                height: 58,
                border: `2px solid ${status.dot}`,
                borderRadius: "50%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                transform: "rotate(-16deg)",
                opacity: 0.5,
                zIndex: 3,
                boxShadow: `0 0 12px ${status.dot}22`,
              }}
            >
              <span
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 13,
                  color: status.dot,
                  letterSpacing: "0.12em",
                }}
              >
                {status.label}
              </span>
              <span
                style={{
                  fontSize: 7,
                  color: status.dot,
                  letterSpacing: "0.08em",
                  marginTop: 1,
                }}
              >
                {stampDate}
              </span>
            </div>

            {/* Stub content */}
            <div
              style={{
                padding: "16px 20px 6px",
                display: "flex",
                alignItems: "center",
                gap: 16,
                position: "relative",
                zIndex: 2,
              }}
            >
              <Barcode value={barcodeVal} />

              <div style={{ flex: 1 }}>
                {/* Sub-rows */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span
                      style={{
                        fontSize: 8.5,
                        color: "#475569",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                      }}
                    >
                      Subtotal
                    </span>
                    <span style={{ fontSize: 10.5, color: "#94a3b8" }}>
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  {rounding !== 0 && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 8.5,
                          color: "#475569",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                        }}
                      >
                        Pembulatan
                      </span>
                      <span style={{ fontSize: 10.5, color: "#94a3b8" }}>
                        {formatCurrency(rounding)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Separator */}
                <div
                  style={{
                    height: 1,
                    background: "rgba(51,65,85,0.7)",
                    margin: "4px 0",
                  }}
                />

                {/* Grand total */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: 11,
                        color: "#64748b",
                        letterSpacing: "0.1em",
                      }}
                    >
                      TOTAL
                    </div>
                    <div
                      style={{
                        fontSize: 8,
                        color: "#334155",
                        letterSpacing: "0.08em",
                        marginTop: 1,
                      }}
                    >
                      {fullDate}
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: 28,
                      lineHeight: 1,
                      background: "linear-gradient(90deg, #06b6d4, #3b82f6)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {formatCurrency(order.total_price)}
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div
              id="receipt-footer"
              style={{
                display: "flex",
                gap: 8,
                padding: "12px 20px 18px",
                position: "relative",
                zIndex: 2,
              }}
            >
              {/* Download PDF — same gradient as admin "Order Baru" button */}
              <button
                className="action-btn"
                onClick={downloadPDF}
                disabled={isDownloading}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  boxShadow: "0 4px 20px rgba(6,182,212,0.2)",
                  opacity: isDownloading ? 0.65 : 1,
                  fontFamily: "'IBM Plex Mono', monospace",
                }}
              >
                {isDownloading ? (
                  <>
                    <Loader2
                      style={{ width: 11, height: 11 }}
                      className="animate-spin"
                    />{" "}
                    Proses...
                  </>
                ) : (
                  <>
                    <Download style={{ width: 11, height: 11 }} /> Unduh PDF
                  </>
                )}
              </button>

              {/* WhatsApp — outline style, same border token */}
              <a
                href={`https://wa.me/${settings.storePhone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="action-btn"
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "10px 14px",
                  borderRadius: 8,
                  textDecoration: "none",
                  background: "rgba(37,211,102,0.08)",
                  border: "1px solid rgba(37,211,102,0.3)",
                  color: "#25D366",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontFamily: "'IBM Plex Mono', monospace",
                }}
              >
                <Share2 style={{ width: 11, height: 11 }} /> WhatsApp
              </a>
            </div>
          </div>
        </div>
        {/* /receipt-content */}
      </div>
    </>
  );
}
