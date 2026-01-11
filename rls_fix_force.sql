-- FORCE RLS FIX
-- Run this script to completely reset and enforce security policies.

-- 1. Drop ALL existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can only see their own services" ON services;
DROP POLICY IF EXISTS "Users can insert their own services" ON services;
DROP POLICY IF EXISTS "Users can update their own services" ON services;
DROP POLICY IF EXISTS "Users can delete their own services" ON services;

DROP POLICY IF EXISTS "Users can only see their own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON orders;
DROP POLICY IF EXISTS "Users can delete their own orders" ON orders;

DROP POLICY IF EXISTS "Users can see items of their orders" ON order_items;
DROP POLICY IF EXISTS "Users can insert items to their orders" ON order_items;
DROP POLICY IF EXISTS "Users can update items of their orders" ON order_items;
DROP POLICY IF EXISTS "Users can delete items of their orders" ON order_items;

DROP POLICY IF EXISTS "Users can only see their own inventory" ON inventory_items;
DROP POLICY IF EXISTS "Users can insert their own inventory" ON inventory_items;
DROP POLICY IF EXISTS "Users can update their own inventory" ON inventory_items;
DROP POLICY IF EXISTS "Users can delete their own inventory" ON inventory_items;

DROP POLICY IF EXISTS "Users can only see their own logs" ON inventory_logs;
DROP POLICY IF EXISTS "Users can insert their own logs" ON inventory_logs;

-- 2. Ensure RLS is Enabled (Force it)
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;

-- 3. Re-Create Strict Policies

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

-- 4. [OPTIONAL] Fix Existing Data
-- If you see OLD data that belongs to NO ONE (user_id is NULL),
-- you can uncomment and run this line to claim it for yourself:

-- UPDATE orders SET user_id = auth.uid() WHERE user_id IS NULL;
-- UPDATE services SET user_id = auth.uid() WHERE user_id IS NULL;
-- UPDATE inventory_items SET user_id = auth.uid() WHERE user_id IS NULL;
