"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WhatsAppFloat() {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring" }}
      className="fixed bottom-6 right-6 z-50"
    >
      <Button
        size="icon"
        className="h-14 w-14 rounded-full bg-[#25D366] hover:bg-[#128C7E] shadow-lg shadow-green-500/20"
        onClick={() =>
          window.open(
            `https://wa.me/6281232052919?text=${encodeURIComponent(
              "Halo Admin PutraJaya, saya mau tanya seputar layanan laundry..."
            )}`,
            "_blank"
          )
        }
      >
        <MessageCircle className="h-7 w-7 text-white" />
      </Button>
    </motion.div>
  );
}
