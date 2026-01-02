"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Order } from "@/types";
import { Loader2 } from "lucide-react";

export default function PrintOrderPage() {
  const params = useParams();
  const id = params?.id as string; // Access ID safely
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
        // Optional: window.close(); after print? verifying user pref first.
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
    <div className="w-[58mm] p-2 bg-white text-black font-mono text-[10px] leading-tight">
      {/* Header */}
      <div className="text-center border-b border-black pb-2 mb-2">
        <h1 className="font-bold text-[14px] uppercase">PutraJaya Laundry</h1>
        <p>Jl. Kelapa Nomor 141 RT/RW 07/02 Kabunan, Balen, Bojonegoro</p>
        <p>WA: 0812-3205-2919</p>
      </div>

      {/* Meta */}
      <div className="mb-2">
        <p>No Nota: #{order.id}</p>
        <p>Tgl: {new Date(order.created_at).toLocaleString("id-ID")}</p>
        <p>Plg: {order.customer_name}</p>
      </div>

      {/* Items */}
      <div className="border-b border-black pb-2 mb-2">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-black border-dashed">
              <th className="py-1">Item</th>
              <th className="text-right py-1">Jml</th>
              <th className="text-right py-1">Total</th>
            </tr>
          </thead>
          <tbody>
            {(order.order_items || []).map((item, idx) => (
              <tr key={idx}>
                <td className="py-1 pr-1 truncate max-w-[80px]">
                  {item.service_name || item.name}
                </td>
                <td className="text-right py-1 whitespace-nowrap">
                  {item.quantity} {item.unit}
                </td>
                <td className="text-right py-1">
                  {(
                    Number(item.service_price || 0) * Number(item.quantity)
                  ).toLocaleString("id-ID")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals & Status */}
      <div className="mb-4 space-y-1 border-b border-black pb-2 border-dashed">
        <div className="flex justify-between font-bold text-[12px]">
          <span>TOTAL:</span>
          <span>Rp {order.total_price.toLocaleString("id-ID")}</span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span>STATUS:</span>
          <span
            className={
              order.status === "paid" ? "font-bold uppercase" : "uppercase"
            }
          >
            {order.status === "paid" ? "LUNAS (PAID)" : "BELUM LUNAS"}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center border-t border-black pt-2">
        <p className="font-bold mb-1">TERIMA KASIH</p>
        <p className="text-[9px] mb-1">
          Barang yang tidak diambil &gt; 30 hari bukan tanggung jawab kami.
        </p>
        <p className="text-[9px] italic">
          Info promo & layanan: <br />
          www.putrajayalaundry.com
        </p>
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
      `}</style>
    </div>
  );
}
