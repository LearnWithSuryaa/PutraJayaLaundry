"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { InventoryItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Trash2,
  Edit2,
  Loader2,
  AlertTriangle,
  Search,
  PackageCheck,
} from "lucide-react";
import { InventoryForm } from "@/components/admin/InventoryForm";
import { Badge } from "@/components/ui/badge";

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("inventory_items")
      .select("*")
      .order("stock", { ascending: true }) // Prioritize low stock visibility
      .range(0, 499); // Reduced to 500 items for better performance
    if (data) {
      setItems(data);
      setFilteredItems(data);
    }
    setIsLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Handle Search - Memoized for performance
  useEffect(() => {
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = items.filter(
      (item) =>
        item.name.toLowerCase().includes(lowerQuery) ||
        item.category.toLowerCase().includes(lowerQuery)
    );
    setFilteredItems(filtered);
  }, [searchQuery, items]);

  const handleDelete = useCallback(
    async (id: number) => {
      if (confirm("Yakin ingin menghapus barang ini?")) {
        await supabase.from("inventory_items").delete().eq("id", id);
        fetchItems();
      }
    },
    [supabase, fetchItems]
  );

  const handleEdit = useCallback((item: InventoryItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  }, []);

  const handleFormOpenChange = useCallback((open: boolean) => {
    setIsFormOpen(open);
    if (!open) setEditingItem(undefined);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground/90 flex items-center gap-3">
            <PackageCheck className="text-cyan-400" /> Manajemen Stok
          </h1>
          <p className="text-muted-foreground">
            Monitor persediaan bahan baku laundry.
          </p>
        </div>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="rounded-full shadow-lg shadow-cyan-500/20 bg-cyan-600 hover:bg-cyan-500"
        >
          <Plus className="mr-2 h-4 w-4" /> Tambah Barang
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
        <Input
          placeholder="Cari barang atau kategori..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-slate-900/40 border-white/10 rounded-xl"
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-md overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="hover:bg-transparent border-b border-white/10">
              <TableHead className="text-slate-300">Nama Barang</TableHead>
              <TableHead className="text-slate-300">Kategori</TableHead>
              <TableHead className="text-slate-300">Stok</TableHead>
              <TableHead className="text-slate-300">Status</TableHead>
              <TableHead className="text-right text-slate-300">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex justify-center items-center gap-2 text-muted-foreground">
                    <Loader2 className="animate-spin h-5 w-5" /> Memuat data...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center h-48 text-muted-foreground"
                >
                  <p>Tidak ada barang yang ditemukan.</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => {
                const isLowStock = item.stock <= item.min_stock;
                return (
                  <TableRow
                    key={item.id}
                    className="hover:bg-white/5 transition-colors border-b border-white/5"
                  >
                    <TableCell className="font-medium text-base text-white">
                      {item.name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-slate-800/50 text-slate-400 border-white/10"
                      >
                        {item.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-lg font-bold">
                      <span
                        className={
                          isLowStock ? "text-rose-400" : "text-emerald-400"
                        }
                      >
                        {item.stock}
                      </span>
                      <span className="text-sm font-normal text-slate-500 ml-1">
                        {item.unit}
                      </span>
                    </TableCell>
                    <TableCell>
                      {isLowStock ? (
                        <div className="flex items-center gap-2 text-rose-400 text-xs font-bold animate-pulse">
                          <AlertTriangle className="h-3 w-3" />
                          LOW STOCK
                        </div>
                      ) : (
                        <div className="text-emerald-500 text-xs font-medium">
                          Aman
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-cyan-400 hover:bg-cyan-500/10"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <InventoryForm
        open={isFormOpen}
        onOpenChange={handleFormOpenChange}
        onSuccess={fetchItems}
        initialData={editingItem}
      />
    </div>
  );
}
