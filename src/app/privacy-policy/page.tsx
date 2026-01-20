export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-background relative selection:bg-cyan-500/30 overflow-hidden text-foreground">
      {/* Global Background Decoration */}
      <div className="fixed inset-0 -z-40 h-full w-full bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="fixed top-0 right-0 -z-30 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full opacity-40 pointer-events-none" />
      <div className="fixed bottom-0 left-0 -z-30 w-[600px] h-[600px] bg-secondary/20 blur-[120px] rounded-full opacity-40 pointer-events-none" />

      <section className="container px-4 md:px-6 py-24 md:py-32 mx-auto">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-4">
              Privacy Policy
            </h1>
            <p className="text-slate-400">
              Terakhir diperbarui:{" "}
              {new Date().toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="bg-slate-900/40 border border-white/10 backdrop-blur-md rounded-2xl p-6 md:p-10 space-y-6 text-slate-300 leading-relaxed">
            <p>
              <strong>PutraJayaLaundry</strong> ("kami") menghargai privasi
              Anda. Kebijakan Privasi ini menjelaskan bagaimana kami
              mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda
              saat menggunakan layanan kami.
            </p>

            <h2 className="text-xl font-bold text-white pt-4">
              1. Informasi yang Kami Kumpulkan
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Informasi Kontak:</strong> Nama, nomor telepon
                (WhatsApp), dan alamat untuk keperluan penjemputan/pengantaran.
              </li>
              <li>
                <strong>Data Transaksi:</strong> Detail pesanan laundry, riwayat
                pembayaran, dan preferensi layanan.
              </li>
            </ul>

            <h2 className="text-xl font-bold text-white pt-4">
              2. Bagaimana Kami Menggunakan Data Anda
            </h2>
            <p>Kami menggunakan data Anda hanya untuk:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Memproses pesanan laundry Anda.</li>
              <li>Menghubungi Anda terkait status pesanan (via WhatsApp).</li>
              <li>Meningkatkan kualitas layanan kami.</li>
            </ul>

            <h2 className="text-xl font-bold text-white pt-4">
              3. Keamanan Data
            </h2>
            <p>
              Kami mengambil langkah-langkah wajar untuk melindungi data pribadi
              Anda dari akses tidak sah. Kami tidak menjual data Anda kepada
              pihak ketiga.
            </p>

            <h2 className="text-xl font-bold text-white pt-4">
              4. Hubungi Kami
            </h2>
            <p>
              Jika Anda memiliki pertanyaan tentang kebijakan ini, silakan
              hubungi kami melalui WhatsApp di <strong>0812-3205-2919</strong>.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
