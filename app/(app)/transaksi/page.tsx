"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
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
import type { StatusTransaksi, TransaksiWithRelations } from "@/types/database";

export default function TransaksiPage() {
  const supabase = createClient();
  const [transaksi, setTransaksi] = useState<TransaksiWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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

  async function togglePembayaran(
    id: string,
    current: string,
    metode: string | null
  ) {
    setUpdatingId(id);
    const newStatus = current === "lunas" ? "belum_bayar" : "lunas";
    await supabase
      .from("transaksi")
      .update({
        status_pembayaran: newStatus,
        metode_pembayaran: newStatus === "lunas" ? metode || "cash" : null,
      })
      .eq("id", id);
    await loadTransaksi();
    setUpdatingId(null);
  }

  const statusOptions = Object.entries(statusTransaksiLabels).map(
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
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
                <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">
                  Nota
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">
                  Pelanggan
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">
                  Paket
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">
                  Berat
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">
                  Total
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">
                  Bayar
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">
                  Ubah Status
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-zinc-500">
                    Memuat data...
                  </td>
                </tr>
              ) : transaksi.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-zinc-500">
                    Belum ada transaksi
                  </td>
                </tr>
              ) : (
                transaksi.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-zinc-100 dark:border-zinc-800"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">
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
                      <button
                        onClick={() =>
                          togglePembayaran(
                            item.id,
                            item.status_pembayaran,
                            item.metode_pembayaran
                          )
                        }
                        disabled={updatingId === item.id}
                        className="cursor-pointer"
                      >
                        <Badge
                          variant={statusPembayaranVariant(
                            item.status_pembayaran
                          )}
                        >
                          {statusPembayaranLabels[item.status_pembayaran]}
                          {item.metode_pembayaran &&
                            ` (${metodePembayaranLabels[item.metode_pembayaran]})`}
                        </Badge>
                      </button>
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
                        className={cn(
                          "min-w-[130px] rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
                        )}
                      >
                        {statusOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
