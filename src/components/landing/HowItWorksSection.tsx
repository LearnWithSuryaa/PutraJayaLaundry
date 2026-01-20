"use client";

import { motion } from "framer-motion";
import { MessageCircle, Truck, Shirt, CheckCircle, MapPin } from "lucide-react";

const steps = [
  {
    icon: MessageCircle,
    title: "1. Pesan",
    desc: "Chat via WhatsApp atau pilih layanan di katalog kami.",
  },
  {
    icon: Truck,
    title: "2. Jemput / Drop-off",
    desc: "Tunggu kurir kami datang, atau **antar sendiri** ke outlet terdekat.", // Bold added as per user request
  },
  {
    icon: Shirt,
    title: "3. Proses",
    desc: "Dicuci, disetrika uap, dan dipacking wangi & higienis.",
  },
  {
    icon: CheckCircle,
    title: "4. Selesai",
    desc: "Baju bersih siap pakai diantar kembali atau diambil.",
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="relative container px-4 md:px-6 py-24 mx-auto overflow-hidden"
    >
      {/* Background Decorative Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="flex flex-col items-center justify-center space-y-4 text-center mb-20"
      >
        <h2 className="text-3xl font-bold py-1 tracking-tighter sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
          Alur Layanan
        </h2>
        <p className="max-w-[600px] text-muted-foreground md:text-lg">
          Layanan laundry premium yang fleksibel. Bisa dijemput, atau antar
          sendiri.
        </p>
      </motion.div>

      <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6">
        {/* Connecting Line (Desktop) with Animation */}
        <div className="hidden md:block absolute top-[3.5rem] left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-200 to-transparent dark:via-blue-800 -z-10 w-[90%] mx-auto rounded-full" />

        {/* Dashed Animated Line Overlay */}
        <div className="hidden md:block absolute top-[3.5rem] left-0 right-0 h-1 -z-10 w-[90%] mx-auto overflow-hidden">
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-1/2 h-full bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"
          />
        </div>

        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className="flex flex-col items-center text-center space-y-5 group"
          >
            {/* Icon Circle */}
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 rounded-full" />
              <div className="w-24 h-24 rounded-full bg-white dark:bg-black border border-blue-100 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-xl shadow-blue-500/10 z-10 transition-transform duration-300 group-hover:scale-105 group-hover:border-blue-300">
                <step.icon className="w-10 h-10" strokeWidth={1.5} />
              </div>
              {/* Step Number Badge */}
              <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-white flex items-center justify-center font-bold text-sm shadow-lg border-2 border-white dark:border-black">
                {index + 1}
              </div>
            </div>

            {/* Content Card (Glass) */}
            <div className="w-full h-full bg-slate-900/40 backdrop-blur-md border border-white/10 p-5 rounded-2xl hover:bg-slate-800/60 hover:border-cyan-500/30 hover:shadow-cyan-500/10 transition-all duration-300">
              <h3 className="text-xl font-bold mb-2 text-white group-hover:text-cyan-400 transition-colors">
                {step.title.split(". ")[1]}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {step.icon === Truck ? (
                  <>
                    Tunggu kurir kami, atau{" "}
                    <span className="font-semibold text-cyan-400">
                      antar sendiri (drop-off)
                    </span>{" "}
                    ke outlet.
                  </>
                ) : (
                  step.desc
                )}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
