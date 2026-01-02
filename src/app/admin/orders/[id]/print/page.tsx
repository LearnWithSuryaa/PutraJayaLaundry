"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Order } from "@/types";
import { Loader2 } from "lucide-react";

export default function PrintOrderPage() {
  const params = useParams();
  const id = params?.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

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
    <div className="w-[58mm] p-3 bg-white text-black font-mono text-[10px] leading-tight">
      {/* Header - Company Info */}
      <div className="text-center mb-3">
        <h1 className="font-bold text-[16px] uppercase tracking-wide mb-1">
          PUTRAJAYA LAUNDRY
        </h1>
        <div className="text-[9px] leading-relaxed">
          <p>Jl. Kelapa No. 141 RT/RW 07/02</p>
          <p>Kabunan, Balen, Bojonegoro</p>
          <p className="mt-1">Telp/WA: 0812-3205-2919</p>
        </div>
      </div>

      <div className="border-t border-b border-black border-dashed py-2 mb-3">
        <p className="text-center font-bold text-[11px]">NOTA TRANSAKSI</p>
      </div>

      {/* Transaction Info */}
      <div className="mb-3 text-[9px] space-y-0.5">
        <div className="flex justify-between">
          <span className="font-semibold">No. Nota</span>
          <span>#{order.id}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Tanggal</span>
          <span>
            {new Date(order.created_at).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Waktu</span>
          <span>
            {new Date(order.created_at).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Pelanggan</span>
          <span className="uppercase">{order.customer_name}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">No. HP</span>
          <span>{order.customer_phone}</span>
        </div>
      </div>

      {/* Items Table */}
      <div className="border-t border-black pt-2 mb-2">
        <table className="w-full text-[9px]">
          <thead>
            <tr className="border-b border-black border-dashed">
              <th className="text-left py-1 font-semibold">ITEM</th>
              <th className="text-center py-1 font-semibold">QTY</th>
              <th className="text-right py-1 font-semibold">HARGA</th>
            </tr>
          </thead>
          <tbody>
            {(order.order_items || []).map((item, idx) => (
              <tr key={idx} className="border-b border-dashed border-gray-300">
                <td className="py-1.5 pr-1">
                  <div className="font-medium">
                    {item.service_name || item.name}
                  </div>
                  <div className="text-[8px] text-gray-600">
                    @Rp{" "}
                    {Number(item.service_price || 0).toLocaleString("id-ID")} /{" "}
                    {item.unit}
                  </div>
                </td>
                <td className="text-center py-1.5 whitespace-nowrap">
                  {item.quantity} {item.unit}
                </td>
                <td className="text-right py-1.5 font-medium">
                  Rp{" "}
                  {(
                    Number(item.service_price || 0) * Number(item.quantity)
                  ).toLocaleString("id-ID")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Total Section */}
      <div className="border-t border-black pt-2 mb-3">
        <div className="flex justify-between items-center mb-2">
          <span className="font-bold text-[11px]">TOTAL PEMBAYARAN</span>
          <span className="font-bold text-[12px]">
            Rp {order.total_price.toLocaleString("id-ID")}
          </span>
        </div>
        <div className="flex justify-between items-center text-[9px]">
          <span className="font-semibold">Status Pembayaran</span>
          <span
            className={`font-bold uppercase ${
              order.status === "paid" || order.status === "completed"
                ? "text-black"
                : "text-gray-600"
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
        <div className="border-t border-dashed border-gray-400 pt-2 mb-3">
          <p className="font-semibold text-[9px] mb-0.5">Catatan:</p>
          <p className="text-[8px] italic">{order.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-black pt-2.5 mt-3">
        <p className="text-center font-bold text-[11px] mb-2.5">TERIMA KASIH</p>

        {/* Terms and Conditions */}
        <div className="text-[8px] leading-relaxed mb-2.5">
          <p className="font-semibold mb-1 text-center">
            Syarat dan Ketentuan:
          </p>
          <div className="space-y-0.5 text-left px-1">
            <p>1. Barang tidak diambil 30 hari menjadi hak laundry</p>
            <p>2. Komplain maksimal 2x24 jam setelah pengambilan</p>
          </div>
        </div>

        {/* Customer Service */}
        <div className="border-t border-dashed border-gray-400 pt-2 text-center">
          <p className="text-[8px] font-semibold mb-0.5">Layanan Pelanggan</p>
          <p className="text-[8px]">www.putrajayalaundry.com</p>
          <p className="text-[8px] mt-1">WA: 0812-3205-2919</p>
        </div>

        {/* Print timestamp */}
        <div className="mt-2 pt-2 border-t border-dashed border-gray-300">
          <p className="text-center text-[7px] text-gray-500">
            Dicetak: {new Date().toLocaleString("id-ID")}
          </p>
        </div>
      </div>

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
          * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}
