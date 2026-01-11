-- DANGER: This script will WIPE ALL DATA from your application tables.
-- It keeps the table structure (columns) but removes all rows.
-- It uses CASCADE to automatically handle relationships (e.g. deleting an order deletes its items).

TRUNCATE TABLE 
  order_items,
  orders,
  inventory_logs,
  inventory_items,
  services,
  expenses
RESTART IDENTITY CASCADE;

-- Note: 'expenses' is included based on your schema. If it doesn't exist, remove it from the list.
-- RESTART IDENTITY resets the ID counters back to 1.
