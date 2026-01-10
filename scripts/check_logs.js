const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Load .env.local manually
const envPath = path.resolve(__dirname, "../.env.local");
const envConfig = {};

try {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const [key, value] = line.split("=");
    if (key && value) {
      envConfig[key.trim()] = value.trim();
    }
  });
} catch (e) {
  console.error("Could not read .env.local");
}

const supabaseUrl = envConfig["NEXT_PUBLIC_SUPABASE_URL"];
const supabaseKey = envConfig["NEXT_PUBLIC_SUPABASE_ANON_KEY"];

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLogs() {
  const { data, error } = await supabase
    .from("inventory_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Error fetching logs:", error);
    return;
  }

  console.log("Last 10 Inventory Logs:");
  console.table(data);
}

checkLogs();
