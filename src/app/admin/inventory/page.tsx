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
  Plus as PlusIcon,
  Minus as MinusIcon,
  Trash2,
  Edit2,
  Loader2,
  AlertTriangle,
  Search,
  PackageCheck,
} from "lucide-react";
import { InventoryForm } from "@/components/admin/InventoryForm";
import { StockAdjustmentDialog } from "@/components/admin/StockAdjustmentDialog";
import { Badge } from "@/components/ui/badge";

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | undefined>(
    undefined
  );
  const [stockAdjustItem, setStockAdjustItem] = useState<
    InventoryItem | undefined
  >(undefined);
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [stockAdjustType, setStockAdjustType] = useState<"restock" | "usage">(
    "restock"
  );
  const [isLoading, setIsLoading] = useState(false);

  // Computed Stats
  const totalItems = items.length;
  const lowStockItems = items.filter((i) => i.stock <= i.min_stock).length;
  const categories = [...new Set(items.map((i) => i.category))];

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

  const handleQuickStock = useCallback(
    (item: InventoryItem, type: "restock" | "usage") => {
      setStockAdjustItem(item);
      setStockAdjustType(type);
      setIsStockDialogOpen(true);
    },
    []
  );

  return (
    <div className="space-y-8">
      {/* Header and Stats */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <PackageCheck className="text-cyan-400 w-8 h-8" />
              <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Manajemen Stok
              </span>
            </h1>
            <p className="text-slate-400 mt-1">
              Monitor dan kelola persediaan barang laundry Anda.
            </p>
          </div>
          <Button
            onClick={() => setIsFormOpen(true)}
            className="w-full md:w-auto rounded-xl shadow-lg shadow-cyan-500/20 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 min-h-[48px] font-bold text-white transition-all hover:scale-105 hover:shadow-cyan-500/40"
          >
            <PlusIcon className="mr-2 h-5 w-5" /> Tambah Barang
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-slate-400 text-sm font-medium">
              Total Barang
            </span>
            <div className="text-2xl font-bold text-white mt-1">
              {totalItems}
            </div>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-slate-400 text-sm font-medium">
              Stok Menipis
            </span>
            <div
              className={`text-2xl font-bold mt-1 ${
                lowStockItems > 0 ? "text-rose-400" : "text-emerald-400"
              }`}
            >
              {lowStockItems}
              <span className="text-sm font-normal text-slate-500 ml-2">
                Item
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="relative w-full md:max-w-md">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
        <Input
          placeholder="Cari nama barang atau kategori..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500 h-12 rounded-xl focus:border-cyan-500/50 transition-all font-medium"
        />
      </div>

      {/* Mobile Card View (md:hidden) */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {isLoading ? (
          <div className="text-center py-12 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-cyan-500" />
            <p>Memuat stok...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12 text-slate-500 border border-dashed border-white/10 rounded-2xl bg-white/5">
            <PackageCheck className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium">Tidak ada barang ditemukan</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isLowStock = item.stock <= item.min_stock;
            return (
              <div
                key={item.id}
                className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden group"
              >
                {isLowStock && (
                  <div className="absolute top-0 right-0 p-3">
                    <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-start mb-1">
                    <Badge
                      variant="outline"
                      className="bg-white/5 text-slate-400 border-white/10 mb-2"
                    >
                      {item.category}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-white leading-tight">
                    {item.name}
                  </h3>
                </div>

                <div className="flex items-end justify-between mt-2">
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">
                      Stok Tersedia
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span
                        className={`text-3xl font-bold font-mono ${
                          isLowStock ? "text-rose-400" : "text-emerald-400"
                        }`}
                      >
                        {item.stock}
                      </span>
                      <span className="text-sm text-slate-500 font-medium">
                        {item.unit}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-10 w-10 rounded-full border-white/10 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                      onClick={() => handleQuickStock(item, "usage")}
                    >
                      <MinusIcon className="h-5 w-5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-10 w-10 rounded-full border-white/10 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors"
                      onClick={() => handleQuickStock(item, "restock")}
                    >
                      <PlusIcon className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Edit/Delete Actions */}
                <div className="flex gap-2 pt-4 border-t border-white/5 mt-2">
                  <Button
                    variant="ghost"
                    className="flex-1 text-slate-400 hover:text-cyan-400 h-9"
                    onClick={() => handleEdit(item)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex-1 text-slate-400 hover:text-rose-400 h-9"
                    onClick={() => handleDelete(item.id)}
                  >
                    Hapus
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Table View (hidden on mobile) */}
      <div className="hidden md:block rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-md overflow-hidden shadow-2xl">
        <Table>
          <TableHeader className="bg-slate-950/50">
            <TableRow className="hover:bg-transparent border-b border-white/10">
              <TableHead className="text-slate-400 font-medium">
                Nama Barang
              </TableHead>
              <TableHead className="text-slate-400 font-medium">
                Kategori
              </TableHead>
              <TableHead className="text-slate-400 font-medium">
                Stok Live
              </TableHead>
              <TableHead className="text-slate-400 font-medium">
                Status
              </TableHead>
              <TableHead className="text-right text-slate-400 font-medium">
                Aksi Cepat
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center">
                  <div className="flex flex-col justify-center items-center gap-3 text-muted-foreground">
                    <Loader2 className="animate-spin h-8 w-8 text-cyan-500" />
                    <p>Memuat data stok...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center h-64 text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center opacity-50">
                    <PackageCheck className="h-16 w-16 mb-4 text-slate-600" />
                    <p className="text-lg">Tidak ada barang yang ditemukan.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => {
                const isLowStock = item.stock <= item.min_stock;
                return (
                  <TableRow
                    key={item.id}
                    className="hover:bg-white/5 transition-all border-b border-white/5 group"
                  >
                    <TableCell className="font-semibold text-base text-white py-4">
                      {item.name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-white/5 text-slate-300 border-white/10 px-3 py-1 font-normal"
                      >
                        {item.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span
                          className={`font-mono text-xl font-bold ${
                            isLowStock ? "text-rose-400" : "text-emerald-400"
                          }`}
                        >
                          {item.stock}
                        </span>
                        <span className="text-sm font-normal text-slate-500">
                          {item.unit}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {isLowStock ? (
                        <Badge
                          variant="destructive"
                          className="bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20"
                        >
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Menipis
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                        >
                          Aman
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-1 bg-slate-800/80 rounded-full p-1 border border-white/10 mr-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 rounded-full text-rose-400 hover:bg-rose-500/20 hover:text-white"
                            onClick={() => handleQuickStock(item, "usage")}
                            title="Kurangi"
                          >
                            <MinusIcon className="h-4 w-4" />
                          </Button>
                          <div className="w-px h-4 bg-white/10" />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 rounded-full text-emerald-400 hover:bg-emerald-500/20 hover:text-white"
                            onClick={() => handleQuickStock(item, "restock")}
                            title="Tambah"
                          >
                            <PlusIcon className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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

      <StockAdjustmentDialog
        open={isStockDialogOpen}
        onOpenChange={setIsStockDialogOpen}
        onSuccess={fetchItems}
        item={stockAdjustItem}
        defaultType={stockAdjustType}
      />
    </div>
  );
}
