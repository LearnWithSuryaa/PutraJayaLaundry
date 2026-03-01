"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, Shirt } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check if we should hide the navbar
  if (
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/struk") ||
    pathname === "/privacy-policy" ||
    pathname === "/terms-of-service"
  ) {
    return null;
  }

  const navLinks = [
    { name: "Keunggulan", href: "#features" },
    { name: "Katalog", href: "#catalog" },
    { name: "Cara Order", href: "#how-it-works" },
  ];

  const scrollToHash = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    } else if (href === "#") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
          isScrolled
            ? "w-[85%] md:w-auto px-5 py-2 rounded-full bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/10"
            : "w-[90%] md:w-auto px-6 py-3 bg-transparent"
        }`}
      >
        <div className="flex items-center justify-between gap-6 md:gap-10">
          {/* Logo */}
          <Link
            href="#hero"
            onClick={(e) => scrollToHash(e, "#hero")}
            className="flex items-center gap-2 font-bold text-lg tracking-tight group"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 group-hover:rotate-12 transition-transform">
              <Shirt className="w-4 h-4" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-blue-200">
              PutraJaya
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1 bg-white/30 dark:bg-black/30 rounded-full px-2 py-1 backdrop-blur-sm border border-white/10">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => scrollToHash(e, link.href)}
                className="text-sm font-medium px-4 py-1.5 rounded-full transition-all text-muted-foreground hover:text-primary hover:bg-white/50 dark:hover:bg-white/10"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Action Button */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              size="sm"
              className="rounded-full px-5 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white"
              onClick={() =>
                window.open(
                  `https://wa.me/6281232052919?text=${encodeURIComponent(
                    "Halo Admin, saya butuh informasi mengenai laundry...",
                  )}`,
                  "_blank",
                )
              }
            >
              Chat WA
            </Button>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 text-foreground bg-white/50 backdrop-blur-md rounded-full"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-4 right-4 z-40 bg-white/90 dark:bg-black/90 backdrop-blur-3xl border border-white/20 rounded-3xl p-6 shadow-2xl md:hidden flex flex-col items-center gap-6"
          >
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-lg font-semibold text-foreground hover:text-primary transition-colors w-full text-center py-2 border-b border-border/50 last:border-0"
                onClick={(e) => scrollToHash(e, link.href)}
              >
                {link.name}
              </a>
            ))}
            <div className="flex gap-4 w-full pt-2">
              <Button
                className="w-full rounded-full bg-primary text-white"
                onClick={() =>
                  window.open(
                    `https://wa.me/6281232052919?text=${encodeURIComponent(
                      "Halo, saya mau order laundry lewat WhatsApp.",
                    )}`,
                    "_blank",
                  )
                }
              >
                Chat WhatsApp
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
