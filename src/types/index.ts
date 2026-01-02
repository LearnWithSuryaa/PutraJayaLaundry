export type Service = {
  id: string;
  name: string;
  price: number;
  unit: string;
  category: string;
  image_url: string | null;
  description: string | null; // Added detailed description
  created_at: string;
};

export type OrderItem = {
  id?: string; // Optional for new items
  order_id?: number; // Added for relation
  name: string; // specialized snapshot
  service_price?: number; // snapshot price, optional for UI compat
  quantity: number;
  price: number; // This is likely total or unit price depending on usage, let's keep it as per form logic (unit price)
  unit: string;
  service_name?: string; // Mapped from name for DB
};

export type Order = {
  id: number;
  customer_name: string;
  customer_phone: string;
  // items: OrderItem[]; // Deprecated JSON column
  order_items: OrderItem[]; // New Relation
  total_price: number;
  notes?: string;
  status: "pending" | "processing" | "completed" | "paid";
  created_at: string;
};

export interface InventoryItem {
  id: number;
  name: string;
  stock: number;
  unit: string;
  min_stock: number;
  category: string;
  created_at?: string;
}
