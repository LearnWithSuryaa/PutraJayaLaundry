import { supabase } from "@/lib/supabase";
import { Hero } from "@/components/landing/Hero";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { CTASection } from "@/components/landing/CTASection";
import { Service } from "@/types";
import { CatalogSection } from "@/components/landing/CatalogSection";
import { WhatsAppFloat } from "@/components/landing/WhatsAppFloat";
import { Footer } from "@/components/landing/Footer";

// Use ISR (Incremental Static Regeneration) to cache page for 1 hour (3600 seconds)
// This reduces database reads and speeds up loading for users.
export const revalidate = 3600;

async function getServices() {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("category", { ascending: true });

  if (error) {
    console.error("Error fetching services:", error);
    return [];
  }

  return data as Service[];
}

export default async function Home() {
  const services = await getServices();

  return (
    <main className="min-h-screen bg-background relative selection:bg-cyan-500/30 overflow-hidden text-foreground">
      {/* Global Background Decoration */}
      <div className="fixed inset-0 -z-40 h-full w-full bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="fixed top-0 right-0 -z-30 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full opacity-40 pointer-events-none" />
      <div className="fixed bottom-0 left-0 -z-30 w-[600px] h-[600px] bg-secondary/20 blur-[120px] rounded-full opacity-40 pointer-events-none" />

      <Hero />
      <WhatsAppFloat />

      <FeaturesSection />

      <section
        id="catalog"
        className="container px-4 md:px-6 py-12 md:py-20 mx-auto"
      >
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8 md:mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Katalog Layanan
          </h2>
          <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed px-4">
            Pilih layanan terbaik untuk kebutuhan pakaian Anda.
          </p>
        </div>

        <CatalogSection services={services} />
      </section>

      <HowItWorksSection />

      <CTASection />

      <Footer />
    </main>
  );
}
