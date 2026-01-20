"use client";

import { useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Service } from "@/types";
import { ServiceCard } from "./ServiceCard";
import { ServiceDetailModal } from "./ServiceDetailModal";

interface CatalogSectionProps {
  services: Service[];
}

export function CatalogSection({ services }: CatalogSectionProps) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", loop: true });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const handleCardClick = (service: Service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  if (services.length === 0) {
    return (
      <div className="text-center py-20 border border-dashed border-border rounded-xl bg-card/30 mx-4">
        <p className="text-muted-foreground text-lg">
          Belum ada layanan yang tersedia saat ini.
        </p>
      </div>
    );
  }

  // Carousel Layout for > 3 items
  if (services.length > 3) {
    return (
      <>
        <div className="relative max-w-7xl mx-auto px-12 md:px-16 lg:px-12">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex -ml-4 py-8">
              {services.map((service, index) => (
                <div
                  className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 pl-4"
                  key={service.id}
                >
                  <ServiceCard
                    service={service}
                    index={index}
                    onClick={() => handleCardClick(service)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            className="absolute left-0 md:left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-slate-900/50 backdrop-blur-md border border-white/10 text-white hover:bg-cyan-500 hover:border-cyan-400 transition-all shadow-lg hidden md:flex"
            onClick={scrollPrev}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            className="absolute right-0 md:right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-slate-900/50 backdrop-blur-md border border-white/10 text-white hover:bg-cyan-500 hover:border-cyan-400 transition-all shadow-lg hidden md:flex"
            onClick={scrollNext}
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Mobile Navigation (Bottom) */}
          <div className="flex justify-center gap-4 mt-4 md:hidden">
            <button
              className="p-3 rounded-full bg-slate-900/50 backdrop-blur-md border border-white/10 text-white hover:bg-cyan-500 hover:border-cyan-400 transition-all shadow-lg"
              onClick={scrollPrev}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              className="p-3 rounded-full bg-slate-900/50 backdrop-blur-md border border-white/10 text-white hover:bg-cyan-500 hover:border-cyan-400 transition-all shadow-lg"
              onClick={scrollNext}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <ServiceDetailModal
          service={selectedService}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </>
    );
  }

  // Grid Layout for <= 3 items
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 px-2 md:px-0 max-w-5xl mx-auto">
        {services.map((service, index) => (
          <ServiceCard
            key={service.id}
            service={service}
            index={index}
            onClick={() => handleCardClick(service)}
          />
        ))}
      </div>

      <ServiceDetailModal
        service={selectedService}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
