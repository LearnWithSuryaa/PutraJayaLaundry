"use client";

import { motion } from "framer-motion";
import { Sparkles, Truck, Clock, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Truck,
    title: "Gratis Jemput Antar",
    description:
      "Hemat waktu Anda. Kami jemput dan antar cucian Anda langsung ke depan pintu tanpa biaya tambahan.",
    color: "text-blue-500",
  },
  {
    icon: Sparkles,
    title: "Wangi Premium Tahan Lama",
    description:
      "Menggunakan pewangi kualitas premium yang membuat pakaian Anda segar lebih lama dan percaya diri.",
    color: "text-purple-500",
  },
  {
    icon: ShieldCheck,
    title: "Higienis & Bersih",
    description:
      "Proses pencucian terpisah untuk setiap pelanggan demi menjaga kebersihan dan kesehatan Anda.",
    color: "text-green-500",
  },
  {
    icon: Clock,
    title: "Tepat Waktu",
    description:
      "Jaminan selesai tepat waktu sesuai layanan yang Anda pilih. Express 3 jam atau Reguler 1 hari.",
    color: "text-orange-500",
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="container px-4 md:px-6 py-16 md:py-24 mx-auto bg-secondary/20"
    >
      <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Kenapa Pilih <span className="text-primary">PutraJaya</span>?
        </h2>
        <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed px-4">
          Kami memberikan standar baru dalam layanan laundry untuk kepuasan
          maksimal Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <Card className="h-full border border-white/10 shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 bg-slate-900/40 backdrop-blur-md rounded-2xl group hover:-translate-y-1">
              <CardContent className="p-6 flex flex-col items-center text-center space-y-4 pt-8">
                <div
                  className={`p-4 rounded-full bg-white/5 border border-white/10 shadow-inner ${feature.color} group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-8 h-8 md:w-10 md:h-10" />
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
