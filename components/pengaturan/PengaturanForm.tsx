"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { formatRupiah } from "@/lib/utils/format";
import { jenisLabels, tipeLabels } from "@/lib/utils/labels";
import type { PaketLaundry } from "@/types/database";

interface PengaturanFormProps {
  initialPaket: PaketLaundry[];
}

export function PengaturanForm({ initialPaket }: PengaturanFormProps) {
  const supabase = createClient();
  const [paket, setPaket] = useState(initialPaket);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  function updateField(id: string, field: "harga_per_kg" | "estimasi_jam", value: string) {
    setPaket((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, [field]: field === "harga_per_kg" ? parseFloat(value) || 0 : parseInt(value) || 0 }
          : p
      )
    );
  }

  async function savePaket(item: PaketLaundry) {
    setSavingId(item.id);
    setMessage("");

    const { error } = await supabase
      .from("paket_laundry")
      .update({
        harga_per_kg: item.harga_per_kg,
        estimasi_jam: item.estimasi_jam,
      })
      .eq("id", item.id);

    if (error) {
      setMessage(`Gagal menyimpan: ${error.message}`);
    } else {
      setMessage(`Harga ${item.nama_paket} berhasil diperbarui.`);
    }
    setSavingId(null);
  }

  return (
    <div className="space-y-4">
      {message && (
        <p className="rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          {message}
        </p>
      )}

      {paket.map((item) => (
        <Card key={item.id}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                {item.nama_paket}
              </h3>
              <p className="text-sm text-zinc-500">
                {jenisLabels[item.jenis]} · {tipeLabels[item.tipe]} · Saat ini{" "}
                {formatRupiah(Number(item.harga_per_kg))}/kg
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <Input
                label="Harga/kg (Rp)"
                type="number"
                min="0"
                step="500"
                value={item.harga_per_kg}
                onChange={(e) =>
                  updateField(item.id, "harga_per_kg", e.target.value)
                }
                className="w-full sm:w-40"
              />
              <Input
                label="Estimasi (jam)"
                type="number"
                min="1"
                value={item.estimasi_jam}
                onChange={(e) =>
                  updateField(item.id, "estimasi_jam", e.target.value)
                }
                className="w-full sm:w-32"
              />
              <Button
                onClick={() => savePaket(item)}
                disabled={savingId === item.id}
              >
                <Save className="h-4 w-4" />
                {savingId === item.id ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
