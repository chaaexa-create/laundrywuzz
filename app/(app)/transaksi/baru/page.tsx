"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { TambahPelangganCepat } from "@/components/transaksi/TambahPelangganCepat";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { createClient } from "@/lib/supabase/client";
import { formatRupiah, generateNomorNota } from "@/lib/utils/format";
import {
  jenisLabels,
  metodePembayaranLabels,
  statusPembayaranLabels,
  tipeLabels,
} from "@/lib/utils/labels";
import type { PaketLaundry, Pelanggan } from "@/types/database";

export default function TransaksiBaruPage() {
  const router = useRouter();
  const supabase = createClient();

  const [pelangganList, setPelangganList] = useState<Pelanggan[]>([]);
  const [paketList, setPaketList] = useState<PaketLaundry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [pelangganId, setPelangganId] = useState("");
  const [paketId, setPaketId] = useState("");
  const [beratKg, setBeratKg] = useState("");
  const [statusPembayaran, setStatusPembayaran] = useState("belum_bayar");
  const [metodePembayaran, setMetodePembayaran] = useState("cash");

  const loadPelanggan = useCallback(async () => {
    const { data } = await supabase.from("pelanggan").select("*").order("nama");
    setPelangganList(data ?? []);
  }, [supabase]);

  useEffect(() => {
    async function loadData() {
      const [, { data: paket }] = await Promise.all([
        loadPelanggan(),
        supabase.from("paket_laundry").select("*").order("nama_paket"),
      ]);
      setPaketList(paket ?? []);
    }
    loadData();
  }, [supabase, loadPelanggan]);

  const selectedPaket = useMemo(
    () => paketList.find((p) => p.id === paketId),
    [paketList, paketId]
  );

  const totalHarga = useMemo(() => {
    const berat = parseFloat(beratKg);
    if (!selectedPaket || isNaN(berat) || berat <= 0) return 0;
    return berat * Number(selectedPaket.harga_per_kg);
  }, [beratKg, selectedPaket]);

  function handlePelangganAdded(pelanggan: Pelanggan) {
    setPelangganList((prev) =>
      [...prev.filter((p) => p.id !== pelanggan.id), pelanggan].sort((a, b) =>
        a.nama.localeCompare(b.nama)
      )
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!pelangganId || !paketId || totalHarga <= 0) {
      setError("Lengkapi semua data transaksi.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("transaksi").insert({
      pelanggan_id: pelangganId,
      paket_id: paketId,
      berat_kg: parseFloat(beratKg),
      total_harga: totalHarga,
      status_pembayaran: statusPembayaran,
      metode_pembayaran:
        statusPembayaran === "lunas" ? metodePembayaran : null,
      status_transaksi: "antrean",
      nomor_nota: generateNomorNota(),
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push("/transaksi");
    router.refresh();
  }

  return (
    <div>
      <PageHeader
        title="Transaksi Baru"
        description="Input pesanan laundry pelanggan"
      />

      <Card className="max-w-2xl space-y-5">
        <TambahPelangganCepat
          pelangganId={pelangganId}
          pelangganList={pelangganList}
          onPelangganChange={setPelangganId}
          onPelangganAdded={handlePelangganAdded}
        />

        <form onSubmit={handleSubmit} className="space-y-5">
          <Select
            label="Paket Laundry"
            value={paketId}
            onChange={(e) => setPaketId(e.target.value)}
            options={[
              { value: "", label: "Pilih paket..." },
              ...paketList.map((p) => ({
                value: p.id,
                label: `${p.nama_paket} (${formatRupiah(Number(p.harga_per_kg))}/kg)`,
              })),
            ]}
            required
          />

          {selectedPaket && (
            <div className="rounded-xl bg-zinc-50 px-4 py-3 text-sm dark:bg-zinc-800/50">
              <p className="text-zinc-600 dark:text-zinc-400">
                {jenisLabels[selectedPaket.jenis]} ·{" "}
                {tipeLabels[selectedPaket.tipe]} · Estimasi{" "}
                {selectedPaket.estimasi_jam} jam
              </p>
            </div>
          )}

          <Input
            label="Berat (kg)"
            type="number"
            step="0.1"
            min="0.1"
            placeholder="Contoh: 3.5"
            value={beratKg}
            onChange={(e) => setBeratKg(e.target.value)}
            required
          />

          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 dark:border-zinc-700 dark:bg-zinc-800/30">
            <p className="text-sm text-zinc-500">Total Harga</p>
            <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
              {formatRupiah(totalHarga)}
            </p>
          </div>

          <Select
            label="Status Pembayaran"
            value={statusPembayaran}
            onChange={(e) => setStatusPembayaran(e.target.value)}
            options={Object.entries(statusPembayaranLabels).map(
              ([value, label]) => ({ value, label })
            )}
          />

          {statusPembayaran === "lunas" && (
            <Select
              label="Metode Pembayaran"
              value={metodePembayaran}
              onChange={(e) => setMetodePembayaran(e.target.value)}
              options={Object.entries(metodePembayaranLabels).map(
                ([value, label]) => ({ value, label })
              )}
            />
          )}

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Transaksi"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              Batal
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
