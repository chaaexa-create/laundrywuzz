export type UserRole = "admin" | "kasir";
export type JenisLaundry = "cuci_lipat" | "cuci_setrika";
export type TipePaket = "reguler" | "express" | "kilat";
export type StatusPembayaran = "belum_bayar" | "lunas";
export type MetodePembayaran = "cash" | "qris";
export type StatusTransaksi =
  | "antrean"
  | "dicuci"
  | "disetrika"
  | "selesai"
  | "diambil";

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Pelanggan {
  id: string;
  nama: string;
  nomor_hp: string;
  alamat: string;
  created_at: string;
}

export interface PaketLaundry {
  id: string;
  nama_paket: string;
  jenis: JenisLaundry;
  tipe: TipePaket;
  harga_per_kg: number;
  estimasi_jam: number;
  created_at: string;
  updated_at: string;
}

export interface Transaksi {
  id: string;
  pelanggan_id: string;
  paket_id: string;
  berat_kg: number;
  total_harga: number;
  status_pembayaran: StatusPembayaran;
  metode_pembayaran: MetodePembayaran | null;
  status_transaksi: StatusTransaksi;
  nomor_nota: string;
  tanggal_masuk: string;
  tanggal_selesai: string | null;
  created_at: string;
  updated_at: string;
}

export interface TransaksiWithRelations extends Transaksi {
  pelanggan: Pick<Pelanggan, "id" | "nama" | "nomor_hp"> | null;
  paket_laundry: Pick<PaketLaundry, "id" | "nama_paket" | "jenis" | "tipe"> | null;
}
