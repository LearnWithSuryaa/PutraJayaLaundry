import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-slate-950 text-foreground selection:bg-cyan-500/30">
      {/* Global Background Decoration (Consistent with Landing) */}
      <div className="fixed inset-0 z-[-10] h-full w-full bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="fixed top-0 right-0 z-[-10] w-[600px] h-[600px] bg-cyan-500/10 blur-[130px] rounded-full opacity-30 pointer-events-none" />
      <div className="fixed bottom-0 left-0 z-[-10] w-[600px] h-[600px] bg-violet-600/10 blur-[130px] rounded-full opacity-30 pointer-events-none" />

      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
        {children}
      </main>
    </div>
  );
}
