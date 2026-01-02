export default function TermsOfService() {
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
              Terms of Service
            </h1>
            <p className="text-slate-400">Syarat & Ketentuan Layanan</p>
          </div>

          <div className="bg-slate-900/40 border border-white/10 backdrop-blur-md rounded-2xl p-6 md:p-10 space-y-6 text-slate-300 leading-relaxed">
            <p>
              Selamat datang di <strong>PutraJayaLaundry</strong>. Dengan
              menggunakan layanan kami, Anda menyetujui syarat dan ketentuan
              berikut.
            </p>

            <h2 className="text-xl font-bold text-white pt-4">1. Layanan</h2>
            <p>
              Kami menyediakan jasa cuci, setrika, dan dry cleaning. Hasil
              cucian dihitung berdasarkan berat (kg) atau satuan (pcs) sesuai
              kategori layanan yang dipilih.
            </p>

            <h2 className="text-xl font-bold text-white pt-4">
              2. Klaim & Garansi
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Pelanggan wajib memeriksa jumlah dan kondisi pakaian saat serah
                terima (baik drop-off maupun delivery).
              </li>
              <li>
                Klaim kehilangan atau kerusakan hanya dilayani maksimal{" "}
                <strong>24 jam</strong> setelah laundry diambil/diantar.
              </li>
              <li>
                Kami tidak bertanggung jawab atas luntur warna yang disebabkan
                oleh sifat bahan pakaian itu sendiri.
              </li>
            </ul>

            <h2 className="text-xl font-bold text-white pt-4">3. Pembayaran</h2>
            <p>
              Pembayaran dapat dilakukan secara tunai atau transfer saat
              pengambilan barang (COD) atau di awal. Barang yang tidak diambil
              lebih dari 30 hari di luar tanggung jawab kami.
            </p>

            <h2 className="text-xl font-bold text-white pt-4">
              4. Barang Berharga
            </h2>
            <p>
              Mohon cek saku pakaian Anda. Kami tidak bertanggung jawab atas
              hilangnya barang berharga (uang, perhiasan, dll) yang tertinggal
              di dalam pakaian.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
