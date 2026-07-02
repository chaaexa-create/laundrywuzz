"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface HapusTransaksiDialogProps {
  open: boolean;
  nomorNota: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function HapusTransaksiDialog({
  open,
  nomorNota,
  loading = false,
  onClose,
  onConfirm,
}: HapusTransaksiDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Hapus Transaksi"
      className="max-w-md"
    >
      <p className="mb-6 text-sm text-slate-600 dark:text-zinc-400">
        Apakah Anda yakin ingin menghapus transaksi{" "}
        <span className="font-semibold text-slate-900 dark:text-zinc-100">
          {nomorNota}
        </span>{" "}
        ini? Tindakan ini tidak dapat dibatalkan.
      </p>
      <div className="flex gap-3">
        <Button
          type="button"
          variant="danger"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? "Menghapus..." : "Ya, Hapus"}
        </Button>
        <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
          Batal
        </Button>
      </div>
    </Modal>
  );
}
