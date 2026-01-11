import { createClient } from "@/utils/supabase/server";

export default async function DebugPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: orders } = await supabase.from("orders").select("*").limit(5);

  return (
    <div className="p-10 text-white space-y-8">
      <h1 className="text-2xl font-bold text-red-500">RLS Debugger</h1>

      <div className="border p-4 rounded bg-slate-900 border-white/10">
        <h2 className="text-xl font-semibold mb-2 text-cyan-400">
          1. Current User (Auth)
        </h2>
        <pre className="bg-black p-4 rounded overflow-auto text-xs font-mono text-green-400">
          {JSON.stringify(user, null, 2)}
        </pre>
        {user ? (
          <p className="mt-2 text-green-500">
            ✅ Logged In as {user.email} ({user.id})
          </p>
        ) : (
          <p className="mt-2 text-red-500">
            ❌ NOT Logged In (RLS will likely show nothing or public data)
          </p>
        )}
      </div>

      <div className="border p-4 rounded bg-slate-900 border-white/10">
        <h2 className="text-xl font-semibold mb-2 text-cyan-400">
          2. Visible Orders (RLS Check)
        </h2>
        <p className="text-sm text-slate-400 mb-2">
          These are the orders visible to the user above. If RLS works, this
          list should match ONLY the user's data.
        </p>
        <pre className="bg-black p-4 rounded overflow-auto text-xs font-mono text-yellow-400">
          {JSON.stringify(orders, null, 2)}
        </pre>
      </div>
    </div>
  );
}
