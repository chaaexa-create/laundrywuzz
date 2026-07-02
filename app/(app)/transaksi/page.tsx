"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, RefreshCw, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { EditTransaksiModal } from "@/components/transaksi/EditTransaksiModal";
import { HapusTransaksiDialog } from "@/components/transaksi/HapusTransaksiDialog";
import { MetodePembayaranModal } from "@/components/transaksi/MetodePembayaranModal";
import {
  Badge,
  statusPembayaranVariant,
  statusTransaksiVariant,
} from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";
import { formatDate, formatRupiah } from "@/lib/utils/format";
import {
  jenisLabels,
  metodePembayaranLabels,
  statusPembayaranLabels,
  statusTransaksiLabels,
  tipeLabels,
} from "@/lib/utils/labels";
import type {
  MetodePembayaran,
  StatusPembayaran,
  StatusTransaksi,
  TransaksiWithRelations,
} from "@/types/database";

interface PendingLunas {
  id: string;
  nomor_nota: string;
}

const selectClass =
  "w-full min-w-[120px] rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:disabled:bg-zinc-800 dark:focus:border-zinc-500 dark:focus:ring-zinc-800";

export default function TransaksiPage() {
  const supabase = createClient();
  const [transaksi, setTransaksi] = useState<TransaksiWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [pendingLunas, setPendingLunas] = useState<PendingLunas | null>(null);
  const [editingTransaksi, setEditingTransaksi] =
    useState<TransaksiWithRelations | null>(null);
  const [deletingTransaksi, setDeletingTransaksi] =
    useState<TransaksiWithRelations | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadTransaksi = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("transaksi")
      .select(
        `
        *,
        pelanggan:pelanggan_id (id, nama, nomor_hp),
        paket_laundry:paket_id (id, nama_paket, jenis, tipe)
      `
      )
      .order("tanggal_masuk", { ascending: false });

    if (filterStatus !== "all") {
      query = query.eq("status_transaksi", filterStatus);
    }

    const { data } = await query;
    setTransaksi((data as TransaksiWithRelations[]) ?? []);
    setLoading(false);
  }, [supabase, filterStatus]);

  useEffect(() => {
    loadTransaksi();
  }, [loadTransaksi]);

  async function updateStatus(id: string, newStatus: StatusTransaksi) {
    setUpdatingId(id);
    const updates: Record<string, unknown> = { status_transaksi: newStatus };

    if (newStatus === "selesai" || newStatus === "diambil") {
      updates.tanggal_selesai = new Date().toISOString();
    } else {
      updates.tanggal_selesai = null;
    }

    await supabase.from("transaksi").update(updates).eq("id", id);
    await loadTransaksi();
    setUpdatingId(null);
  }

  async function setBelumBayar(id: string) {
    setUpdatingId(id);
    await supabase
      .from("transaksi")
      .update({
        status_pembayaran: "belum_bayar",
        metode_pembayaran: null,
      })
      .eq("id", id);
    await loadTransaksi();
    setUpdatingId(null);
  }

  async function setLunas(id: string, metode: MetodePembayaran) {
    setUpdatingId(id);
    await supabase
      .from("transaksi")
      .update({
        status_pembayaran: "lunas",
        metode_pembayaran: metode,
      })
      .eq("id", id);
    await loadTransaksi();
    setUpdatingId(null);
  }

  async function updateMetode(id: string, metode: MetodePembayaran) {
    setUpdatingId(id);
    await supabase
      .from("transaksi")
      .update({
        status_pembayaran: "lunas",
        metode_pembayaran: metode,
      })
      .eq("id", id);
    await loadTransaksi();
    setUpdatingId(null);
  }

  function handleStatusPembayaranChange(
    item: TransaksiWithRelations,
    newStatus: StatusPembayaran
  ) {
    if (newStatus === item.status_pembayaran) return;

    if (newStatus === "belum_bayar") {
      setBelumBayar(item.id);
      return;
    }

    setPendingLunas({ id: item.id, nomor_nota: item.nomor_nota });
  }

  async function handleConfirmMetode(metode: MetodePembayaran) {
    if (!pendingLunas) return;
    await setLunas(pendingLunas.id, metode);
    setPendingLunas(null);
  }

  async function handleDeleteConfirm() {
    if (!deletingTransaksi) return;

    setDeleting(true);
    setUpdatingId(deletingTransaksi.id);

    const { error } = await supabase
      .from("transaksi")
      .delete()
      .eq("id", deletingTransaksi.id);

    setDeleting(false);
    setUpdatingId(null);

    if (error) {
      alert(`Gagal menghapus: ${error.message}`);
      return;
    }

    setDeletingTransaksi(null);
    await loadTransaksi();
  }

  function handleEditSaved() {
    loadTransaksi();
  }

  const statusOptions = Object.entries(statusTransaksiLabels).map(
    ([value, label]) => ({ value, label })
  );

  const pembayaranOptions = Object.entries(statusPembayaranLabels).map(
    ([value, label]) => ({ value, label })
  );

  const metodeOptions = Object.entries(metodePembayaranLabels).map(
    ([value, label]) => ({ value, label })
  );

  return (
    <div>
      <PageHeader
        title="Daftar Transaksi"
        description="Kelola semua pesanan laundry"
        action={
          <Button variant="secondary" onClick={loadTransaksi}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        }
      />

      <Card className="mb-6">
        <Select
          label="Filter Status"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          options={[
            { value: "all", label: "Semua Status" },
            ...statusOptions,
          ]}
        />
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900/50">
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-zinc-400">
                  Nota
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-zinc-400">
                  Pelanggan
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-zinc-400">
                  Paket
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-zinc-400">
                  Berat
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-zinc-400">
                  Total
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-zinc-400">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-zinc-400">
                  Pembayaran
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-zinc-400">
                  Ubah Status
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-zinc-400">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-zinc-500">
                    Memuat data...
                  </td>
                </tr>
              ) : transaksi.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-zinc-500">
                    Belum ada transaksi
                  </td>
                </tr>
              ) : (
                transaksi.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100 dark:border-zinc-800"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900 dark:text-zinc-100">
                        {item.nomor_nota}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {formatDate(item.tanggal_masuk)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p>{item.pelanggan?.nama ?? "-"}</p>
                      <p className="text-xs text-zinc-500">
                        {item.pelanggan?.nomor_hp}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {item.paket_laundry ? (
                        <>
                          <p>{item.paket_laundry.nama_paket}</p>
                          <p className="text-xs text-zinc-500">
                            {jenisLabels[item.paket_laundry.jenis]} ·{" "}
                            {tipeLabels[item.paket_laundry.tipe]}
                          </p>
                        </>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-3">{item.berat_kg} kg</td>
                    <td className="px-4 py-3 font-medium">
                      {formatRupiah(Number(item.total_harga))}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={statusTransaksiVariant(item.status_transaksi)}
                      >
                        {statusTransaksiLabels[item.status_transaksi]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex min-w-[140px] flex-col gap-1.5">
                        <select
                          value={item.status_pembayaran}
                          disabled={updatingId === item.id}
                          onChange={(e) =>
                            handleStatusPembayaranChange(
                              item,
                              e.target.value as StatusPembayaran
                            )
                          }
                          className={selectClass}
                        >
                          {pembayaranOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>

                        {item.status_pembayaran === "lunas" ? (
                          <select
                            value={item.metode_pembayaran ?? ""}
                            disabled={updatingId === item.id}
                            onChange={(e) => {
                              if (!e.target.value) return;
                              updateMetode(
                                item.id,
                                e.target.value as MetodePembayaran
                              );
                            }}
                            className={selectClass}
                          >
                            {!item.metode_pembayaran && (
                              <option value="" disabled>
                                Pilih metode...
                              </option>
                            )}
                            {metodeOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="px-1 text-xs text-slate-400 dark:text-zinc-500">
                            Metode: —
                          </span>
                        )}

                        {item.status_pembayaran === "lunas" &&
                          item.metode_pembayaran && (
                            <Badge
                              variant={statusPembayaranVariant("lunas")}
                              className="w-fit"
                            >
                              Lunas (
                              {
                                metodePembayaranLabels[
                                  item.metode_pembayaran
                                ]
                              }
                              )
                            </Badge>
                          )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={item.status_transaksi}
                        disabled={updatingId === item.id}
                        onChange={(e) =>
                          updateStatus(
                            item.id,
                            e.target.value as StatusTransaksi
                          )
                        }
                        className={cn(selectClass, "min-w-[130px]")}
                      >
                        {statusOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={updatingId === item.id}
                          onClick={() => setEditingTransaksi(item)}
                          aria-label={`Edit ${item.nomor_nota}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          disabled={updatingId === item.id}
                          onClick={() => setDeletingTransaksi(item)}
                          aria-label={`Hapus ${item.nomor_nota}`}
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

      <MetodePembayaranModal
        open={!!pendingLunas}
        nomorNota={pendingLunas?.nomor_nota}
        onClose={() => setPendingLunas(null)}
        onConfirm={handleConfirmMetode}
        loading={!!updatingId}
      />

      <EditTransaksiModal
        open={!!editingTransaksi}
        transaksi={editingTransaksi}
        onClose={() => setEditingTransaksi(null)}
        onSaved={handleEditSaved}
      />

      <HapusTransaksiDialog
        open={!!deletingTransaksi}
        nomorNota={deletingTransaksi?.nomor_nota ?? ""}
        loading={deleting}
        onClose={() => setDeletingTransaksi(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
