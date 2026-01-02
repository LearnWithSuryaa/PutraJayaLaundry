"use client";

import { useForm, useFieldArray } from "react-hook-form";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Plus, Trash2, Loader2, Save } from "lucide-react";
import { Service } from "@/types";

const formSchema = z.object({
  customer_name: z.string().min(2, "Nama harus diisi"),
  customer_phone: z.string().min(10, "Nomor HP valid"),
  status: z.enum(["pending", "processing", "completed", "paid"]),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      service_id: z.string().optional(),
      name: z.string().min(1, "Pilih Layanan"),
      quantity: z.coerce.number().min(1, "Minimal 1"),
      price: z.coerce.number().min(0),
      unit: z.string().min(1),
    })
  ),
});

type FormValues = z.infer<typeof formSchema>;

interface OrderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function OrderForm({ open, onOpenChange, onSuccess }: OrderFormProps) {
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const supabase = useMemo(() => createClient(), []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      customer_name: "",
      customer_phone: "",
      status: "pending",
      notes: "",
      items: [{ name: "", quantity: 1, price: 0, unit: "kg" }],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Fetch Services on Mount
  useEffect(() => {
    const fetchServices = async () => {
      const { data } = await supabase
        .from("services")
        .select("*")
        .order("name");
      if (data) setServices(data as Service[]);
    };
    if (open) fetchServices(); // Only fetch when open
  }, [open, supabase]);

  // Handle Service Selection Change - Memoized to prevent re-creation
  const handleServiceChange = useCallback(
    (index: number, serviceName: string) => {
      const selectedService = services.find((s) => s.name === serviceName);
      if (selectedService) {
        const currentQty = form.getValues(`items.${index}.quantity`) || 1;
        update(index, {
          service_id: selectedService.id.toString(),
          name: selectedService.name,
          price: selectedService.price,
          unit: selectedService.unit,
          quantity: currentQty,
        });
      }
    },
    [services, form, update]
  );

  async function onSubmit(values: FormValues) {
    setLoading(true);
    // Calculate total on submission
    const total_price = values.items.reduce(
      (acc, curr) => acc + curr.price * curr.quantity,
      0
    );

    try {
      // 1. Insert into Orders Table
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            customer_name: values.customer_name,
            customer_phone: values.customer_phone,
            status: values.status,
            total_price,
            notes: values.notes,
            items: values.items, // Legacy support: satisfy NOT NULL constraint
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;
      if (!orderData) throw new Error("No order data returned");

      // 2. Insert Items into order_items Table
      const orderItems = values.items.map((item) => ({
        order_id: orderData.id,
        service_name: item.name, // Snapshot name
        service_price: item.price, // Snapshot price
        quantity: item.quantity,
        unit: item.unit,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      onSuccess();
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error creating order:", error);
      alert(error.message || "Gagal membuat order");
    } finally {
      setLoading(false);
    }
  }

  // Calculate Running Total - Memoized for performance
  const watchedItems = form.watch("items");
  const runningTotal = useMemo(
    () =>
      watchedItems.reduce(
        (acc, curr) =>
          acc + (Number(curr.price) || 0) * (Number(curr.quantity) || 0),
        0
      ),
    [watchedItems]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full md:max-w-[600px] h-full md:h-auto bg-slate-900/95 backdrop-blur-xl border-0 md:border md:border-white/10 text-white md:rounded-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            Buat Order Baru
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customer_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-400">
                      Nama Pelanggan
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        {...field}
                        className="bg-slate-800/50 border-white/10 focus:border-cyan-500/50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customer_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-400">WhatsApp</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0812..."
                        {...field}
                        className="bg-slate-800/50 border-white/10 focus:border-cyan-500/50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-400">
                    Catatan (Detail Order)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contoh: Titip di satpam, jangan dikasih pewangi..."
                      {...field}
                      className="bg-slate-800/50 border-white/10 focus:border-cyan-500/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-semibold text-slate-300">
                  Detail Item
                </h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({ name: "", quantity: 1, price: 0, unit: "kg" })
                  }
                  className="bg-white/5 border-white/10 hover:bg-white/10 text-cyan-400 hover:text-cyan-300"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Item
                </Button>
              </div>

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-4 rounded-xl bg-slate-800/30 border border-white/5 space-y-3"
                >
                  {/* Row 1: Service Selection (Full Width) */}
                  <FormField
                    control={form.control}
                    name={`items.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between">
                          <FormLabel className="text-xs text-slate-500">
                            Layanan
                          </FormLabel>
                        </div>
                        <Select
                          onValueChange={(value) =>
                            handleServiceChange(index, value)
                          }
                          defaultValue={field.name}
                          value={form.watch(`items.${index}.name`)}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-slate-900/50 border-white/10 h-10 w-full">
                              <SelectValue placeholder="Pilih Layanan..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-slate-900 border-white/10 max-h-[200px]">
                            {services.map((s) => (
                              <SelectItem
                                key={s.id}
                                value={s.name}
                                className="focus:bg-white/10 focus:text-white"
                              >
                                <span className="font-medium text-white">
                                  {s.name}
                                </span>
                                <span className="text-slate-500 ml-2 text-xs">
                                  (Rp {s.price.toLocaleString()}/{s.unit})
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  {/* Row 2: Qty, Price Info, Delete */}
                  <div className="flex items-center gap-3">
                    <div className="w-24">
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-slate-500">
                              Qty
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                {...field}
                                className="bg-slate-900/50 border-white/10 h-10 text-center font-mono"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-center h-10 pb-1">
                      <span className="text-xs text-slate-500">
                        Total Harga Item
                      </span>
                      <span className="text-sm font-mono text-emerald-400">
                        {form.watch(`items.${index}.price`)
                          ? `Rp ${(
                              (Number(form.watch(`items.${index}.price`)) ||
                                0) *
                              (Number(form.watch(`items.${index}.quantity`)) ||
                                1)
                            ).toLocaleString("id-ID")}`
                          : "-"}
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="bg-rose-500/10 text-rose-400 hover:text-white hover:bg-rose-500 h-10 w-10 shrink-0 border border-rose-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-4 flex justify-between items-center">
              <span className="text-slate-400">Total Estimasi</span>
              <span className="text-2xl font-bold text-emerald-400">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  maximumFractionDigits: 0,
                }).format(runningTotal)}
              </span>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="text-slate-400 hover:bg-white/5"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Simpan Order
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
