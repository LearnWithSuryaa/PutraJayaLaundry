"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Star, Zap } from "lucide-react";
import Image from "next/image";

export function Hero() {
  const scrollToCatalog = () => {
    const catalog = document.getElementById("catalog");
    if (catalog) {
      catalog.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-10"
    >
      {/* 1. Premium Mesh Gradient Background Image */}
      <div className="absolute inset-0 -z-30 h-full w-full overflow-hidden bg-background">
        <Image
          src="/bg-mesh.png"
          alt="Aesthetic Mesh Gradient"
          fill
          className="object-cover opacity-90"
          priority
        />
        {/* Soft overlay to ensure text readability & maintain glassmorphism feel */}
        <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-[20px]" />
      </div>

      {/* 2. Glass Overlay Texture */}
      <div className="absolute inset-0 -z-20 h-full w-full bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="container px-4 md:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left Column: Text Content */}
          <div className="text-center lg:text-left space-y-8 max-w-2xl mx-auto lg:mx-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center space-x-2 bg-white/50 dark:bg-white/5 border border-white/40 dark:border-white/10 rounded-full px-4 py-1.5 shadow-sm backdrop-blur-md"
            >
              <Badge
                variant="secondary"
                className="rounded-full px-2 py-0.5 text-xs font-bold bg-primary text-primary-foreground"
              >
                NEW
              </Badge>
              <span className="text-sm font-medium text-foreground/80">
                Layanan Antar Jemput Gratis
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]"
            >
              Wangi{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
                Premium.
              </span>{" "}
              <br />
              Hidup{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400">
                Praktis.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg mx-auto lg:mx-0"
            >
              Serahkan tumpukan cucian Anda pada ahlinya. Kami menjamin
              kebersihan higienis, ketepatan waktu, dan kenyamanan Anda.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button
                size="lg"
                onClick={scrollToCatalog}
                className="h-14 px-8 rounded-full text-base font-semibold shadow-xl shadow-primary/25 bg-primary hover:bg-primary/90 transition-all hover:scale-105"
              >
                Lihat Katalog
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 rounded-full text-base font-semibold border-2 border-foreground/5 bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 backdrop-blur-sm transition-all"
                onClick={() =>
                  window.open(
                    `https://wa.me/6281232052919?text=${encodeURIComponent(
                      "Halo, saya mau konsultasi layanan laundry. Apakah bisa antar-jemput?"
                    )}`,
                    "_blank"
                  )
                }
              >
                Konsultasi Dulu
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="pt-4 flex items-center justify-center lg:justify-start gap-4 text-sm text-muted-foreground"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-background bg-slate-200 flex items-center justify-center text-[10px] font-bold overflow-hidden"
                  >
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`}
                      alt="user"
                    />
                  </div>
                ))}
              </div>
              <div className="flex flex-col items-start leading-none gap-1">
                <div className="flex text-yellow-500">
                  <Star className="w-3 h-3 fill-current" />
                  <Star className="w-3 h-3 fill-current" />
                  <Star className="w-3 h-3 fill-current" />
                  <Star className="w-3 h-3 fill-current" />
                  <Star className="w-3 h-3 fill-current" />
                </div>
                <span>
                  <b>500+</b> Pelanggan Puas
                </span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Visual Glass Card */}
          <div className="relative hidden lg:block h-[600px] w-full">
            {/* 1. Main Card: Cuci Komplit (Top Right) */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-6 right-6 z-20"
            >
              <div className="relative w-72 h-auto bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl p-5 flex flex-col gap-6 transform rotate-3 hover:rotate-0 transition-all duration-500 group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-[2rem] pointer-events-none" />
                <div className="flex justify-between items-start relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-white/10 backdrop-blur-md border-white/20 text-cyan-100 px-2.5 py-0.5 text-xs"
                  >
                    Premium
                  </Badge>
                </div>
                <div className="relative z-10 pb-2">
                  <h3 className="text-2xl font-bold text-white mb-1.5 tracking-tight">
                    Cuci Komplit
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Layanan setrika uap & pewangi eksklusif tahan 48 jam.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* 2. Secondary Card: Layanan Kilat (Bottom Left) */}
            <motion.div
              animate={{ y: [0, 30, 0], x: [0, 10, 0] }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute bottom-28 left-6 z-30"
            >
              <div className="relative w-64 h-auto bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl p-5 flex flex-col gap-5 transform -rotate-2 hover:rotate-0 transition-all duration-500 group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-[2rem] pointer-events-none" />
                <div className="flex justify-between items-start relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6" fill="currentColor" />
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-white/10 backdrop-blur-md border-white/20 text-yellow-100 px-2.5 py-0.5 text-xs"
                  >
                    4 Jam
                  </Badge>
                </div>
                <div className="relative z-10 pb-1">
                  <h3 className="text-xl font-bold text-white mb-1 tracking-tight">
                    Layanan Kilat
                  </h3>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Butuh cepat? Selesai dalam hitungan jam.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* 3. Small Widget: Status (Bottom Right) */}
            <motion.div
              animate={{ y: [0, 15, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2,
              }}
              className="absolute bottom-8 right-8 z-10"
            >
              <div className="w-auto h-auto bg-slate-900/40 backdrop-blur-md border border-white/20 rounded-full shadow-lg flex items-center gap-3 px-4 py-2 transform rotate-1 hover:rotate-0 transition-all duration-500">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_theme(colors.green.400)]" />
                <p className="text-xs font-semibold text-slate-200 uppercase tracking-wide">
                  Outlet Buka
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
