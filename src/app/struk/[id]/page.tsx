"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Order } from "@/types";
import { calculateRoundedPrice } from "@/utils/pricing";
import { formatCurrency } from "@/utils/format";
import { Loader2, Package } from "lucide-react";
import { toast } from "sonner";

/* ─────────────────────────────────────────
   Tiny barcode renderer (decorative)
───────────────────────────────────────── */
const BARS = [
  "thick",
  "gap",
  "thin",
  "gap",
  "thick",
  "gap-wide",
  "thin",
  "gap",
  "thick",
  "gap",
  "thin",
  "gap",
  "thick",
  "gap-wide",
  "thin",
  "gap",
  "thick",
  "gap",
  "thin",
  "gap-wide",
  "thick",
  "gap",
  "thin",
  "gap",
  "thick",
  "gap",
  "thin",
  "gap-wide",
  "thick",
  "gap",
  "thin",
  "gap",
  "thick",
  "gap",
  "thin",
  "gap-wide",
  "thick",
  "gap",
  "thin",
];

function Barcode({ value }: { value: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 5,
        flexShrink: 0,
      }}
    >
      <div
        style={{ display: "flex", gap: 1, height: 54, alignItems: "stretch" }}
      >
        {BARS.map((t, i) => {
          const w =
            t === "thin" ? 1 : t === "thick" ? 3 : t === "gap-wide" ? 4 : 2;
          const bg = t.startsWith("gap") ? "transparent" : "#1a1510";
          return (
            <div
              key={i}
              style={{ width: w, background: bg, borderRadius: 0.5 }}
            />
          );
        })}
      </div>
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 7.5,
          color: "#7a6e5e",
          letterSpacing: "0.14em",
        }}
      >
        {value}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Status → stamp config
───────────────────────────────────────── */
function getStampConfig(status: string) {
  switch (status) {
    case "paid":
      return { text: "LUNAS", color: "#8b1a1a" };
    case "completed":
      return { text: "SELESAI", color: "#2d6a35" };
    case "processing":
      return { text: "PROSES", color: "#1a3a5c" };
    case "pending":
      return { text: "PENDING", color: "#7a5c00" };
    default:
      return { text: status.toUpperCase().slice(0, 7), color: "#3d3528" };
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
      <div
        style={{
          minHeight: "100vh",
          background: "#2b2520",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
        }}
      >
        <Loader2
          style={{ width: 32, height: 32, color: "#b0a898" }}
          className="animate-spin"
        />
        <p
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11,
            color: "#7a6e5e",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          Memuat Struk...
        </p>
      </div>
    );
  }

  /* ── not found ── */
  if (!order) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#2b2520",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
        }}
      >
        <Package style={{ width: 48, height: 48, color: "#7a6e5e" }} />
        <p
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 13,
            color: "#b0a898",
          }}
        >
          Order tidak ditemukan
        </p>
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

  /* ── date/time ── */
  const d = new Date(order.created_at);
  const dateStr = d
    .toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();
  const timeStr = d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const barcodeNum = `${String(order.id).padStart(4, "0")}-${d.getDate().toString().padStart(2, "0")}${(d.getMonth() + 1).toString().padStart(2, "0")}${d.getFullYear()}`;
  const stampDate = `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${String(d.getFullYear()).slice(2)}`;

  const stamp = getStampConfig(order.status);

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
        backgroundColor: "#2b2520",
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

  /* ══════════════════════════════════════
     RENDER
  ══════════════════════════════════════ */
  return (
    <>
      {/* Google Fonts */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=Bebas+Neue&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');

        :root {
          --paper:      #f5f0e8;
          --paper-dark: #e8e0ce;
          --paper-mid:  #ede6d6;
          --ink:        #1a1510;
          --ink-mid:    #3d3528;
          --ink-light:  #7a6e5e;
          --ink-faint:  #b0a898;
          --stripe:     #2c4a6e;
        }

        @keyframes dropIn {
          from { opacity:0; transform:translateY(-20px) rotate(-0.5deg); }
          to   { opacity:1; transform:translateY(0) rotate(0deg); }
        }
        @keyframes dropInStub {
          from { opacity:0; transform:translateY(-10px); }
          to   { opacity:1; transform:translateY(0); }
        }

        .pass-card {
          animation: dropIn 0.8s cubic-bezier(0.16,1,0.3,1) forwards;
        }
        .stub-card {
          animation: dropInStub 0.8s 0.1s cubic-bezier(0.16,1,0.3,1) forwards;
          opacity:0;
        }

        .btn-dark-bp { transition: all 0.15s ease; }
        .btn-dark-bp:hover  { background: #3d3528 !important; transform:translateY(-1px); box-shadow:0 4px 12px rgba(0,0,0,0.3); }
        .btn-outline-bp { transition: all 0.15s ease; }
        .btn-outline-bp:hover { border-color:#1a1510 !important; transform:translateY(-1px); }
      `}</style>

      <div
        style={{
          background: "#2b2520",
          minHeight: "100vh",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "40px 20px 80px",
          fontFamily: "'IBM Plex Mono', monospace",
          position: "relative",
          // wood-grain overlay via pseudo isn't possible inline; leave clean
        }}
      >
        {/* Subtle wood-grain overlay */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            backgroundImage:
              "repeating-linear-gradient(92deg,transparent 0px,rgba(255,255,255,0.012) 1px,transparent 2px,transparent 8px),repeating-linear-gradient(180deg,transparent 0px,rgba(0,0,0,0.08) 1px,transparent 2px,transparent 40px)",
          }}
        />

        {/* ══ Scene wrapper (captured for PDF) ══ */}
        <div
          id="receipt-content"
          style={{
            width: "100%",
            maxWidth: 460,
            display: "flex",
            flexDirection: "column",
            gap: 0,
            position: "relative",
          }}
        >
          {/* ════════════ MAIN PASS ════════════ */}
          <div
            className="pass-card"
            style={{
              background: "var(--paper)",
              borderRadius: "6px 6px 0 0",
              position: "relative",
              overflow: "hidden",
              boxShadow:
                "0 2px 0 #ccc4b0, 0 4px 0 #c0b89e, 0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.8)",
            }}
          >
            {/* Paper texture */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                zIndex: 1,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
                backgroundSize: "200px 200px",
                opacity: 0.5,
              }}
            />

            {/* Watermark */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%) rotate(-30deg)",
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 80,
                color: "rgba(26,21,16,0.03)",
                whiteSpace: "nowrap",
                pointerEvents: "none",
                letterSpacing: "0.1em",
                zIndex: 0,
              }}
            >
              {stamp.text}
            </div>

            {/* ── Stripe Header ── */}
            <div
              style={{
                background: "var(--stripe)",
                height: 52,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 22px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage:
                    "repeating-linear-gradient(45deg,transparent,transparent 10px,rgba(255,255,255,0.03) 10px,rgba(255,255,255,0.03) 20px)",
                }}
              />
              <div
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 22,
                  color: "#fff",
                  letterSpacing: "0.12em",
                  zIndex: 1,
                }}
              >
                {settings.storeName}
              </div>
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 9,
                  color: "rgba(255,255,255,0.6)",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  zIndex: 1,
                }}
              >
                Struk Digital
              </div>
            </div>

            {/* ── Route Section (ORD → PLJ) ── */}
            <div
              style={{
                padding: "18px 22px 14px",
                display: "flex",
                alignItems: "center",
                gap: 0,
                borderBottom: "1px dashed var(--ink-faint)",
                position: "relative",
              }}
            >
              {/* Left: FROM */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 54,
                    color: "var(--ink)",
                    lineHeight: 1,
                    letterSpacing: "0.04em",
                  }}
                >
                  ORD
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: "var(--ink-light)",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    marginTop: 2,
                  }}
                >
                  Order #{order.id}
                </div>
              </div>

              {/* Mid: flight line */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  padding: "0 8px",
                }}
              >
                <div
                  style={{
                    fontSize: 9,
                    color: "var(--ink-light)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  PJ · {d.getFullYear()}
                </div>
                <div
                  style={{
                    width: "100%",
                    height: 1,
                    backgroundImage:
                      "repeating-linear-gradient(90deg,var(--ink-faint) 0,var(--ink-faint) 4px,transparent 4px,transparent 8px)",
                  }}
                />
                <div style={{ fontSize: 20, position: "relative", zIndex: 2 }}>
                  ✈
                </div>
              </div>

              {/* Right: TO */}
              <div style={{ flex: 1, textAlign: "right" }}>
                <div
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 54,
                    color: "var(--ink)",
                    lineHeight: 1,
                    letterSpacing: "0.04em",
                  }}
                >
                  PJL
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: "var(--ink-light)",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    marginTop: 2,
                  }}
                >
                  Kab. Bojonegoro
                </div>
              </div>
            </div>

            {/* ── Info Grid ── */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                padding: "14px 22px",
                gap: 12,
                borderBottom: "1px dashed var(--ink-faint)",
              }}
            >
              {[
                {
                  label: "Tanggal",
                  value: d
                    .toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                    })
                    .toUpperCase(),
                },
                { label: "Waktu", value: timeStr },
                { label: "Status", value: stamp.text.slice(0, 6) },
                {
                  label: "Telp",
                  value: settings.storePhone.replace(/\D/g, "").slice(-4),
                },
              ].map((cell) => (
                <div key={cell.label}>
                  <div
                    style={{
                      fontSize: 7.5,
                      color: "var(--ink-faint)",
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      marginBottom: 3,
                      fontFamily: "'IBM Plex Sans', sans-serif",
                    }}
                  >
                    {cell.label}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: 16,
                      color: "var(--ink)",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {cell.value}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Passenger / Customer ── */}
            <div
              style={{
                padding: "12px 22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px dashed var(--ink-faint)",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 7.5,
                    color: "var(--ink-faint)",
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    marginBottom: 2,
                  }}
                >
                  Nama Pelanggan
                </div>
                <div
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 28,
                    color: "var(--ink)",
                    letterSpacing: "0.06em",
                    lineHeight: 1,
                  }}
                >
                  {order.customer_name.toUpperCase()}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "var(--ink-faint)",
                    fontFamily: "'IBM Plex Mono', monospace",
                    marginTop: 3,
                  }}
                >
                  {order.customer_phone}
                </div>
              </div>
              <div
                style={{
                  background: "#1a3a5c",
                  color: "#fff",
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 11,
                  letterSpacing: "0.12em",
                  padding: "4px 10px",
                  borderRadius: 2,
                }}
              >
                PELANGGAN
              </div>
            </div>

            {/* ── Items ── */}
            <div style={{ padding: "14px 22px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 8,
                  color: "var(--ink-faint)",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  marginBottom: 10,
                  paddingBottom: 6,
                  borderBottom: "1px solid var(--paper-dark)",
                }}
              >
                <span>Item Layanan</span>
                <span>Harga</span>
              </div>

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
                      padding: "5px 0",
                      gap: 8,
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
                      <span
                        style={{
                          fontSize: 10,
                          color: "var(--ink-faint)",
                          minWidth: 20,
                          fontWeight: 600,
                          paddingTop: 1,
                        }}
                      >
                        {item.quantity}×
                      </span>
                      <div>
                        <div
                          style={{
                            fontSize: 11.5,
                            color: "var(--ink)",
                            fontWeight: 500,
                          }}
                        >
                          {(item.service_name || item.name || "").toUpperCase()}
                        </div>
                        <div
                          style={{
                            fontSize: 9,
                            color: "var(--ink-faint)",
                            marginTop: 1,
                            fontFamily: "'IBM Plex Sans', sans-serif",
                          }}
                        >
                          {item.unit} ·{" "}
                          {formatCurrency(Number(item.service_price || 0))}/unit
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 11.5,
                        color: "var(--ink)",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        fontFamily: "'IBM Plex Mono', monospace",
                      }}
                    >
                      {formatCurrency(roundedTotal)}
                    </div>
                  </div>
                );
              })}

              {/* Notes */}
              {order.notes && (
                <div
                  style={{
                    marginTop: 12,
                    padding: "8px 10px",
                    background: "rgba(184,134,11,0.08)",
                    borderLeft: "2.5px solid #b8860b",
                    borderRadius: "0 3px 3px 0",
                  }}
                >
                  <div
                    style={{
                      fontSize: 8,
                      color: "#7a5c00",
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      fontFamily: "'IBM Plex Sans', sans-serif",
                      marginBottom: 2,
                    }}
                  >
                    Catatan
                  </div>
                  <div
                    style={{
                      fontSize: 10.5,
                      color: "#3d3528",
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
                  borderTop: "1px dashed var(--ink-faint)",
                }}
              >
                <div
                  style={{
                    fontSize: 7.5,
                    color: "var(--ink-faint)",
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    marginBottom: 4,
                    textAlign: "center",
                  }}
                >
                  Syarat &amp; Ketentuan
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: "var(--ink-faint)",
                    whiteSpace: "pre-line",
                    lineHeight: 1.7,
                    textAlign: "center",
                  }}
                >
                  {settings.receiptFooter}
                </div>
              </div>
            </div>
          </div>

          {/* ════════════ TEAR PERFORATION ════════════ */}
          <div
            style={{
              height: 22,
              background: "var(--paper-dark)",
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
                left: -10,
                transform: "translateY(-50%)",
                width: 20,
                height: 20,
                background: "#2b2520",
                borderRadius: "50%",
                zIndex: 10,
              }}
            />
            {/* Right notch */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                right: -10,
                transform: "translateY(-50%)",
                width: 20,
                height: 20,
                background: "#2b2520",
                borderRadius: "50%",
                zIndex: 10,
              }}
            />
            {/* Dash line */}
            <div
              style={{
                flex: 1,
                margin: "0 12px",
                height: 1,
                backgroundImage:
                  "repeating-linear-gradient(90deg,var(--ink-faint) 0,var(--ink-faint) 5px,transparent 5px,transparent 10px)",
              }}
            />
            {/* Text */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: 7,
                color: "var(--ink-faint)",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                whiteSpace: "nowrap",
                fontFamily: "'IBM Plex Sans', sans-serif",
                background: "var(--paper-dark)",
                padding: "0 6px",
              }}
            >
              — STUB PELANGGAN —
            </div>
          </div>

          {/* ════════════ STUB ════════════ */}
          <div
            className="stub-card"
            style={{
              background: "var(--paper-mid)",
              borderRadius: "0 0 6px 6px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5), inset 0 2px 0 #b8b0a0",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Paper texture */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                zIndex: 1,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`,
                backgroundSize: "200px",
              }}
            />

            {/* Stamp */}
            <div
              style={{
                position: "absolute",
                top: 14,
                right: 18,
                width: 62,
                height: 62,
                border: `2.5px solid ${stamp.color}`,
                borderRadius: "50%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                transform: "rotate(-15deg)",
                opacity: 0.55,
                zIndex: 3,
              }}
            >
              <div
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 14,
                  color: stamp.color,
                  letterSpacing: "0.15em",
                  textAlign: "center",
                  lineHeight: 1.3,
                }}
              >
                {stamp.text}
              </div>
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 8,
                  color: stamp.color,
                  letterSpacing: "0.1em",
                }}
              >
                {stampDate}
              </div>
            </div>

            {/* Stub inner */}
            <div
              style={{
                padding: "16px 22px 20px",
                display: "flex",
                alignItems: "center",
                gap: 18,
                position: "relative",
                zIndex: 2,
              }}
            >
              <Barcode value={barcodeNum} />

              <div style={{ flex: 1 }}>
                {/* Subtotal + rounding */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 5,
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 9,
                        color: "var(--ink-faint)",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        fontFamily: "'IBM Plex Sans', sans-serif",
                      }}
                    >
                      Subtotal
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: "var(--ink-mid)",
                        fontWeight: 500,
                      }}
                    >
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  {rounding !== 0 && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 9,
                          color: "var(--ink-faint)",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          fontFamily: "'IBM Plex Sans', sans-serif",
                        }}
                      >
                        Pembulatan
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: "var(--ink-mid)",
                          fontWeight: 500,
                        }}
                      >
                        {formatCurrency(rounding)}
                      </span>
                    </div>
                  )}
                </div>

                <div
                  style={{
                    height: 1,
                    background: "var(--ink-faint)",
                    opacity: 0.3,
                    margin: "6px 0",
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
                        fontSize: 13,
                        color: "var(--ink-light)",
                        letterSpacing: "0.1em",
                      }}
                    >
                      Total
                    </div>
                    <div
                      style={{
                        fontSize: 8,
                        color: "var(--ink-faint)",
                        fontFamily: "'IBM Plex Sans', sans-serif",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        marginTop: 1,
                      }}
                    >
                      {dateStr}
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: 30,
                      color: "var(--ink)",
                      letterSpacing: "0.04em",
                      lineHeight: 1,
                    }}
                  >
                    {/* strip "Rp" prefix for big display, show raw number */}
                    {formatCurrency(order.total_price)}
                  </div>
                </div>
              </div>
            </div>

            {/* Action row */}
            <div
              id="receipt-footer"
              style={{
                display: "flex",
                gap: 8,
                padding: "0 22px 18px",
                position: "relative",
                zIndex: 2,
              }}
            >
              <button
                className="btn-dark-bp"
                onClick={downloadPDF}
                disabled={isDownloading}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "10px 12px",
                  borderRadius: 3,
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10,
                  fontWeight: 500,
                  cursor: "pointer",
                  border: "none",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  background: "var(--ink)",
                  color: "var(--paper)",
                  opacity: isDownloading ? 0.7 : 1,
                }}
              >
                {isDownloading ? (
                  <>
                    <Loader2
                      style={{ width: 11, height: 11 }}
                      className="animate-spin"
                    />{" "}
                    Memproses...
                  </>
                ) : (
                  <>
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Unduh PDF
                  </>
                )}
              </button>

              <a
                href={`https://wa.me/${settings.storePhone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline-bp"
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "10px 12px",
                  borderRadius: 3,
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10,
                  fontWeight: 500,
                  cursor: "pointer",
                  border: "1.5px solid var(--ink-faint)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  background: "transparent",
                  color: "var(--ink)",
                  textDecoration: "none",
                }}
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                WhatsApp
              </a>
            </div>
          </div>
        </div>
        {/* /receipt-content */}
      </div>
    </>
  );
}
