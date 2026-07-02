"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { createClient } from "@/lib/supabase/client";
import { formatRupiah } from "@/lib/utils/format";
import {
  jenisLabels,
  metodePembayaranLabels,
  statusPembayaranLabels,
  statusTransaksiLabels,
  tipeLabels,
} from "@/lib/utils/labels";
import type {
  MetodePembayaran,
  PaketLaundry,
  Pelanggan,
  StatusPembayaran,
  StatusTransaksi,
  TransaksiWithRelations,
} from "@/types/database";

interface EditTransaksiModalProps {
  open: boolean;
  transaksi: TransaksiWithRelations | null;
  onClose: () => void;
  onSaved: () => void;
}

export function EditTransaksiModal({
  open,
  transaksi,
  onClose,
  onSaved,
}: EditTransaksiModalProps) {
  const supabase = createClient();
  const [pelangganList, setPelangganList] = useState<Pelanggan[]>([]);
  const [paketList, setPaketList] = useState<PaketLaundry[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [pelangganId, setPelangganId] = useState("");
  const [paketId, setPaketId] = useState("");
  const [beratKg, setBeratKg] = useState("");
  const [statusPembayaran, setStatusPembayaran] =
    useState<StatusPembayaran>("belum_bayar");
  const [metodePembayaran, setMetodePembayaran] =
    useState<MetodePembayaran>("cash");
  const [statusTransaksi, setStatusTransaksi] =
    useState<StatusTransaksi>("antrean");

  useEffect(() => {
    if (!open) return;

    async function loadOptions() {
      const [{ data: pelanggan }, { data: paket }] = await Promise.all([
        supabase.from("pelanggan").select("*").order("nama"),
        supabase.from("paket_laundry").select("*").order("nama_paket"),
      ]);
      setPelangganList(pelanggan ?? []);
      setPaketList(paket ?? []);
    }

    loadOptions();
  }, [open, supabase]);

  useEffect(() => {
    if (!transaksi || !open) return;

    setPelangganId(transaksi.pelanggan_id);
    setPaketId(transaksi.paket_id);
    setBeratKg(String(transaksi.berat_kg));
    setStatusPembayaran(transaksi.status_pembayaran);
    setMetodePembayaran(transaksi.metode_pembayaran ?? "cash");
    setStatusTransaksi(transaksi.status_transaksi);
    setError("");
  }, [transaksi, open]);

  const selectedPaket = useMemo(
    () => paketList.find((p) => p.id === paketId),
    [paketList, paketId]
  );

  const totalHarga = useMemo(() => {
    const berat = parseFloat(beratKg);
    if (!selectedPaket || isNaN(berat) || berat <= 0) return 0;
    return berat * Number(selectedPaket.harga_per_kg);
  }, [beratKg, selectedPaket]);

  async function handleSave() {
    if (!transaksi) return;

    setSaving(true);
    setError("");

    if (!pelangganId || !paketId || totalHarga <= 0) {
      setError("Lengkapi semua data transaksi.");
      setSaving(false);
      return;
    }

    if (statusPembayaran === "lunas" && !metodePembayaran) {
      setError("Pilih metode pembayaran (Cash atau QRIS).");
      setSaving(false);
      return;
    }

    const updates: Record<string, unknown> = {
      pelanggan_id: pelangganId,
      paket_id: paketId,
      berat_kg: parseFloat(beratKg),
      total_harga: totalHarga,
      status_pembayaran: statusPembayaran,
      metode_pembayaran: statusPembayaran === "lunas" ? metodePembayaran : null,
      status_transaksi: statusTransaksi,
    };

    if (statusTransaksi === "selesai" || statusTransaksi === "diambil") {
      updates.tanggal_selesai =
        transaksi.tanggal_selesai ?? new Date().toISOString();
    } else {
      updates.tanggal_selesai = null;
    }

    const { error: updateError } = await supabase
      .from("transaksi")
      .update(updates)
      .eq("id", transaksi.id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    onSaved();
    onClose();
  }

  if (!transaksi) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Edit Transaksi ${transaksi.nomor_nota}`}
      className="max-w-lg"
    >
      <div className="space-y-4">
        <Select
          label="Pelanggan"
          value={pelangganId}
          onChange={(e) => setPelangganId(e.target.value)}
          options={[
            { value: "", label: "Pilih pelanggan..." },
            ...pelangganList.map((p) => ({
              value: p.id,
              label: `${p.nama} — ${p.nomor_hp || "No HP"}`,
            })),
          ]}
        />

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
        />

        {selectedPaket && (
          <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm dark:bg-zinc-800/50">
            <p className="text-slate-600 dark:text-zinc-400">
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
          value={beratKg}
          onChange={(e) => setBeratKg(e.target.value)}
        />

        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/30">
          <p className="text-sm text-slate-500">Total Harga</p>
          <p className="text-xl font-semibold text-slate-900 dark:text-zinc-100">
            {formatRupiah(totalHarga)}
          </p>
        </div>

        <Select
          label="Status Pembayaran"
          value={statusPembayaran}
          onChange={(e) =>
            setStatusPembayaran(e.target.value as StatusPembayaran)
          }
          options={Object.entries(statusPembayaranLabels).map(
            ([value, label]) => ({ value, label })
          )}
        />

        <Select
          label="Metode Pembayaran"
          value={statusPembayaran === "lunas" ? metodePembayaran : ""}
          onChange={(e) =>
            setMetodePembayaran(e.target.value as MetodePembayaran)
          }
          disabled={statusPembayaran !== "lunas"}
          options={
            statusPembayaran === "lunas"
              ? Object.entries(metodePembayaranLabels).map(([value, label]) => ({
                  value,
                  label,
                }))
              : [{ value: "", label: "Pilih status Lunas terlebih dahulu" }]
          }
        />

        <Select
          label="Status Transaksi"
          value={statusTransaksi}
          onChange={(e) =>
            setStatusTransaksi(e.target.value as StatusTransaksi)
          }
          options={Object.entries(statusTransaksiLabels).map(
            ([value, label]) => ({ value, label })
          )}
        />

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
        </div>
      </div>
    </Modal>
  );
}
