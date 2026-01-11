-- VERIFICATION TEST (FIXED)
-- Run this to insert a test order specifically for YOUR user ID.
-- ID: 38ac30a9-7504-4ec0-a22d-295c1fa7f656 (putrajaya@rynse.com)

INSERT INTO orders (user_id, customer_name, customer_phone, total_price, status, created_at, items)
VALUES (
  '38ac30a9-7504-4ec0-a22d-295c1fa7f656', 
  'TEST DATA - SHOULD BE VISIBLE', 
  '08123456789', 
  50000, 
  'pending',
  NOW(),
  '[]'::jsonb  -- Fixing the NOT NULL constraint for the legacy 'items' column
);

-- After running this, Refresh the /admin/debug page.
-- If you see this order, CONGRATULATIONS! The system is working perfectly.
