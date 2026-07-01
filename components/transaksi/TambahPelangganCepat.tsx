"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { createClient } from "@/lib/supabase/client";
import type { Pelanggan } from "@/types/database";

const emptyForm = { nama: "", nomor_hp: "", alamat: "" };

interface TambahPelangganCepatProps {
  pelangganId: string;
  pelangganList: Pelanggan[];
  onPelangganChange: (id: string) => void;
  onPelangganAdded: (pelanggan: Pelanggan) => void;
}

export function TambahPelangganCepat({
  pelangganId,
  pelangganList,
  onPelangganChange,
  onPelangganAdded,
}: TambahPelangganCepatProps) {
  const supabase = createClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function openModal() {
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  }

  async function handleSubmit() {
    setSaving(true);
    setError("");

    if (!form.nama.trim()) {
      setError("Nama pelanggan wajib diisi.");
      setSaving(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from("pelanggan")
      .insert({
        nama: form.nama.trim(),
        nomor_hp: form.nomor_hp.trim(),
        alamat: form.alamat.trim(),
      })
      .select("*")
      .single();

    if (insertError || !data) {
      setError(insertError?.message ?? "Gagal menyimpan pelanggan.");
      setSaving(false);
      return;
    }

    onPelangganAdded(data);
    onPelangganChange(data.id);
    setModalOpen(false);
    setSaving(false);
  }

  return (
    <>
      <div className="space-y-1.5">
        <div className="flex items-end justify-between gap-2">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Pelanggan
          </label>
          <button
            type="button"
            onClick={openModal}
            className="inline-flex items-center gap-1 text-xs font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            <Plus className="h-3.5 w-3.5" />
            Pelanggan Baru
          </button>
        </div>
        <Select
          value={pelangganId}
          onChange={(e) => onPelangganChange(e.target.value)}
          options={[
            { value: "", label: "Pilih pelanggan..." },
            ...pelangganList.map((p) => ({
              value: p.id,
              label: `${p.nama} — ${p.nomor_hp || "No HP"}`,
            })),
          ]}
        />
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Tambah Pelanggan Baru"
      >
        <div className="space-y-4">
          <Input
            label="Nama"
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
            placeholder="Nama pelanggan"
            autoFocus
          />
          <Input
            label="No. HP"
            value={form.nomor_hp}
            onChange={(e) => setForm({ ...form, nomor_hp: e.target.value })}
            placeholder="08xxxxxxxxxx"
          />
          <Input
            label="Alamat"
            value={form.alamat}
            onChange={(e) => setForm({ ...form, alamat: e.target.value })}
            placeholder="Alamat pelanggan"
          />

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" onClick={handleSubmit} disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan & Pilih"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setModalOpen(false)}
            >
              Batal
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
