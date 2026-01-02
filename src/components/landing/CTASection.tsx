"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container px-4 md:px-6 mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          {/* iOS 16 Glassmorphism Card */}
          <div className="relative rounded-[2.5rem] p-8 md:p-12 overflow-hidden bg-slate-900/60 backdrop-blur-2xl border border-white/10 shadow-2xl">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-500/20 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-violet-600/20 blur-[80px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
              <div className="space-y-4 max-w-2xl">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">
                  Siap Tampil{" "}
                  <span className="text-cyan-400">Lebih Segar?</span>
                </h2>
                <p className="text-slate-300 text-lg md:text-xl leading-relaxed">
                  Bergabung dengan pelanggan lain yang sudah merasakan
                  praktisnya layanan kami. Jemput antar gratis, wangi premium,
                  dan tepat waktu.
                </p>
              </div>

              <motion.a
                href={`https://wa.me/6281232052919?text=${encodeURIComponent(
                  "Halo, saya tertarik dengan layanan antar-jemput laundry. Bisa info detailnya?"
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-full font-bold text-lg shadow-lg shadow-emerald-500/25 transition-all w-full md:w-auto hover:shadow-emerald-500/40"
              >
                <span className="relative flex h-3 w-3 mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>
                Chat WhatsApp
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
