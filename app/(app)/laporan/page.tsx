"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { createClient } from "@/lib/supabase/client";
import {
  buildPaketLabel,
  exportLaporanExcel,
  type TransaksiExportRow,
} from "@/lib/utils/export-laporan";
import { formatRupiah } from "@/lib/utils/format";
import { metodePembayaranLabels } from "@/lib/utils/labels";

type FilterMetode = "all" | "cash" | "qris";

function getDefaultDateRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return {
    mulai: start.toISOString().slice(0, 10),
    selesai: now.toISOString().slice(0, 10),
  };
}

interface TransaksiLaporanRow {
  nomor_nota: string;
  tanggal_masuk: string;
  berat_kg: number;
  total_harga: number;
  status_pembayaran: string;
  metode_pembayaran: string | null;
  status_transaksi: string;
  pelanggan: { nama: string; nomor_hp: string } | null;
  paket_laundry: { nama_paket: string; jenis: string; tipe: string } | null;
}

export default function LaporanPage() {
  const supabase = createClient();
  const defaults = getDefaultDateRange();
  const [transaksi, setTransaksi] = useState<TransaksiLaporanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [filterMetode, setFilterMetode] = useState<FilterMetode>("all");
  const [tanggalMulai, setTanggalMulai] = useState(defaults.mulai);
  const [tanggalSelesai, setTanggalSelesai] = useState(defaults.selesai);
  const [dateError, setDateError] = useState("");

  const loadLaporan = useCallback(async () => {
    if (tanggalMulai > tanggalSelesai) {
      setDateError("Tanggal mulai tidak boleh setelah tanggal selesai.");
      setTransaksi([]);
      setLoading(false);
      return;
    }

    setDateError("");
    setLoading(true);

    const start = new Date(`${tanggalMulai}T00:00:00`).toISOString();
    const end = new Date(`${tanggalSelesai}T23:59:59.999`).toISOString();

    const { data } = await supabase
      .from("transaksi")
      .select(
        `
        nomor_nota,
        tanggal_masuk,
        berat_kg,
        total_harga,
        status_pembayaran,
        metode_pembayaran,
        status_transaksi,
        pelanggan:pelanggan_id (nama, nomor_hp),
        paket_laundry:paket_id (nama_paket, jenis, tipe)
      `
      )
      .eq("status_pembayaran", "lunas")
      .gte("tanggal_masuk", start)
      .lte("tanggal_masuk", end)
      .order("tanggal_masuk", { ascending: false });

    setTransaksi((data as unknown as TransaksiLaporanRow[]) ?? []);
    setLoading(false);
  }, [supabase, tanggalMulai, tanggalSelesai]);

  useEffect(() => {
    loadLaporan();
  }, [loadLaporan]);

  const filtered = useMemo(() => {
    if (filterMetode === "all") return transaksi;
    return transaksi.filter((t) => t.metode_pembayaran === filterMetode);
  }, [transaksi, filterMetode]);

  const summary = useMemo(() => {
    const total = filtered.reduce((s, t) => s + Number(t.total_harga), 0);
    const cash = transaksi
      .filter((t) => t.metode_pembayaran === "cash")
      .reduce((s, t) => s + Number(t.total_harga), 0);
    const qris = transaksi
      .filter((t) => t.metode_pembayaran === "qris")
      .reduce((s, t) => s + Number(t.total_harga), 0);
    return { total, cash, qris, count: filtered.length };
  }, [filtered, transaksi]);

  const chartData = [
    { metode: "Cash", total: summary.cash },
    { metode: "QRIS", total: summary.qris },
  ];

  function toExportRows(rows: TransaksiLaporanRow[]): TransaksiExportRow[] {
    return rows.map((t) => ({
      nomor_nota: t.nomor_nota,
      tanggal_masuk: t.tanggal_masuk,
      pelanggan_nama: t.pelanggan?.nama ?? "-",
      pelanggan_hp: t.pelanggan?.nomor_hp ?? "-",
      paket_nama: t.paket_laundry
        ? buildPaketLabel(
            t.paket_laundry.nama_paket,
            t.paket_laundry.jenis,
            t.paket_laundry.tipe
          )
        : "-",
      berat_kg: Number(t.berat_kg),
      total_harga: Number(t.total_harga),
      status_pembayaran: t.status_pembayaran,
      metode_pembayaran: t.metode_pembayaran,
      status_transaksi: t.status_transaksi,
    }));
  }

  function handleExportExcel() {
    if (dateError || filtered.length === 0) return;

    setExporting(true);
    try {
      exportLaporanExcel({
        transaksi: toExportRows(filtered),
        tanggalMulai,
        tanggalSelesai,
        totalPendapatan: summary.total,
        totalCash: summary.cash,
        totalQris: summary.qris,
      });
    } finally {
      setExporting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Laporan Keuangan"
        description="Ringkasan pendapatan berdasarkan rentang waktu"
        action={
          <Button
            variant="secondary"
            onClick={handleExportExcel}
            disabled={loading || exporting || !!dateError || filtered.length === 0}
          >
            <Download className="h-4 w-4" />
            {exporting ? "Mengekspor..." : "Unduh Excel"}
          </Button>
        }
      />

      <Card className="mb-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            label="Tanggal Mulai"
            type="date"
            value={tanggalMulai}
            onChange={(e) => setTanggalMulai(e.target.value)}
            max={tanggalSelesai}
          />
          <Input
            label="Tanggal Selesai"
            type="date"
            value={tanggalSelesai}
            onChange={(e) => setTanggalSelesai(e.target.value)}
            min={tanggalMulai}
          />
          <Select
            label="Metode Pembayaran"
            value={filterMetode}
            onChange={(e) => setFilterMetode(e.target.value as FilterMetode)}
            options={[
              { value: "all", label: "Semua Metode" },
              ...Object.entries(metodePembayaranLabels).map(
                ([value, label]) => ({ value, label })
              ),
            ]}
          />
        </div>
        {dateError && (
          <p className="mt-3 text-sm text-red-500">{dateError}</p>
        )}
      </Card>

      {loading ? (
        <p className="text-sm text-zinc-500">Memuat laporan...</p>
      ) : (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <Card>
              <p className="text-xs text-zinc-500">Total Pendapatan</p>
              <p className="mt-1 text-2xl font-semibold">
                {formatRupiah(summary.total)}
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                {summary.count} transaksi lunas
              </p>
            </Card>
            <Card>
              <p className="text-xs text-zinc-500">Pendapatan Cash</p>
              <p className="mt-1 text-2xl font-semibold text-emerald-600">
                {formatRupiah(summary.cash)}
              </p>
            </Card>
            <Card>
              <p className="text-xs text-zinc-500">Pendapatan QRIS</p>
              <p className="mt-1 text-2xl font-semibold text-blue-600">
                {formatRupiah(summary.qris)}
              </p>
            </Card>
          </div>

          <Card title="Perbandingan Cash vs QRIS">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metode" />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) => formatRupiah(Number(value))}
                  />
                  <Bar dataKey="total" fill="#18181b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
