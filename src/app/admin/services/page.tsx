"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Service } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Edit2, Loader2 } from "lucide-react";
import { ServiceForm } from "@/components/admin/ServiceForm";

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(false);

  const fetchServices = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("services")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setServices(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Apakah anda yakin ingin menghapus layanan ini?")) {
      try {
        const { error, count } = await supabase
          .from("services")
          .delete({ count: "exact" })
          .eq("id", id);

        if (error) throw error;

        if (count === 0) {
          alert(
            "Gagal menghapus: Item tidak ditemukan atau izin ditolak (RLS)."
          );
          return;
        }

        fetchServices();
      } catch (error) {
        console.error("Error deleting service:", error);
        alert("Terjadi kesalahan saat menghapus layanan.");
      }
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setIsFormOpen(true);
  };

  const handleFormOpenChange = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) setEditingService(undefined); // Reset editing state when closed
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground/90">
            Manajemen Layanan
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Atur katalog harga dan kategori layanan.
          </p>
        </div>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="w-full md:w-auto rounded-xl shadow-lg shadow-cyan-500/20 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 min-h-[48px] font-bold text-white transition-all hover:scale-105 hover:shadow-cyan-500/40"
        >
          <Plus className="mr-2 h-5 w-5" /> Tambah Layanan
        </Button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-md overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="hover:bg-transparent border-b border-white/10">
              <TableHead className="text-slate-300">Nama Layanan</TableHead>
              <TableHead className="text-slate-300">Kategori</TableHead>
              <TableHead className="text-slate-300">Harga</TableHead>
              <TableHead className="text-right text-slate-300">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <div className="flex justify-center items-center gap-2 text-muted-foreground">
                    <Loader2 className="animate-spin h-5 w-5" /> Memuat data...
                  </div>
                </TableCell>
              </TableRow>
            ) : services.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center h-48 text-muted-foreground"
                >
                  <p>Belum ada data layanan</p>
                </TableCell>
              </TableRow>
            ) : (
              services.map((service) => (
                <TableRow
                  key={service.id}
                  className="hover:bg-white/5 transition-colors border-b border-white/5"
                >
                  <TableCell className="font-medium text-base">
                    {service.name}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                      {service.category}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-foreground/80">
                    Rp {service.price.toLocaleString()} / {service.unit}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                      onClick={() => handleEdit(service)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(service.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ServiceForm
        open={isFormOpen}
        onOpenChange={handleFormOpenChange}
        onSuccess={fetchServices}
        initialData={editingService}
      />
    </div>
  );
}
