"use client";

import { Shirt, Facebook, Instagram, Twitter } from "lucide-react";
import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/10 bg-slate-950 pt-16 pb-8 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none translate-y-1/2" />

      <div className="container px-4 md:px-6 mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center text-white">
                <Shirt className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                PutraJaya<span className="text-cyan-400">Laundry</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed max-w-sm">
              Layanan laundry profesional dengan standar hotel berbintang. Kami
              merawat pakaian Anda dengan teknologi modern dan bahan ramah
              lingkungan.
            </p>
            <div className="flex gap-4 pt-2">
              <SocialLink href="#" icon={Instagram} label="Instagram" />
              <SocialLink href="#" icon={Facebook} label="Facebook" />
              <SocialLink href="#" icon={Twitter} label="Twitter" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-lg">Menu</h4>
            <ul className="space-y-2">
              <FooterLink href="#">Beranda</FooterLink>
              <FooterLink href="#features">Keunggulan</FooterLink>
              <FooterLink href="#catalog">Katalog Layanan</FooterLink>
              <FooterLink href="#how-it-works">Cara Pesan</FooterLink>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-lg">Hubungi Kami</h4>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li className="flex items-start gap-3">
                <span className="text-cyan-400 font-medium">Alamat:</span>
                Jl. Kelapa Nomor 141, Kabunan, Balen, Bojonegoro
              </li>
              <li className="flex items-center gap-3">
                <span className="text-cyan-400 font-medium">WhatsApp:</span>
                +62 812-3205-2919
              </li>
              <li className="flex items-center gap-3">
                <span className="text-cyan-400 font-medium">Jam Buka:</span>
                Senin - Minggu (07:00 - 21:00)
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm text-center md:text-left">
            &copy; {currentYear} PutraJayaLaundry. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link
              href="/privacy-policy"
              className="hover:text-cyan-400 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-service"
              className="hover:text-cyan-400 transition-colors"
            >
              Terms of Service
            </Link>
            <span className="opacity-50">Powered by Rynse</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: any;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-cyan-500/20 hover:text-cyan-400 hover:border-cyan-500/30 transition-all duration-300"
      aria-label={label}
    >
      <Icon className="w-5 h-5" />
    </Link>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="text-slate-400 hover:text-cyan-400 transition-colors text-sm"
      >
        {children}
      </Link>
    </li>
  );
}
