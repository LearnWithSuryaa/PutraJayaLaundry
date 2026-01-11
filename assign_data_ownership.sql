-- FIX DATA OWNERSHIP
-- The previous migration captured the Dashboard User ID, which is different from your App User ID.
-- Run this to assign ALL existing data to a specific user (e.g. putrajaya@rynse.com).

-- 1. Copy the UUID of the user you want to own the data from your Auth dashboard.
--    Example from your screenshot: 38ac30a9-7504-4ec0-a22d-295c1fa7f656

-- 2. Run these updates (Replace 'YOUR_UUID_HERE' with the actual UUID if different)

-- Assign Services
UPDATE services 
SET user_id = '38ac30a9-7504-4ec0-a22d-295c1fa7f656' 
WHERE user_id IS NOT NULL;

-- Assign Orders
UPDATE orders 
SET user_id = '38ac30a9-7504-4ec0-a22d-295c1fa7f656' 
WHERE user_id IS NOT NULL;

-- Assign Inventory
UPDATE inventory_items 
SET user_id = '38ac30a9-7504-4ec0-a22d-295c1fa7f656' 
WHERE user_id IS NOT NULL;

-- Assign Logs
UPDATE inventory_logs 
SET user_id = '38ac30a9-7504-4ec0-a22d-295c1fa7f656' 
WHERE user_id IS NOT NULL;

-- 3. Verify
SELECT * FROM services;
