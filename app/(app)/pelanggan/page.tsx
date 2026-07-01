"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { createClient } from "@/lib/supabase/client";
import { formatDateShort } from "@/lib/utils/format";
import type { Pelanggan } from "@/types/database";

const emptyForm = { nama: "", nomor_hp: "", alamat: "" };

export default function PelangganPage() {
  const supabase = createClient();
  const [pelanggan, setPelanggan] = useState<Pelanggan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadPelanggan = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("pelanggan")
      .select("*")
      .order("nama");
    setPelanggan(data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadPelanggan();
  }, [loadPelanggan]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  }

  function openEdit(p: Pelanggan) {
    setEditingId(p.id);
    setForm({ nama: p.nama, nomor_hp: p.nomor_hp, alamat: p.alamat });
    setError("");
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    if (!form.nama.trim()) {
      setError("Nama pelanggan wajib diisi.");
      setSaving(false);
      return;
    }

    if (editingId) {
      const { error: updateError } = await supabase
        .from("pelanggan")
        .update(form)
        .eq("id", editingId);
      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return;
      }
    } else {
      const { error: insertError } = await supabase
        .from("pelanggan")
        .insert(form);
      if (insertError) {
        setError(insertError.message);
        setSaving(false);
        return;
      }
    }

    setModalOpen(false);
    setSaving(false);
    await loadPelanggan();
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus pelanggan ini?")) return;
    await supabase.from("pelanggan").delete().eq("id", id);
    await loadPelanggan();
  }

  const filtered = pelanggan.filter(
    (p) =>
      p.nama.toLowerCase().includes(search.toLowerCase()) ||
      p.nomor_hp.includes(search)
  );

  return (
    <div>
      <PageHeader
        title="Pelanggan"
        description="Kelola data pelanggan laundry"
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Tambah Pelanggan
          </Button>
        }
      />

      <Card className="mb-6">
        <Input
          label="Cari pelanggan"
          placeholder="Nama atau nomor HP..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
                <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">
                  Nama
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">
                  No. HP
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">
                  Alamat
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">
                  Terdaftar
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                    Memuat data...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                    Tidak ada pelanggan
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-zinc-100 dark:border-zinc-800"
                  >
                    <td className="px-4 py-3 font-medium">{p.nama}</td>
                    <td className="px-4 py-3">{p.nomor_hp || "-"}</td>
                    <td className="px-4 py-3 max-w-xs truncate">
                      {p.alamat || "-"}
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {formatDateShort(p.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => openEdit(p)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(p.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Pelanggan" : "Tambah Pelanggan"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama"
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
            required
          />
          <Input
            label="Nomor HP"
            value={form.nomor_hp}
            onChange={(e) => setForm({ ...form, nomor_hp: e.target.value })}
            placeholder="08xxxxxxxxxx"
          />
          <Input
            label="Alamat"
            value={form.alamat}
            onChange={(e) => setForm({ ...form, alamat: e.target.value })}
          />
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setModalOpen(false)}
            >
              Batal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
