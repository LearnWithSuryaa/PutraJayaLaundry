"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Plus, Minus } from "lucide-react";
import { InventoryItem } from "@/types";
import { toast } from "sonner";

interface StockAdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  item: InventoryItem | undefined;
  defaultType?: "restock" | "usage";
}

export function StockAdjustmentDialog({
  open,
  onOpenChange,
  onSuccess,
  item,
  defaultType = "restock",
}: StockAdjustmentDialogProps) {
  const [amount, setAmount] = useState<string>("");
  const [type, setType] = useState<"restock" | "usage">(defaultType);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  // Reset form when dialog opens/changes
  useEffect(() => {
    if (open) {
      setAmount("");
      setNotes("");
      setType(defaultType);
    }
  }, [open, defaultType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    const qty = parseInt(amount);
    if (isNaN(qty) || qty <= 0) {
      toast.error("Jumlah harus lebih dari 0");
      return;
    }

    setLoading(true);
    try {
      const isRestock = type === "restock";
      const newStock = isRestock ? item.stock + qty : item.stock - qty;
      const finalStock = newStock < 0 ? 0 : newStock; // Prevent negative stock

      // 1. Update Inventory Item
      const { error: updateError } = await supabase
        .from("inventory_items")
        .update({ stock: finalStock })
        .eq("id", item.id);

      if (updateError) throw updateError;

      // 2. Insert Log
      const { error: logError } = await supabase.from("inventory_logs").insert({
        inventory_item_id: item.id,
        change_amount: isRestock ? qty : -qty,
        final_stock: finalStock,
        change_type: type,
        notes: notes || (isRestock ? "Quick Restock" : "Quick Usage"),
      });

      if (logError) throw logError;

      toast.success(
        `Berhasil ${isRestock ? "menambah" : "mengurangi"} stok ${item.name}`
      );
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error adjusting stock:", error);
      toast.error("Gagal update stok: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px] bg-slate-900/95 backdrop-blur-xl border-white/10 text-white rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            {type === "restock" ? (
              <Plus className="text-emerald-400" />
            ) : (
              <Minus className="text-rose-400" />
            )}
            {type === "restock" ? "Tambah Stok" : "Kurangi Stok"}
          </DialogTitle>
          <p className="text-sm text-slate-400">
            Update stok untuk{" "}
            <span className="text-white font-medium">{item.name}</span>
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Quick Type Selection */}
          <RadioGroup
            defaultValue={type}
            onValueChange={(v: "restock" | "usage") => setType(v)}
            className="grid grid-cols-2 gap-2 mb-4"
          >
            <div>
              <RadioGroupItem
                value="restock"
                id="restock"
                className="peer sr-only"
              />
              <Label
                htmlFor="restock"
                className="flex flex-col items-center justify-between rounded-md border-2 border-white/10 bg-slate-800/50 p-3 hover:bg-slate-800 hover:text-white peer-data-[state=checked]:border-emerald-500 peer-data-[state=checked]:text-emerald-400 cursor-pointer transition-all"
              >
                <Plus className="mb-2 h-5 w-5" />
                <span className="text-xs font-semibold">Restock (+)</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem
                value="usage"
                id="usage"
                className="peer sr-only"
              />
              <Label
                htmlFor="usage"
                className="flex flex-col items-center justify-between rounded-md border-2 border-white/10 bg-slate-800/50 p-3 hover:bg-slate-800 hover:text-white peer-data-[state=checked]:border-rose-500 peer-data-[state=checked]:text-rose-400 cursor-pointer transition-all"
              >
                <Minus className="mb-2 h-5 w-5" />
                <span className="text-xs font-semibold">Pakai (-)</span>
              </Label>
            </div>
          </RadioGroup>

          <div className="space-y-2">
            <Label>Jumlah {item.unit}</Label>
            <Input
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-slate-800/50 border-white/10 text-lg font-bold text-center h-12"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-400">Catatan (Opsional)</Label>
            <Input
              placeholder={
                type === "restock" ? "Beli baru..." : "Rusak/Terpakai..."
              }
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-slate-800/50 border-white/10"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="submit"
              disabled={loading || !amount || parseInt(amount) <= 0}
              className={`w-full font-bold h-11 transition-all shadow-lg ${
                type === "restock"
                  ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20"
                  : "bg-rose-600 hover:bg-rose-500 shadow-rose-500/20"
              }`}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : type === "restock" ? (
                "Simpan Restock"
              ) : (
                "Simpan Pengurangan"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
