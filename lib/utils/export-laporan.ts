import * as XLSX from "xlsx";
import { formatDate } from "@/lib/utils/format";
import {
  jenisLabels,
  metodePembayaranLabels,
  statusPembayaranLabels,
  statusTransaksiLabels,
  tipeLabels,
} from "@/lib/utils/labels";

export interface TransaksiExportRow {
  nomor_nota: string;
  tanggal_masuk: string;
  pelanggan_nama: string;
  pelanggan_hp: string;
  paket_nama: string;
  berat_kg: number;
  total_harga: number;
  status_pembayaran: string;
  metode_pembayaran: string | null;
  status_transaksi: string;
}

interface ExportLaporanParams {
  transaksi: TransaksiExportRow[];
  tanggalMulai: string;
  tanggalSelesai: string;
  totalPendapatan: number;
  totalCash: number;
  totalQris: number;
}

function formatCurrencyExcel(value: number): number {
  return Math.round(value);
}

export function exportLaporanExcel({
  transaksi,
  tanggalMulai,
  tanggalSelesai,
  totalPendapatan,
  totalCash,
  totalQris,
}: ExportLaporanParams) {
  const workbook = XLSX.utils.book_new();

  const summaryRows = [
    ["LAPORAN KEUANGAN KASIR LAUNDRY"],
    [],
    ["Periode", `${tanggalMulai} s/d ${tanggalSelesai}`],
    ["Dicetak pada", formatDate(new Date())],
    [],
    ["RINGKASAN PENDAPATAN"],
    ["Keterangan", "Jumlah (Rp)", "Transaksi"],
    [
      "Total Pendapatan (Lunas)",
      formatCurrencyExcel(totalPendapatan),
      transaksi.length,
    ],
    ["Pendapatan Cash", formatCurrencyExcel(totalCash), ""],
    ["Pendapatan QRIS", formatCurrencyExcel(totalQris), ""],
    [],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
  summarySheet["!cols"] = [{ wch: 32 }, { wch: 18 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Ringkasan");

  const detailHeader = [
    "No. Nota",
    "Tanggal Masuk",
    "Pelanggan",
    "No. HP",
    "Paket",
    "Berat (kg)",
    "Total (Rp)",
    "Status Bayar",
    "Metode Bayar",
    "Status Laundry",
  ];

  const detailRows = transaksi.map((t) => [
    t.nomor_nota,
    formatDate(t.tanggal_masuk),
    t.pelanggan_nama,
    t.pelanggan_hp,
    t.paket_nama,
    Number(t.berat_kg),
    formatCurrencyExcel(Number(t.total_harga)),
    statusPembayaranLabels[
      t.status_pembayaran as keyof typeof statusPembayaranLabels
    ] ?? t.status_pembayaran,
    t.metode_pembayaran
      ? metodePembayaranLabels[
          t.metode_pembayaran as keyof typeof metodePembayaranLabels
        ]
      : "-",
    statusTransaksiLabels[
      t.status_transaksi as keyof typeof statusTransaksiLabels
    ] ?? t.status_transaksi,
  ]);

  const detailSheet = XLSX.utils.aoa_to_sheet([detailHeader, ...detailRows]);
  detailSheet["!cols"] = [
    { wch: 18 },
    { wch: 20 },
    { wch: 22 },
    { wch: 14 },
    { wch: 24 },
    { wch: 10 },
    { wch: 14 },
    { wch: 14 },
    { wch: 12 },
    { wch: 14 },
  ];
  XLSX.utils.book_append_sheet(workbook, detailSheet, "Detail Transaksi");

  const metodeRows = [
    ["REKAP METODE PEMBAYARAN"],
    [],
    ["Metode", "Total (Rp)", "Persentase"],
    [
      "Cash",
      formatCurrencyExcel(totalCash),
      totalPendapatan > 0
        ? `${((totalCash / totalPendapatan) * 100).toFixed(1)}%`
        : "0%",
    ],
    [
      "QRIS",
      formatCurrencyExcel(totalQris),
      totalPendapatan > 0
        ? `${((totalQris / totalPendapatan) * 100).toFixed(1)}%`
        : "0%",
    ],
    ["Total", formatCurrencyExcel(totalPendapatan), "100%"],
  ];

  const metodeSheet = XLSX.utils.aoa_to_sheet(metodeRows);
  metodeSheet["!cols"] = [{ wch: 16 }, { wch: 18 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(workbook, metodeSheet, "Metode Pembayaran");

  const filename = `Laporan_Laundry_${tanggalMulai}_${tanggalSelesai}.xlsx`;
  XLSX.writeFile(workbook, filename);
}

export function buildPaketLabel(
  nama: string,
  jenis?: string,
  tipe?: string
): string {
  if (!jenis || !tipe) return nama;
  return `${nama} (${jenisLabels[jenis as keyof typeof jenisLabels]} · ${tipeLabels[tipe as keyof typeof tipeLabels]})`;
}
