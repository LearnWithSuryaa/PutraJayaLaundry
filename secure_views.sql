-- SECURE VIEW DEFINITION
-- 1. Drop the existing view
DROP VIEW IF EXISTS monthly_stats_view;

-- 2. Re-create with security_invoker = true
-- This is CRITICAL: It forces the view to respect the RLS policies of the USER querying the view.
CREATE VIEW monthly_stats_view WITH (security_invoker = true) AS
SELECT
    date_trunc('month', created_at) AS month,
    COUNT(id) AS total_orders,
    SUM(total_price) AS total_revenue
FROM
    orders
GROUP BY
    date_trunc('month', created_at);

-- 3. Also check for any other helper views and recreate them similarly if they exist
-- (Example: daily_stats_view if relevant)
-- DROP VIEW IF EXISTS daily_stats_view;
-- CREATE VIEW daily_stats_view WITH (security_invoker = true) AS ...
