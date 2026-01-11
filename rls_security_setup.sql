-- 1. Add user_id column to tables
ALTER TABLE services ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
ALTER TABLE inventory_logs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();

-- 2. Enable Row Level Security
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies

-- SERVICES
CREATE POLICY "Users can only see their own services" ON services
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own services" ON services
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own services" ON services
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own services" ON services
  FOR DELETE USING (auth.uid() = user_id);

-- ORDERS
CREATE POLICY "Users can only see their own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" ON orders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own orders" ON orders
  FOR DELETE USING (auth.uid() = user_id);

-- ORDER ITEMS (Inherits from Orders)
CREATE POLICY "Users can see items of their orders" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert items to their orders" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items of their orders" ON order_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items of their orders" ON order_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- INVENTORY ITEMS
CREATE POLICY "Users can only see their own inventory" ON inventory_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own inventory" ON inventory_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory" ON inventory_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inventory" ON inventory_items
  FOR DELETE USING (auth.uid() = user_id);

-- INVENTORY LOGS
CREATE POLICY "Users can only see their own logs" ON inventory_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own logs" ON inventory_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
