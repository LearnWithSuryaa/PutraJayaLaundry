"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Order } from "@/types";
import { calculateRoundedPrice } from "@/utils/pricing";
import { Loader2 } from "lucide-react";

export default function PrintOrderPage() {
  const params = useParams();
  const id = params?.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Settings State
  const [settings, setSettings] = useState({
    storeName: "PUTRAJAYA LAUNDRY",
    storeAddress: "Jl. Kelapa No. 141 RT/RW 07/02\nKabunan, Balen, Bojonegoro",
    storePhone: "0812-3205-2919",
    receiptHeader: "TERIMA KASIH",
    receiptFooter:
      "1. Barang tidak diambil 30 hari menjadi hak laundry\n2. Komplain maksimal 2x24 jam setelah pengambilan",
  });

  const supabase = createClient();

  useEffect(() => {
    const saved = localStorage.getItem("rynse_settings");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSettings({
        storeName: parsed.storeName || "PUTRAJAYA LAUNDRY",
        storeAddress:
          parsed.storeAddress ||
          "Jl. Kelapa No. 141 RT/RW 07/02\nKabunan, Balen, Bojonegoro",
        storePhone: parsed.storePhone || "0812-3205-2919",
        receiptHeader: parsed.receiptHeader || "TERIMA KASIH",
        receiptFooter:
          parsed.receiptFooter ||
          "1. Barang tidak diambil 30 hari menjadi hak laundry\n2. Komplain maksimal 2x24 jam setelah pengambilan",
      });
    }
  }, []);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("id", id)
        .single();

      if (data) setOrder(data);
      setLoading(false);
    };

    fetchOrder();
  }, [id]);

  useEffect(() => {
    if (!loading && order) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [loading, order]);

  if (loading)
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin" />
      </div>
    );
  if (!order) return <div className="text-center p-8">Order not found</div>;

  return (
    <div className="w-[58mm] min-h-screen bg-white text-black p-2 font-sans text-[10px] leading-tight">
      <style jsx global>{`
        @page {
          size: 58mm auto;
          margin: 0;
        }
        body {
          margin: 0;
          background: white;
        }
        @media print {
          body {
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>

      {/* Header - Company Info */}
      <div className="text-center mb-2">
        <h1 className="font-extrabold text-[14px] uppercase tracking-wider mb-0.5">
          {settings.storeName}
        </h1>
        <div className="text-[9px] font-medium leading-snug whitespace-pre-line text-gray-800">
          {settings.storeAddress}
          <p className="mt-0.5">Telp/WA: {settings.storePhone}</p>
        </div>
      </div>

      <div className="border-b-2 border-black border-dashed pb-1 mb-2">
        <p className="text-center font-bold text-[10px] tracking-wide">
          NOTA TRANSAKSI
        </p>
      </div>

      {/* Transaction Info */}
      <div className="mb-2 text-[9px] space-y-0.5 font-mono">
        <div className="flex justify-between">
          <span>No. Nota:</span>
          <span className="font-bold">#{order.id}</span>
        </div>
        <div className="flex justify-between">
          <span>Tanggal:</span>
          <span>
            {new Date(order.created_at).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Waktu:</span>
          <span>
            {new Date(order.created_at).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Plg:</span>
          <span className="uppercase font-bold truncate max-w-[120px] text-right">
            {order.customer_name}
          </span>
        </div>
        <div className="flex justify-between">
          <span>HP:</span>
          <span>{order.customer_phone}</span>
        </div>
      </div>

      {/* Items Table */}
      <div className="border-t-2 border-black border-dashed pt-1 mb-2">
        <table className="w-full text-[9px] font-mono leading-tight">
          <thead>
            <tr className="border-b border-black border-dashed">
              <th className="text-left py-1 w-full" colSpan={2}>RINCIAN</th>
            </tr>
          </thead>
          <tbody>
            {(order.order_items || []).map((item, idx) => {
              const rawTotal = Number(item.service_price || 0) * Number(item.quantity);
              const roundedTotal = calculateRoundedPrice(
                Number(item.service_price),
                Number(item.quantity)
              );
              const isRounded = rawTotal !== roundedTotal;

              return (
                <tr key={idx}>
                  <td colSpan={2} className="py-1 align-top">
                    {/* Line 1: Item Name */}
                    <div className="font-bold uppercase truncate w-full mb-0.5">
                      {item.service_name || item.name}
                    </div>

                    {/* Line 2: Qty x Price ... Total */}
                    <div className="flex justify-between text-[9px] font-mono pl-2">
                      <span>
                        {item.quantity} {item.unit} x {Number(item.service_price || 0).toLocaleString("id-ID")}
                      </span>
                      <span className="font-bold">
                        {roundedTotal.toLocaleString("id-ID")}
                      </span>
                    </div>

                    {/* Line 3: Rounding Detail (if any) */}
                    {isRounded && (
                      <div className="text-[8px] text-gray-500 italic pl-2 mt-0.5">
                        (Hitungan: {rawTotal.toLocaleString("id-ID")} menjadi {roundedTotal.toLocaleString("id-ID")})
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Total Section */}
      <div className="border-t-2 border-black border-dashed pt-1 mb-3 font-mono">
        <div className="flex justify-between items-center mb-1 text-[11px]">
          <span className="font-bold">TOTAL</span>
          <span className="font-extrabold text-[12px]">
            Rp {order.total_price.toLocaleString("id-ID")}
          </span>
        </div>
        <div className="flex justify-between items-center text-[9px]">
          <span className="font-semibold">STATUS</span>
          <span
            className={`font-bold uppercase border px-1 rounded ${order.status === "paid" || order.status === "completed"
              ? "border-black text-black"
              : "border-gray-400 text-gray-500"
              }`}
          >
            {order.status === "paid" || order.status === "completed"
              ? "LUNAS"
              : "BELUM LUNAS"}
          </span>
        </div>
      </div>

      {/* Notes Section */}
      {order.notes && (
        <div className="border-t border-black border-dashed pt-1 mb-2">
          <p className="font-bold text-[9px]">Catatan:</p>
          <p className="text-[9px] italic leading-tight">{order.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="border-t-2 border-black border-dashed pt-2 mt-2 text-center">
        <p className="font-bold text-[10px] mb-1 uppercase">
          {settings.receiptHeader}
        </p>

        {/* Terms and Conditions */}
        <div className="text-[8px] leading-snug mb-2 text-justify">
          <p className="font-bold text-center mb-0.5">Syarat & Ketentuan:</p>
          <div className="whitespace-pre-line px-1">
            {settings.receiptFooter}
          </div>
        </div>

        {/* Small branding */}
        <div className="mt-2 pt-1 border-t border-gray-300">
          <p className="text-[8px] font-mono">
            {new Date().toLocaleString("id-ID")}
          </p>
          <p className="text-[7px] text-gray-500 mt-0.5">Powered by Rynse</p>
        </div>
      </div>
    </div>
  );
}
