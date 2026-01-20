"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface ExpenseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialData?: {
    id: number;
    amount: number;
    category: string;
    description: string;
    expense_date: string;
    payment_method: string;
  };
}

const EXPENSE_CATEGORIES = [
  "Bahan Baku",
  "Gaji Karyawan",
  "Utilitas (Listrik, Air)",
  "Maintenance",
  "Marketing",
  "Transport",
  "Lainnya",
];

const PAYMENT_METHODS = ["Tunai", "Transfer Bank", "E-Wallet", "Debit Card"];

export function ExpenseForm({
  open,
  onOpenChange,
  onSuccess,
  initialData,
}: ExpenseFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    description: "",
    expense_date: new Date().toISOString().split("T")[0],
    payment_method: "",
  });

  const supabase = createClient();

  useEffect(() => {
    if (initialData) {
      setFormData({
        amount: initialData.amount
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, "."),
        category: initialData.category,
        description: initialData.description || "",
        expense_date: initialData.expense_date.split("T")[0],
        payment_method: initialData.payment_method || "",
      });
    } else {
      setFormData({
        amount: "",
        category: "",
        description: "",
        expense_date: new Date().toISOString().split("T")[0],
        payment_method: "",
      });
    }
  }, [initialData, open]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove non-digit chars
    const rawValue = e.target.value.replace(/\D/g, "");
    // Format with dots
    const formattedValue = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    setFormData({ ...formData, amount: formattedValue });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      amount: parseFloat(formData.amount.replace(/\./g, "")) || 0,
      category: formData.category,
      description: formData.description,
      expense_date: formData.expense_date,
      payment_method: formData.payment_method,
    };

    try {
      if (initialData) {
        // Update existing expense
        await supabase.from("expenses").update(data).eq("id", initialData.id);
      } else {
        // Create new expense
        await supabase.from("expenses").insert([data]);
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving expense:", error);
      alert("Gagal menyimpan pengeluaran");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {initialData ? "Edit Pengeluaran" : "Tambah Pengeluaran"}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {initialData
              ? "Perbarui data pengeluaran"
              : "Catat pengeluaran operasional bisnis"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-slate-300">
              Jumlah <span className="text-rose-400">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                Rp
              </span>
              <Input
                id="amount"
                type="text"
                required
                value={formData.amount}
                onChange={handleAmountChange}
                className="pl-12 bg-slate-800/50 border-white/10 text-white h-12 text-lg font-semibold"
                placeholder="0"
                autoComplete="off"
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-slate-300">
              Kategori <span className="text-rose-400">*</span>
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value })
              }
              required
            >
              <SelectTrigger className="bg-slate-800/50 border-white/10 text-white h-12">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10 text-white">
                {EXPENSE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="expense_date" className="text-slate-300">
              Tanggal <span className="text-rose-400">*</span>
            </Label>
            <Input
              id="expense_date"
              type="date"
              required
              value={formData.expense_date}
              onChange={(e) =>
                setFormData({ ...formData, expense_date: e.target.value })
              }
              className="bg-slate-800/50 border-white/10 text-white h-12"
            />
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="payment_method" className="text-slate-300">
              Metode Pembayaran
            </Label>
            <Select
              value={formData.payment_method}
              onValueChange={(value) =>
                setFormData({ ...formData, payment_method: value })
              }
            >
              <SelectTrigger className="bg-slate-800/50 border-white/10 text-white h-12">
                <SelectValue placeholder="Pilih metode" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10 text-white">
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-300">
              Deskripsi
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="bg-slate-800/50 border-white/10 text-white min-h-[80px] resize-none"
              placeholder="Catatan tambahan (opsional)"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-white/10 text-slate-300 hover:bg-white/5 h-11"
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white h-11 font-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : initialData ? (
                "Update"
              ) : (
                "Simpan"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
