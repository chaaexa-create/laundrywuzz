"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { metodePembayaranLabels } from "@/lib/utils/labels";
import type { MetodePembayaran } from "@/types/database";

interface MetodePembayaranModalProps {
  open: boolean;
  nomorNota?: string;
  onClose: () => void;
  onConfirm: (metode: MetodePembayaran) => void;
  loading?: boolean;
}

export function MetodePembayaranModal({
  open,
  nomorNota,
  onClose,
  onConfirm,
  loading = false,
}: MetodePembayaranModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Pilih Metode Pembayaran"
      className="max-w-sm"
    >
      <p className="mb-4 text-sm text-slate-600 dark:text-zinc-400">
        {nomorNota
          ? `Transaksi ${nomorNota} ditandai lunas. Pilih metode pembayaran:`
          : "Pilih metode pembayaran untuk transaksi ini:"}
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        {(Object.entries(metodePembayaranLabels) as [MetodePembayaran, string][]).map(
          ([value, label]) => (
            <Button
              key={value}
              type="button"
              className="flex-1"
              disabled={loading}
              onClick={() => onConfirm(value)}
            >
              {label}
            </Button>
          )
        )}
      </div>
      <Button
        type="button"
        variant="ghost"
        className="mt-3 w-full"
        onClick={onClose}
        disabled={loading}
      >
        Batal
      </Button>
    </Modal>
  );
}
