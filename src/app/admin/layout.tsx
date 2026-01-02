import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        {/* Add padding for mobile header (top) and bottom nav (bottom) */}
        <div className="pt-16 pb-20 md:pt-0 md:pb-0 min-h-screen">
          <div className="container mx-auto p-4 md:p-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
