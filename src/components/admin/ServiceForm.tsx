"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/utils/supabase/client";
import { Service } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useMemo } from "react";
import { Loader2, Plus, Upload } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Nama layanan harus diisi"),
  category: z.string().min(2, "Kategori harus diisi"),
  price: z.coerce.number().min(1, "Harga harus lebih dari 0"),
  unit: z.string().min(1, "Satuan harus diisi (e.g. kg, pcs)"),
  description: z.string().optional(),
  image_url: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ServiceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialData?: any;
}

export function ServiceForm({
  open,
  onOpenChange,
  onSuccess,
  initialData,
}: ServiceFormProps) {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const supabase = useMemo(() => createClient(), []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: "",
      category: "Cuci Komplit",
      price: 0,
      unit: "kg",
      description: "",
      image_url: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        category: initialData.category,
        price: initialData.price,
        unit: initialData.unit,
        description: initialData.description || "",
        image_url: initialData.image_url || "",
      });
    } else {
      form.reset({
        name: "",
        category: "Cuci Komplit",
        price: 0,
        unit: "kg",
        description: "",
        image_url: "",
      });
      setImageFile(null);
    }
  }, [initialData, form, open]);

  async function uploadImage(file: File): Promise<string | null> {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("service-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("service-images")
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  }

  async function onSubmit(values: FormValues) {
    setLoading(true);
    try {
      let imageUrl = values.image_url;

      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile);
        if (uploadedUrl) imageUrl = uploadedUrl;
      }

      if (initialData) {
        const { error } = await supabase
          .from("services")
          .update({
            name: values.name,
            category: values.category,
            price: values.price,
            unit: values.unit,
            description: values.description,
            image_url: imageUrl,
          })
          .eq("id", initialData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("services").insert([
          {
            name: values.name,
            category: values.category,
            price: values.price,
            unit: values.unit,
            description: values.description,
            image_url: imageUrl,
          },
        ]);
        if (error) throw error;
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error saving service:", error);
      alert(error.message || "Gagal menyimpan layanan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-slate-900/95 backdrop-blur-xl border border-white/10 text-white rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            {initialData ? "Edit Layanan" : "Tambah Layanan Baru"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-400">Nama Layanan</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Cuci Komplit"
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
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-400">Kategori</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Satuan"
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
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-400">Satuan</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. kg / pcs"
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
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-400">Harga (Rp)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="5000"
                      {...field}
                      className="bg-slate-800/50 border-white/10 focus:border-cyan-500/50 font-mono"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-400">
                    Deskripsi (Opsional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Keterangan singkat..."
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
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-400">
                    Gambar (Opsional)
                  </FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          placeholder="https://..."
                          {...field}
                          className="bg-slate-800/50 border-white/10 focus:border-cyan-500/50 pl-9"
                        />
                        <Upload className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      </div>
                      <div className="relative">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="border-white/10 bg-white/5 hover:bg-white/10"
                        >
                          <Plus className="w-4 h-4 text-slate-400" />
                        </Button>
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setImageFile(file);
                              // Optional: auto-upload logic could go here
                            }
                          }}
                        />
                      </div>
                    </div>
                  </FormControl>
                  {imageFile && (
                    <p className="text-xs text-emerald-400 mt-1">
                      File terpilih: {imageFile.name}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Layanan"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
