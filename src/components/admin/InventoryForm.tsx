"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect, useMemo } from "react";
import { Loader2, Plus, ArrowUpCircle } from "lucide-react";
import { InventoryItem } from "@/types";

const formSchema = z.object({
  name: z.string().min(2, "Nama barang minimal 2 karakter"),
  stock: z.coerce.number().min(0, "Stok tidak boleh minus"),
  unit: z.string().min(1, "Satuan harus diisi"),
  min_stock: z.coerce.number().min(0),
  category: z.string().min(1, "Kategori harus dipilih"),
});

type FormValues = z.infer<typeof formSchema>;

interface InventoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialData?: InventoryItem;
}

export function InventoryForm({
  open,
  onOpenChange,
  onSuccess,
  initialData,
}: InventoryFormProps) {
  const [loading, setLoading] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any, // Cast to any to resolve strict type mismatch with RHF
    defaultValues: {
      name: "",
      stock: 0,
      unit: "pcs",
      min_stock: 5,
      category: "Deterjen",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        stock: initialData.stock,
        unit: initialData.unit,
        min_stock: initialData.min_stock,
        category: initialData.category,
      });
    } else {
      form.reset({
        name: "",
        stock: 0,
        unit: "pcs",
        min_stock: 5,
        category: "Deterjen",
      });
    }
  }, [initialData, form, open]);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      if (initialData) {
        // Edit Mode
        const oldStock = initialData.stock;
        const newStock = values.stock;
        const diff = newStock - oldStock;

        // update item
        const { error: updateError } = await supabase
          .from("inventory_items")
          .update(values)
          .eq("id", initialData.id);

        if (updateError) throw updateError;

        // Log if stock changed
        if (diff !== 0) {
          const changeType = diff > 0 ? "restock" : "correction"; // Assume correction/usage for negative
          await supabase.from("inventory_logs").insert({
            inventory_item_id: initialData.id,
            change_amount: diff,
            final_stock: newStock,
            change_type: changeType,
            notes: `Manual edit: ${oldStock} -> ${newStock}`,
          });
        }
      } else {
        // Create Mode
        const { data: newItem, error: createError } = await supabase
          .from("inventory_items")
          .insert(values)
          .select() // Select to get ID
          .single();

        if (createError) throw createError;

        // Log Initial Stock
        if (values.stock > 0 && newItem) {
          await supabase.from("inventory_logs").insert({
            inventory_item_id: newItem.id,
            change_amount: values.stock,
            final_stock: values.stock,
            change_type: "initial",
            notes: "Initial stock creation",
          });
        }
      }
      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error saving inventory:", error);
      alert("Gagal menyimpan data barang.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full md:max-w-[500px] h-full md:h-auto bg-slate-900/95 backdrop-blur-xl border-0 md:border md:border-white/10 text-white md:rounded-2xl max-h-screen overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            {initialData ? (
              <>
                <ArrowUpCircle className="text-emerald-400" /> Edit Barang
              </>
            ) : (
              <>
                <Plus className="text-cyan-400" /> Tambah Barang
              </>
            )}
          </DialogTitle>
          <p className="text-sm text-slate-400">
            Kelola stok inventory laundry Anda.
          </p>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 p-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Barang</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contoh: Deterjen Wangi"
                      {...field}
                      className="bg-slate-800/50 border-white/10 focus:border-cyan-500/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stok Saat Ini</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        className="bg-slate-800/50 border-white/10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Satuan</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="bg-slate-800/50 border-white/10">
                          <SelectValue placeholder="Pilih Satuan" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/10 text-white">
                          <SelectItem value="pcs">Pcs / Buah</SelectItem>
                          <SelectItem value="kg">Kilogram (kg)</SelectItem>
                          <SelectItem value="liter">Liter (l)</SelectItem>
                          <SelectItem value="pack">Pack / Bungkus</SelectItem>
                          <SelectItem value="box">Box / Dus</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="min_stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min. Stok (Alert)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        className="bg-slate-800/50 border-white/10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="bg-slate-800/50 border-white/10">
                          <SelectValue placeholder="Pilih Kategori" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/10 text-white">
                          <SelectItem value="Deterjen">
                            Deterjen & Kimia
                          </SelectItem>
                          <SelectItem value="Packaging">
                            Plastik & Packing
                          </SelectItem>
                          <SelectItem value="Perlengkapan">
                            Perlengkapan Alat
                          </SelectItem>
                          <SelectItem value="Lainnya">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold h-11 rounded-xl transition-all shadow-lg shadow-cyan-500/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Barang"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
