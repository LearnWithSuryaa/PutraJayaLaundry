"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Settings,
  Save,
  Printer,
  Store,
  Globe,
  TrendingUp,
  WalletMinimal,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const [storeName, setStoreName] = useState("Rynse Laundry");
  const [storeAddress, setStoreAddress] = useState(
    "Kawasan Ruko Putra Jaya Blok A1",
  );
  const [storePhone, setStorePhone] = useState("081234567890");
  const [receiptHeader, setReceiptHeader] = useState(
    "Terima kasih atas kepercayaan Anda!",
  );
  const [receiptFooter, setReceiptFooter] = useState(
    "Barang yang tidak diambil > 30 hari diluar tanggung jawab kami.",
  );

  // Target Settings
  const [useDynamicTarget, setUseDynamicTarget] = useState(true);
  const [manualTarget, setManualTarget] = useState(2500000);

  // Salary Settings (LocalStorage)
  const [salaryPerDay, setSalaryPerDay] = useState(50000);

  const [isSaved, setIsSaved] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("rynse_settings");
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setStoreName(parsed.storeName || "Rynse Laundry");
      setStoreAddress(parsed.storeAddress || "");
      setStorePhone(parsed.storePhone || "");
      setReceiptHeader(parsed.receiptHeader || "");
      setReceiptFooter(parsed.receiptFooter || "");
    }

    const savedTarget = localStorage.getItem("rynse_target_settings");
    if (savedTarget) {
      const parsed = JSON.parse(savedTarget);
      setUseDynamicTarget(parsed.useDynamicTarget !== false); // default true
      setManualTarget(parsed.manualTarget || 2500000);
    }

    // Load Salary
    const savedSalary = localStorage.getItem("rynse_salary_settings");
    if (savedSalary) {
      const parsed = JSON.parse(savedSalary);
      setSalaryPerDay(parsed.salaryPerDay || 50000);
    }
  }, []);

  const handleSave = () => {
    const settings = {
      storeName,
      storeAddress,
      storePhone,
      receiptHeader,
      receiptFooter,
    };
    localStorage.setItem("rynse_settings", JSON.stringify(settings));

    const targetSettings = {
      useDynamicTarget,
      manualTarget,
    };
    localStorage.setItem(
      "rynse_target_settings",
      JSON.stringify(targetSettings),
    );

    const salarySettings = { salaryPerDay };
    localStorage.setItem(
      "rynse_salary_settings",
      JSON.stringify(salarySettings),
    );

    // Trigger a custom event so Dashboard can listen (optional but good for UX if multiple tabs)
    // For now, simpler: page reload is not needed if user navigates away and back.
    // Ideally Dashboard reads on mount.

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Settings className="text-cyan-400 w-8 h-8" />
          <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Settings
          </span>
        </h2>
        <p className="text-slate-400 mt-1">Konfigurasi toko dan aplikasi.</p>
      </div>

      <div className="grid gap-6">
        {/* Store Profile */}
        <Card className="bg-slate-900/60 border-white/10 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Store className="w-5 h-5 text-indigo-400" /> Profil Toko
            </CardTitle>
            <CardDescription>
              Informasi ini akan muncul di struk belanja.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="storeName" className="text-slate-300">
                Nama Toko
              </Label>
              <Input
                id="storeName"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="bg-slate-950/50 border-white/10"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="storeAddress" className="text-slate-300">
                Alamat
              </Label>
              <Textarea
                id="storeAddress"
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                className="bg-slate-950/50 border-white/10 min-h-[80px]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="storePhone" className="text-slate-300">
                No. Telepon / WA
              </Label>
              <Input
                id="storePhone"
                value={storePhone}
                onChange={(e) => setStorePhone(e.target.value)}
                className="bg-slate-950/50 border-white/10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Receipt Settings */}
        <Card className="bg-slate-900/60 border-white/10 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Printer className="w-5 h-5 text-pink-400" /> Pengaturan Struk
            </CardTitle>
            <CardDescription>
              Kustomisasi header dan footer struk.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="header" className="text-slate-300">
                Header Text (Slogan/Greeting)
              </Label>
              <Input
                id="header"
                value={receiptHeader}
                onChange={(e) => setReceiptHeader(e.target.value)}
                className="bg-slate-950/50 border-white/10"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="footer" className="text-slate-300">
                Footer Text (Disclaimer/Notes)
              </Label>
              <Textarea
                id="footer"
                value={receiptFooter}
                onChange={(e) => setReceiptFooter(e.target.value)}
                className="bg-slate-950/50 border-white/10 min-h-[80px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Target Settings */}
        <Card className="bg-slate-900/60 border-white/10 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingUp className="w-5 h-5 text-emerald-400" /> Pengaturan
              Target
            </CardTitle>
            <CardDescription>
              Tentukan target pendapatan harian Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-slate-950/30">
              <div className="space-y-0.5">
                <Label className="text-base text-slate-200">
                  Target Dinamis (Auto)
                </Label>
                <p className="text-xs text-slate-400">
                  Target dihitung otomatis (110% dari rata-rata 30 hari).
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="useDynamic"
                  checked={useDynamicTarget}
                  onChange={(e) => setUseDynamicTarget(e.target.checked)}
                  className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
                />
              </div>
            </div>

            {!useDynamicTarget && (
              <div className="grid gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <Label htmlFor="manualTarget" className="text-slate-300">
                  Target Manual (Rp)
                </Label>
                <Input
                  id="manualTarget"
                  type="number"
                  value={manualTarget}
                  onChange={(e) => setManualTarget(Number(e.target.value))}
                  className="bg-slate-950/50 border-white/10"
                />
                <p className="text-xs text-slate-500">
                  Contoh: 2500000 untuk target Rp 2.5 Jt
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Salary Settings */}
        <Card className="bg-slate-900/60 border-white/10 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <WalletMinimal className="w-5 h-5 text-amber-400" /> Pengaturan
              Gaji
            </CardTitle>
            <CardDescription>
              Tentukan gaji harian untuk perhitungan laporan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <Label htmlFor="salary" className="text-slate-300">
                Gaji Harian (Rp)
              </Label>
              <Input
                id="salary"
                type="number"
                value={salaryPerDay}
                onChange={(e) => setSalaryPerDay(Number(e.target.value))}
                className="bg-slate-950/50 border-white/10"
              />
              <p className="text-xs text-slate-500">
                Digunakan untuk mengurangi profit bersih dalam laporan.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            size="lg"
            className={`
                    min-w-[150px] transition-all
                    ${
                      isSaved
                        ? "bg-emerald-500 hover:bg-emerald-600"
                        : "bg-cyan-500 hover:bg-cyan-600"
                    }
                `}
          >
            {isSaved ? (
              <>
                <div className="mr-2 h-4 w-4 bg-white rounded-full flex items-center justify-center">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="w-3 h-3 text-emerald-500 stroke-current stroke-2"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                Tersimpan!
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> Simpan Perubahan
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
