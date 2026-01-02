"use client";

import { Service } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Shirt, ArrowRight } from "lucide-react";

interface ServiceCardProps {
  service: Service;
  index: number;
  onClick?: () => void;
}

export function ServiceCard({ service, index, onClick }: ServiceCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      viewport={{ once: true }}
    >
      <Card
        className="h-full border border-white/10 bg-slate-900/40 backdrop-blur-md overflow-hidden hover:shadow-cyan-500/20 hover:border-cyan-500/30 transition-all duration-300 cursor-pointer group rounded-2xl flex flex-col"
        onClick={onClick}
      >
        <div className="aspect-video w-full bg-secondary/50 relative overflow-hidden group-hover:bg-secondary/70 transition-colors">
          {/* Placeholder for now if no image, or use service.image_url */}
          {service.image_url ? (
            <img
              src={service.image_url}
              alt={service.name}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/50">
              <Shirt className="w-12 h-12 opacity-50 text-cyan-500/50" />
            </div>
          )}

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-60" />
        </div>

        <div className="p-5 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
              {service.name}
            </h3>
            <Badge
              variant="secondary"
              className="bg-white/10 text-cyan-200 hover:bg-white/20 border-white/5"
            >
              {service.category}
            </Badge>
          </div>

          <p className="text-sm text-slate-400 mb-4 line-clamp-2 min-h-[40px] flex-grow">
            {service.description ||
              "Layanan laundry profesional untuk pakaian kesayangan Anda."}
          </p>

          <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
            <span
              className="font-bold text-lg text-emerald-400"
              suppressHydrationWarning
            >
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0,
              }).format(service.price)}
              <span className="text-xs font-normal text-slate-500 ml-1">
                /{service.unit}
              </span>
            </span>
            <Button
              size="sm"
              variant="ghost"
              className="text-cyan-400 hover:text-cyan-300 hover:bg-white/5 p-0 h-auto font-semibold"
            >
              Detail <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
