"use client";

import { Service } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shirt, MessageCircle } from "lucide-react";

interface ServiceDetailModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ServiceDetailModal({
  service,
  isOpen,
  onClose,
}: ServiceDetailModalProps) {
  if (!service) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-card/95 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl">
        <div className="relative h-64 w-full bg-muted/20">
          {service.image_url ? (
            <img
              src={service.image_url}
              alt={service.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground/30">
              <Shirt className="w-24 h-24" />
            </div>
          )}
          <div className="absolute top-4 right-4">
            <Badge className="bg-white/90 text-primary backdrop-blur-sm shadow-sm hover:bg-white">
              {service.category}
            </Badge>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              {service.name}
            </DialogTitle>
          </div>

          <div className="prose prose-sm text-muted-foreground">
            <p>
              {service.description || "Belum ada deskripsi untuk layanan ini."}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/40">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase tracking-widest">
                Harga Layanan
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-primary">
                  Rp {service.price.toLocaleString("id-ID")}
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  /{service.unit}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  const message = encodeURIComponent(
                    `Halo, saya ingin memesan layanan *${service.name}*. Mohon infonya.`
                  );
                  window.open(
                    `https://wa.me/6281232052919?text=${message}`,
                    "_blank"
                  );
                }}
                className="rounded-full px-6 shadow-lg shadow-green-500/20 bg-[#25D366] hover:bg-[#128C7E] text-white gap-2"
              >
                <MessageCircle className="w-5 h-5" /> Pesan Sekarang
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
