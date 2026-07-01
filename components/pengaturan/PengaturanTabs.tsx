"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { ManajemenKasir } from "@/components/pengaturan/ManajemenKasir";
import { PengaturanForm } from "@/components/pengaturan/PengaturanForm";
import type { KasirWithEmail } from "@/app/(app)/pengaturan/actions";
import type { PaketLaundry } from "@/types/database";

type Tab = "harga" | "kasir";

interface PengaturanTabsProps {
  initialPaket: PaketLaundry[];
  initialKasir: KasirWithEmail[];
}

const tabs: { id: Tab; label: string }[] = [
  { id: "harga", label: "Pengaturan Harga" },
  { id: "kasir", label: "Manajemen Kasir" },
];

export function PengaturanTabs({
  initialPaket,
  initialKasir,
}: PengaturanTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("harga");

  return (
    <div>
      <div className="mb-6 flex gap-1 rounded-xl border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-800 dark:bg-zinc-900">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "harga" && <PengaturanForm initialPaket={initialPaket} />}
      {activeTab === "kasir" && (
        <ManajemenKasir initialKasir={initialKasir} />
      )}
    </div>
  );
}
