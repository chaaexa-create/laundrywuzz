"use client";

import { useState } from "react";
import { Plus, UserCog } from "lucide-react";
import { useRouter } from "next/navigation";
import { createKasir, type KasirWithEmail } from "@/app/(app)/pengaturan/actions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { formatDateShort } from "@/lib/utils/format";

interface ManajemenKasirProps {
  initialKasir: KasirWithEmail[];
}

const emptyForm = { fullName: "", email: "", password: "" };

export function ManajemenKasir({ initialKasir }: ManajemenKasirProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function openModal() {
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const result = await createKasir(form);

    if (!result.success) {
      setError(result.message);
      setSaving(false);
      return;
    }

    setModalOpen(false);
    setSuccess(result.message);
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400">
            <UserCog className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Manajemen Kasir
            </h2>
            <p className="text-sm text-zinc-500">
              Daftar akun kasir yang dapat mengakses sistem
            </p>
          </div>
        </div>
        <Button onClick={openModal}>
          <Plus className="h-4 w-4" />
          Tambah Kasir Baru
        </Button>
      </div>

      {success && (
        <p className="rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          {success}
        </p>
      )}

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
                <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">
                  Nama Lengkap
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">
                  Email
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">
                  Terdaftar
                </th>
              </tr>
            </thead>
            <tbody>
              {initialKasir.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-8 text-center text-zinc-500"
                  >
                    Belum ada kasir terdaftar
                  </td>
                </tr>
              ) : (
                initialKasir.map((kasir) => (
                  <tr
                    key={kasir.id}
                    className="border-b border-zinc-100 dark:border-zinc-800"
                  >
                    <td className="px-4 py-3 font-medium">{kasir.full_name}</td>
                    <td className="px-4 py-3">{kasir.email}</td>
                    <td className="px-4 py-3 text-zinc-500">
                      {formatDateShort(kasir.created_at)}
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
        title="Tambah Kasir Baru"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Lengkap"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            placeholder="Contoh: Budi Santoso"
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="kasir@laundry.com"
            required
            autoComplete="off"
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Minimal 6 karakter"
            required
            minLength={6}
            autoComplete="new-password"
          />

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Mendaftarkan..." : "Daftarkan Kasir"}
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
