import type {
  JenisLaundry,
  MetodePembayaran,
  StatusPembayaran,
  StatusTransaksi,
  TipePaket,
  UserRole,
} from "@/types/database";

export const jenisLabels: Record<JenisLaundry, string> = {
  cuci_lipat: "Cuci Lipat",
  cuci_setrika: "Cuci + Setrika",
};

export const tipeLabels: Record<TipePaket, string> = {
  reguler: "Reguler",
  express: "Express",
  kilat: "Kilat",
};

export const statusPembayaranLabels: Record<StatusPembayaran, string> = {
  belum_bayar: "Belum Bayar",
  lunas: "Lunas",
};

export const metodePembayaranLabels: Record<MetodePembayaran, string> = {
  cash: "Cash",
  qris: "QRIS",
};

export const statusTransaksiLabels: Record<StatusTransaksi, string> = {
  antrean: "Antrean",
  dicuci: "Dicuci",
  disetrika: "Disetrika",
  selesai: "Selesai",
  diambil: "Diambil",
};

export const roleLabels: Record<UserRole, string> = {
  admin: "Admin",
  kasir: "Kasir",
};

export const statusTransaksiOrder: StatusTransaksi[] = [
  "antrean",
  "dicuci",
  "disetrika",
  "selesai",
  "diambil",
];

export function getNextStatus(
  current: StatusTransaksi
): StatusTransaksi | null {
  const index = statusTransaksiOrder.indexOf(current);
  if (index === -1 || index === statusTransaksiOrder.length - 1) return null;
  return statusTransaksiOrder[index + 1];
}
