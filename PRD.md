# Product Requirement Document (PRD)
# Laundry Wuzz — Sistem Manajemen & Kasir Laundry

| Field            | Detail                                      |
|------------------|---------------------------------------------|
| **Produk**       | Laundry Wuzz                                |
| **Versi Dokumen**| 1.0                                         |
| **Tanggal**      | 28 Juni 2026                                |
| **Status**       | Implemented (MVP+)                          |
| **Platform**     | Web Application (Responsive)                |

---

## Daftar Isi

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Latar Belakang & Masalah](#2-latar-belakang--masalah)
3. [Visi, Misi & Tujuan Produk](#3-visi-misi--tujuan-produk)
4. [User Persona](#4-user-persona)
5. [Peran Pengguna & Hak Akses](#5-peran-pengguna--hak-akses)
6. [Tech Stack & Arsitektur](#6-tech-stack--arsitektur)
7. [Struktur Navigasi Aplikasi](#7-struktur-navigasi-aplikasi)
8. [Spesifikasi Fitur Fungsional](#8-spesifikasi-fitur-fungsional)
9. [Alur Pengguna (User Flow)](#9-alur-pengguna-user-flow)
10. [Skema Database](#10-skema-database)
11. [Keamanan & Autentikasi](#11-keamanan--autentikasi)
12. [Desain UI/UX](#12-desain-uiux)
13. [Persyaratan Non-Fungsional](#13-persyaratan-non-fungsional)
14. [Lingkup di Luar MVP (Future Scope)](#14-lingkup-di-luar-mvp-future-scope)
15. [Glosarium](#15-glosarium)

---

## 1. Ringkasan Eksekutif

**Laundry Wuzz** adalah aplikasi web Point of Sale (POS) dan manajemen operasional laundry berbasis cloud. Aplikasi ini dirancang untuk usaha laundry skala kecil hingga menengah yang membutuhkan sistem pencatatan transaksi, pelacakan status cucian, manajemen pelanggan, laporan keuangan, dan administrasi karyawan kasir — semuanya dalam satu dashboard yang bersih, modern, dan mudah digunakan di siang hari.

Aplikasi mendukung dua peran utama: **Admin** (pemilik/manajer) dan **Kasir** (front-line staff). Admin memiliki kontrol penuh atas harga paket dan manajemen akun kasir, sementara kasir fokus pada operasional harian: input transaksi, update status cucian, dan melayani pelanggan.

---

## 2. Latar Belakang & Masalah

### 2.1 Konteks Industri

Industri laundry di Indonesia masih banyak yang mengandalkan pencatatan manual — buku tulis, WhatsApp, atau spreadsheet sederhana. Pendekatan ini rentan terhadap:

- **Kehilangan data transaksi** akibat catatan fisik yang hilang atau tidak terbaca.
- **Kesalahan perhitungan harga** karena perhitungan manual berat × tarif per kg.
- **Ketidakakuratan laporan keuangan**, terutama pemisahan pendapatan Cash vs QRIS.
- **Kesulitan melacak status cucian** (antrean, dicuci, disetrika, selesai, diambil).
- **Tidak ada jejak audit** siapa yang input transaksi dan kapan.

### 2.2 Masalah yang Diselesaikan Laundry Wuzz

| Masalah                          | Solusi Laundry Wuzz                                      |
|----------------------------------|----------------------------------------------------------|
| Pencatatan manual                | Form transaksi digital dengan auto-kalkulasi harga       |
| Status cucian tidak terpantau    | Workflow status transaksi dengan update real-time        |
| Laporan keuangan tidak akurat    | Filter rentang tanggal + breakdown Cash/QRIS + ekspor Excel |
| Data pelanggan tersebar           | CRUD pelanggan terpusat + tambah pelanggan cepat saat transaksi |
| Manajemen kasir sulit              | Admin bisa mendaftarkan akun kasir langsung dari UI      |
| Kesalahan input tidak bisa diperbaiki | Fitur edit & hapus transaksi                        |

### 2.3 Target Pengguna

- Pemilik laundry / manajer operasional (Admin)
- Karyawan kasir front desk (Kasir)
- Operasional 1 lokasi dengan 1–5 kasir aktif

---

## 3. Visi, Misi & Tujuan Produk

### 3.1 Visi
Menjadi sistem kasir laundry digital yang paling praktis dan andal untuk UMKM laundry di Indonesia.

### 3.2 Misi
- Menyederhanakan operasional harian laundry dari input hingga pengambilan cucian.
- Memberikan visibilitas keuangan real-time kepada pemilik usaha.
- Mengurangi human error dalam pencatatan dan perhitungan.

### 3.3 Tujuan Produk (Measurable Goals)

| # | Tujuan                                              | Indikator Keberhasilan                        |
|---|-----------------------------------------------------|-----------------------------------------------|
| 1 | Waktu input transaksi baru < 2 menit                | Kasir dapat input tanpa bantuan               |
| 2 | Akurasi laporan Cash vs QRIS 100%                   | Setiap transaksi lunas wajib punya metode bayar |
| 3 | Zero data loss untuk transaksi aktif                | Semua data tersimpan di Supabase cloud        |
| 4 | Admin dapat onboard kasir baru < 5 menit            | Tanpa akses ke Supabase Dashboard           |
| 5 | Akses dari browser desktop & tablet                 | Responsive layout di semua halaman            |

---

## 4. User Persona

### 4.1 Persona 1 — Admin / Pemilik Laundry

| Atribut          | Detail                                                        |
|------------------|---------------------------------------------------------------|
| **Nama**         | Pak Budi                                                      |
| **Usia**         | 35–50 tahun                                                   |
| **Peran**        | Pemilik sekaligus supervisor                                  |
| **Tech Savviness** | Menengah — familiar dengan smartphone & browser             |
| **Goals**        | Pantau pendapatan harian, atur harga, kelola tim kasir        |
| **Pain Points**  | Tidak tahu berapa pendapatan Cash vs QRIS; sulit audit kasir  |
| **Frekuensi**    | 1–2x sehari (pagi & malam)                                    |
| **Fitur Utama**  | Dashboard, Laporan, Pengaturan Harga, Manajemen Kasir         |

**Quote:**
> *"Saya mau tahu berapa omzet hari ini dan berapa yang masuk lewat QRIS, tanpa harus hitung manual di akhir shift."*

---

### 4.2 Persona 2 — Kasir Laundry

| Atribut          | Detail                                                        |
|------------------|---------------------------------------------------------------|
| **Nama**         | Siti                                                          |
| **Usia**         | 20–30 tahun                                                   |
| **Peran**        | Kasir front desk                                              |
| **Tech Savviness** | Dasar–menengah — terbiasa dengan aplikasi mobile            |
| **Goals**        | Input transaksi cepat, update status cucian, layani pelanggan |
| **Pain Points**  | Antre panjang; pelanggan baru belum terdaftar; salah input berat |
| **Frekuensi**    | Sepanjang shift (8–10 jam)                                    |
| **Fitur Utama**  | Transaksi Baru, Daftar Transaksi, Pelanggan, Tambah Pelanggan Cepat |

**Quote:**
> *"Pelanggan datang, saya timbang, input, kasih nota — harusnya cepat, nggak ribet cari-cari data."*

---

## 5. Peran Pengguna & Hak Akses

### 5.1 Matriks Hak Akses

| Fitur / Halaman              | Admin | Kasir |
|------------------------------|:-----:|:-----:|
| Login                        | ✅    | ✅    |
| Dashboard                    | ✅    | ✅    |
| Transaksi Baru               | ✅    | ✅    |
| Daftar Transaksi (CRUD)      | ✅    | ✅    |
| Pelanggan (CRUD)             | ✅    | ✅    |
| Laporan Keuangan             | ✅    | ✅    |
| Pengaturan Harga Paket       | ✅    | ❌    |
| Manajemen Kasir              | ✅    | ❌    |
| Toggle Tema Light/Dark       | ✅    | ✅    |
| Logout                       | ✅    | ✅    |

### 5.2 Aturan Bisnis Akses

- Halaman `/pengaturan` dilindungi `requireAdmin()` — kasir yang mencoba akses langsung di-redirect ke `/dashboard`.
- Menu sidebar **Pengaturan** hanya ditampilkan jika `profile.role === 'admin'`.
- Semua staff (admin & kasir) memiliki akses penuh CRUD ke `pelanggan` dan `transaksi`.
- Hanya admin yang dapat INSERT/UPDATE/DELETE pada `paket_laundry` (via RLS Supabase).

---

## 6. Tech Stack & Arsitektur

### 6.1 Stack Teknologi

| Layer            | Teknologi                                              |
|------------------|--------------------------------------------------------|
| Framework        | Next.js 16 (App Router) + TypeScript                   |
| Styling          | Tailwind CSS v4                                        |
| Icons            | Lucide React                                           |
| Charts           | Recharts                                               |
| Excel Export     | SheetJS (`xlsx`)                                       |
| Database         | Supabase (PostgreSQL)                                  |
| Authentication   | Supabase Auth (Email/Password)                         |
| SSR Client       | `@supabase/ssr` (async `cookies()` Next.js 15+)        |
| Admin Operations | Supabase Service Role Key (server-side only)           |
| Hosting          | Vercel / Node.js compatible                            |

### 6.2 Arsitektur Aplikasi

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Client)                      │
│  React Components + Client Supabase + Theme Provider     │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS
┌────────────────────────▼────────────────────────────────┐
│              Next.js App Router (Server)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │ Middleware   │  │ Server       │  │ Server Actions │ │
│  │ (Auth Guard) │  │ Components   │  │ (Admin Kasir)  │ │
│  └──────────────┘  └──────────────┘  └────────────────┘ │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                    Supabase Cloud                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐ │
│  │ Auth     │  │ Postgres │  │ Row Level Security     │ │
│  │ (JWT)    │  │ + Enums  │  │ (RLS Policies)         │ │
│  └──────────┘  └──────────┘  └──────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 6.3 Struktur Folder Proyek

```
app/
  (app)/                    # Layout authenticated + sidebar
    dashboard/
    transaksi/
    transaksi/baru/
    pelanggan/
    laporan/
    pengaturan/
  login/
components/
  ui/                       # Button, Input, Select, Card, Badge, Modal
  layout/                   # Sidebar, PageHeader
  dashboard/                # DashboardCharts
  transaksi/                # TambahPelangganCepat, EditTransaksiModal, dll.
  pengaturan/               # PengaturanTabs, ManajemenKasir
  theme/                    # ThemeProvider, ThemeToggle
lib/
  supabase/                 # client, server, admin, middleware
  auth.ts
  utils/
supabase/
  schema.sql
types/
  database.ts
```

---

## 7. Struktur Navigasi Aplikasi

### 7.1 Halaman Publik

| Route    | Deskripsi                              |
|----------|----------------------------------------|
| `/`      | Redirect otomatis ke `/dashboard`      |
| `/login` | Halaman login email & password         |

### 7.2 Halaman Terautentikasi (Sidebar Layout)

| Route              | Label Sidebar     | Akses       |
|--------------------|-------------------|-------------|
| `/dashboard`       | Dashboard         | Admin, Kasir |
| `/transaksi/baru`  | Transaksi Baru    | Admin, Kasir |
| `/transaksi`       | Daftar Transaksi  | Admin, Kasir |
| `/pelanggan`       | Pelanggan         | Admin, Kasir |
| `/laporan`         | Laporan           | Admin, Kasir |
| `/pengaturan`      | Pengaturan        | Admin saja  |

---

## 8. Spesifikasi Fitur Fungsional

### 8.1 Autentikasi & Sesi (`/login`)

**Deskripsi:** Halaman login minimalist untuk staff (Admin/Kasir).

**Fungsional:**
- Input email dan password.
- Autentikasi via Supabase Auth `signInWithPassword`.
- Redirect ke `/dashboard` jika sudah login.
- Redirect ke `/login` jika belum autentikasi (via middleware).
- Pesan error jika kredensial salah.
- Toggle tema Light/Dark di pojok kanan atas.

**Acceptance Criteria:**
- [ ] Hanya user terdaftar di Supabase Auth yang bisa login.
- [ ] Session disimpan via cookie SSR (`@supabase/ssr`).
- [ ] User tanpa profil di tabel `profiles` tetap bisa login (trigger auto-create).

---

### 8.2 Dashboard (`/dashboard`)

**Deskripsi:** Ringkasan operasional real-time untuk monitoring harian.

**Fungsional:**

#### Summary Cards (4 kartu)
| Kartu                  | Sumber Data                                           |
|------------------------|-------------------------------------------------------|
| Transaksi Hari Ini     | COUNT transaksi WHERE tanggal_masuk = hari ini        |
| Pendapatan Hari Ini    | SUM total_harga transaksi lunas hari ini              |
| Antrean Aktif          | COUNT transaksi WHERE status ≠ 'diambil'              |
| Total Pelanggan        | COUNT pelanggan                                       |

#### Charts (Recharts)
- **Bar Chart:** Pendapatan 7 hari terakhir (transaksi lunas).
- **Pie Chart:** Distribusi status transaksi aktif (belum diambil).

#### Quick Actions
- Tombol: Transaksi Baru, Lihat Antrean, Kelola Pelanggan.

**Acceptance Criteria:**
- [ ] Data di-fetch server-side via Supabase SSR client.
- [ ] Chart menampilkan "Tidak ada data" jika kosong.

---

### 8.3 Transaksi Baru (`/transaksi/baru`)

**Deskripsi:** Form single-page untuk input pesanan laundry baru.

**Field Form:**

| Field               | Tipe          | Wajib | Keterangan                                      |
|---------------------|---------------|:-----:|-------------------------------------------------|
| Pelanggan           | Dropdown      | ✅    | Daftar dari tabel `pelanggan`                   |
| Paket Laundry       | Dropdown      | ✅    | Daftar dari tabel `paket_laundry` + harga/kg    |
| Berat (kg)          | Number        | ✅    | Step 0.1, min 0.1                               |
| Total Harga         | Auto-calc     | —     | `berat_kg × harga_per_kg` (read-only display)   |
| Status Pembayaran   | Dropdown      | ✅    | Belum Bayar / Lunas                             |
| Metode Pembayaran   | Dropdown      | Kondisional | Cash / QRIS — wajib jika Lunas, disabled jika Belum Bayar |

**Fitur Tambahan:**

#### Tambah Pelanggan Cepat
- Link **"+ Pelanggan Baru"** di sebelah dropdown pelanggan.
- Modal form: Nama, No. HP, Alamat.
- Setelah simpan: modal tertutup, pelanggan baru **otomatis terpilih** di dropdown.
- Komponen berada **di luar** `<form>` utama (menghindari nested form error).

**Logika Bisnis:**
- `nomor_nota` auto-generate format: `NOT-YYYYMMDD-XXXX` (random 4 digit).
- `status_transaksi` default: `antrean`.
- `metode_pembayaran` = `null` jika status Belum Bayar.
- Validasi: metode wajib dipilih jika status Lunas.

**Acceptance Criteria:**
- [ ] Total harga update real-time saat berat/paket berubah.
- [ ] Redirect ke `/transaksi` setelah simpan sukses.
- [ ] Info paket (jenis, tipe, estimasi jam) tampil setelah paket dipilih.

---

### 8.4 Daftar Transaksi (`/transaksi`)

**Deskripsi:** Tabel robust semua transaksi laundry dengan aksi manajemen lengkap.

**Kolom Tabel:**

| Kolom        | Konten                                              |
|--------------|-----------------------------------------------------|
| Nota         | nomor_nota + tanggal_masuk                          |
| Pelanggan    | nama + nomor_hp                                     |
| Paket        | nama_paket + jenis + tipe                           |
| Berat        | berat_kg (kg)                                       |
| Total        | total_harga (format Rupiah)                         |
| Status       | Badge warna status transaksi                        |
| Pembayaran   | Dropdown status bayar + dropdown metode             |
| Ubah Status  | Dropdown status transaksi (bebas, bisa rollback)    |
| Aksi         | Tombol Edit (Pencil) + Hapus (Trash)                |

**Filter:**
- Filter status transaksi: Semua / Antrean / Dicuci / Disetrika / Selesai / Diambil.
- State filter dipertahankan setelah edit/hapus/refresh.

#### 8.4.1 Update Status Transaksi (Inline)
- Dropdown bebas memilih status apa pun (termasuk rollback).
- `tanggal_selesai` otomatis:
  - **Diisi** saat status = `selesai` atau `diambil`.
  - **Dikosongkan** saat status diturunkan ke tahap sebelumnya.

#### 8.4.2 Manajemen Pembayaran (Inline)
- Dropdown **Status Pembayaran:** Belum Bayar ↔ Lunas.
- Saat ubah ke **Lunas** → modal pilih metode (Cash / QRIS).
- Saat sudah **Lunas** → dropdown metode untuk ganti Cash/QRIS.
- Saat ubah ke **Belum Bayar** → `metode_pembayaran` di-set `null`.
- Badge ringkasan: `Lunas (Cash)` / `Lunas (QRIS)`.

#### 8.4.3 Edit Transaksi (Modal)
- Trigger: tombol ikon Pencil.
- Modal **"Edit Transaksi [Nomor Nota]"**.
- Field editable: Pelanggan, Paket, Berat, Status Pembayaran, Metode Pembayaran, Status Transaksi.
- Auto-kalkulasi total harga saat berat/paket berubah.
- Update ke Supabase + refresh tabel + tutup modal.

#### 8.4.4 Hapus Transaksi
- Trigger: tombol ikon Trash.
- Dialog konfirmasi: *"Apakah Anda yakin ingin menghapus transaksi [Nomor Nota] ini?"*
- Hapus dari Supabase + refresh tabel real-time.

**Acceptance Criteria:**
- [ ] Edit/hapus tidak mereset filter status aktif.
- [ ] Transaksi lunas selalu punya metode pembayaran tercatat.
- [ ] Tombol aksi disabled saat baris sedang diproses.

---

### 8.5 Pelanggan (`/pelanggan`)

**Deskripsi:** CRUD interface manajemen data pelanggan.

**Fungsional:**
- Tabel: Nama, No. HP, Alamat, Tanggal Terdaftar.
- Pencarian real-time by nama atau nomor HP.
- **Tambah Pelanggan:** modal form (Nama wajib, HP, Alamat).
- **Edit Pelanggan:** modal form pre-filled.
- **Hapus Pelanggan:** konfirmasi browser confirm (RESTRICT jika masih ada transaksi).

**Acceptance Criteria:**
- [ ] Nama wajib diisi.
- [ ] Data diurutkan alfabetis by nama.

---

### 8.6 Laporan Keuangan (`/laporan`)

**Deskripsi:** Ringkasan pendapatan dengan filter rentang waktu dan ekspor Excel.

**Filter:**

| Filter               | Tipe              | Default                    |
|----------------------|-------------------|----------------------------|
| Tanggal Mulai        | Date picker       | Awal bulan berjalan        |
| Tanggal Selesai      | Date picker       | Hari ini                   |
| Metode Pembayaran    | Dropdown          | Semua / Cash / QRIS        |

**Validasi:** Tanggal mulai tidak boleh setelah tanggal selesai.

**Summary Cards:**
- Total Pendapatan (transaksi lunas dalam rentang).
- Pendapatan Cash.
- Pendapatan QRIS.

**Chart:**
- Bar Chart perbandingan Cash vs QRIS.

**Ekspor Excel (`Unduh Excel`):**
- Library: `xlsx`.
- File: `Laporan_Laundry_[tanggalMulai]_[tanggalSelesai].xlsx`.
- **Sheet 1 — Ringkasan:** periode, total pendapatan, breakdown Cash/QRIS.
- **Sheet 2 — Detail Transaksi:** nota, tanggal, pelanggan, paket, berat, total, status bayar, metode, status laundry.
- **Sheet 3 — Metode Pembayaran:** rekap + persentase Cash vs QRIS.

**Query Logic:**
- Hanya transaksi dengan `status_pembayaran = 'lunas'`.
- Filter `tanggal_masuk` BETWEEN tanggal mulai 00:00:00 AND tanggal selesai 23:59:59.

**Acceptance Criteria:**
- [ ] Tombol Excel disabled jika tidak ada data atau tanggal invalid.
- [ ] Angka di Excel dalam format integer Rupiah (bulat).
- [ ] Filter metode mempengaruhi summary cards & export, chart tetap menampilkan total Cash/QRIS.

---

### 8.7 Pengaturan (`/pengaturan`) — Admin Only

**Deskripsi:** Halaman administrasi dengan 2 tab.

#### Tab 1: Pengaturan Harga
- Daftar semua paket laundry dari `paket_laundry`.
- Edit **Harga/kg (Rp)** dan **Estimasi (jam)** per paket.
- Simpan per paket (update individual).

#### Tab 2: Manajemen Kasir
- Tabel kasir: Nama Lengkap, Email, Tanggal Terdaftar.
- Sumber: `profiles` WHERE `role = 'kasir'`.
- **Tambah Kasir Baru:** modal form (Nama, Email, Password).
- Pendaftaran via Server Action + Supabase Admin API (`auth.admin.createUser`).
- Auto-create profil via DB trigger + fallback upsert.
- Rollback: hapus user auth jika insert profil gagal.

**Keamanan Manajemen Kasir:**
- `requireAdmin()` di page dan setiap server action.
- Service Role Key hanya di server (`SUPABASE_SERVICE_ROLE_KEY`).
- Tidak pernah diekspos ke browser.

**Acceptance Criteria:**
- [ ] Kasir tidak bisa akses halaman ini.
- [ ] Email duplikat ditolak dengan pesan error jelas.
- [ ] Password minimal 6 karakter.

---

### 8.8 Tema Light / Dark Mode

**Deskripsi:** Toggle tema global untuk kenyamanan visual.

**Fungsional:**
- Default: **Light Mode** (tidak mengikuti preferensi OS).
- Toggle Sun/Moon icon:
  - Desktop: pojok kanan header sidebar.
  - Mobile: fixed pojok kanan atas.
  - Login: pojok kanan atas.
- Preferensi disimpan di `localStorage` (`kasir-laundry-theme`).
- Anti-flash script sebelum hydration.

**Palete Light Mode:**
- Background: `slate-50` / `#f8fafc`
- Card/Sidebar: `white`
- Teks: `slate-900` / `slate-700`
- Border: `slate-200`

---

## 9. Alur Pengguna (User Flow)

### 9.1 Flow: Input Transaksi Baru (Kasir)

```
Login → Dashboard → Transaksi Baru
  → Pilih Pelanggan (atau + Pelanggan Baru via modal)
  → Pilih Paket → Input Berat → Total auto-calc
  → Pilih Status Bayar (+ Metode jika Lunas)
  → Simpan → Redirect ke Daftar Transaksi
```

### 9.2 Flow: Update Status Cucian (Kasir)

```
Daftar Transaksi → Filter (opsional)
  → Dropdown "Ubah Status" → Pilih status baru
  → tanggal_selesai auto-update jika selesai/diambil
```

### 9.3 Flow: Tandai Lunas + Pilih Metode (Kasir)

```
Daftar Transaksi → Dropdown Pembayaran → Pilih "Lunas"
  → Modal: Pilih Cash atau QRIS
  → Simpan → Badge "Lunas (Cash/QRIS)" → Laporan terupdate
```

### 9.4 Flow: Edit Transaksi (Kasir/Admin)

```
Daftar Transaksi → Klik ikon Pencil
  → Modal Edit → Ubah field → Total auto-recalc
  → Simpan Perubahan → Modal tutup → Tabel refresh
```

### 9.5 Flow: Laporan & Ekspor (Admin)

```
Laporan → Set Tanggal Mulai & Selesai → (Filter Metode opsional)
  → Review Summary Cards + Chart
  → Klik "Unduh Excel" → File .xlsx terdownload
```

### 9.6 Flow: Daftarkan Kasir Baru (Admin)

```
Pengaturan → Tab Manajemen Kasir → Tambah Kasir Baru
  → Isi Nama, Email, Password → Daftarkan
  → Kasir baru muncul di tabel → Kasir bisa login
```

---

## 10. Skema Database

### 10.1 Diagram Relasi (ERD)

```
auth.users (Supabase Auth)
    │
    │ 1:1
    ▼
profiles ──────────────────────────────────────────────
                                                        │
pelanggan ──────────────┐                               │
                        │ 1:N                           │
                        ▼                               │
                   transaksi ◄────── N:1 ──── paket_laundry
```

### 10.2 Enum Types

| Enum                  | Values                                              |
|-----------------------|-----------------------------------------------------|
| `user_role`           | `admin`, `kasir`                                    |
| `jenis_laundry`       | `cuci_lipat`, `cuci_setrika`                        |
| `tipe_paket`          | `reguler`, `express`, `kilat`                       |
| `status_pembayaran`   | `belum_bayar`, `lunas`                              |
| `metode_pembayaran`   | `cash`, `qris`                                      |
| `status_transaksi`    | `antrean`, `dicuci`, `disetrika`, `selesai`, `diambil` |

### 10.3 Tabel: `profiles`

| Kolom        | Tipe         | Constraint                          | Keterangan                    |
|--------------|--------------|-------------------------------------|-------------------------------|
| `id`         | UUID         | PK, FK → auth.users(id) CASCADE     | Sama dengan user auth ID      |
| `full_name`  | TEXT         | NOT NULL, DEFAULT ''                | Nama lengkap staff            |
| `role`       | user_role    | NOT NULL, DEFAULT 'kasir'           | admin / kasir                 |
| `created_at` | TIMESTAMPTZ  | NOT NULL, DEFAULT NOW()             |                               |
| `updated_at` | TIMESTAMPTZ  | NOT NULL, DEFAULT NOW()             | Auto-update via trigger       |

**Trigger:** `on_auth_user_created` — auto-insert profil saat user baru mendaftar di Auth.

---

### 10.4 Tabel: `pelanggan`

| Kolom        | Tipe         | Constraint                | Keterangan           |
|--------------|--------------|---------------------------|----------------------|
| `id`         | UUID         | PK, DEFAULT gen_random_uuid() |              |
| `nama`       | TEXT         | NOT NULL                  | Nama pelanggan       |
| `nomor_hp`   | TEXT         | NOT NULL, DEFAULT ''      | Nomor telepon        |
| `alamat`     | TEXT         | NOT NULL, DEFAULT ''      | Alamat pelanggan     |
| `created_at` | TIMESTAMPTZ  | NOT NULL, DEFAULT NOW()   |                      |

**Index:** `idx_pelanggan_nama`, `idx_pelanggan_nomor_hp`

---

### 10.5 Tabel: `paket_laundry`

| Kolom          | Tipe           | Constraint                          | Keterangan              |
|----------------|----------------|-------------------------------------|-------------------------|
| `id`           | UUID           | PK, DEFAULT gen_random_uuid()       |                         |
| `nama_paket`   | TEXT           | NOT NULL                            | Nama display paket      |
| `jenis`        | jenis_laundry  | NOT NULL                            | cuci_lipat / cuci_setrika |
| `tipe`         | tipe_paket     | NOT NULL                            | reguler / express / kilat |
| `harga_per_kg` | NUMERIC(12,2)  | NOT NULL, CHECK >= 0                  | Harga per kilogram      |
| `estimasi_jam` | INTEGER        | NOT NULL, DEFAULT 24, CHECK > 0     | Estimasi selesai (jam)  |
| `created_at`   | TIMESTAMPTZ    | NOT NULL, DEFAULT NOW()             |                         |
| `updated_at`   | TIMESTAMPTZ    | NOT NULL, DEFAULT NOW()             | Auto-update via trigger |

**Unique:** `(jenis, tipe)` — satu paket per kombinasi jenis+tipe.

**Seed Data (6 paket default):**

| Nama Paket           | Jenis         | Tipe    | Harga/kg | Estimasi |
|----------------------|---------------|---------|----------|----------|
| Cuci Lipat Reguler   | cuci_lipat    | reguler | Rp 7.000 | 48 jam   |
| Cuci Lipat Express   | cuci_lipat    | express | Rp 9.000 | 24 jam   |
| Cuci Lipat Kilat     | cuci_lipat    | kilat   | Rp 12.000| 12 jam   |
| Cuci Setrika Reguler | cuci_setrika  | reguler | Rp 9.000 | 48 jam   |
| Cuci Setrika Express | cuci_setrika  | express | Rp 11.000| 24 jam   |
| Cuci Setrika Kilat   | cuci_setrika  | kilat   | Rp 14.000| 12 jam   |

---

### 10.6 Tabel: `transaksi`

| Kolom                | Tipe                | Constraint                              | Keterangan                    |
|----------------------|---------------------|-----------------------------------------|-------------------------------|
| `id`                 | UUID                | PK, DEFAULT gen_random_uuid()           |                               |
| `pelanggan_id`       | UUID                | FK → pelanggan(id) RESTRICT             |                               |
| `paket_id`           | UUID                | FK → paket_laundry(id) RESTRICT         |                               |
| `berat_kg`           | NUMERIC(8,2)        | NOT NULL, CHECK > 0                     | Berat cucian (kg)             |
| `total_harga`        | NUMERIC(14,2)       | NOT NULL, CHECK >= 0                    | berat × harga_per_kg          |
| `status_pembayaran`  | status_pembayaran   | NOT NULL, DEFAULT 'belum_bayar'         |                               |
| `metode_pembayaran`  | metode_pembayaran   | NULLABLE                                | Wajib jika lunas              |
| `status_transaksi`   | status_transaksi    | NOT NULL, DEFAULT 'antrean'             | Workflow cucian               |
| `nomor_nota`         | TEXT                | NOT NULL, UNIQUE                        | Format: NOT-YYYYMMDD-XXXX     |
| `tanggal_masuk`      | TIMESTAMPTZ         | NOT NULL, DEFAULT NOW()                 | Waktu order masuk             |
| `tanggal_selesai`    | TIMESTAMPTZ         | NULLABLE                                | Waktu selesai/diambil         |
| `created_at`         | TIMESTAMPTZ         | NOT NULL, DEFAULT NOW()                 |                               |
| `updated_at`         | TIMESTAMPTZ         | NOT NULL, DEFAULT NOW()                 | Auto-update via trigger       |

**Index:** pelanggan_id, paket_id, status_transaksi, tanggal_masuk DESC, nomor_nota

---

### 10.7 Workflow Status Transaksi

```
antrean → dicuci → disetrika → selesai → diambil
   ↑         ↑          ↑          ↑         ↑
   └─────────┴──────────┴──────────┴─────────┘
              (rollback diperbolehkan)
```

| Status     | Label UI   | tanggal_selesai        |
|------------|------------|------------------------|
| antrean    | Antrean    | null                   |
| dicuci     | Dicuci     | null                   |
| disetrika  | Disetrika  | null                   |
| selesai    | Selesai    | diisi otomatis         |
| diambil    | Diambil    | diisi otomatis         |

---

### 10.8 Row Level Security (RLS)

| Tabel           | Policy                                      | Role          |
|-----------------|---------------------------------------------|---------------|
| `profiles`      | Staff can read all profiles                 | authenticated |
| `profiles`      | Users can update own profile                | authenticated |
| `profiles`      | Admin can update any profile                | authenticated |
| `pelanggan`     | Staff full access (CRUD)                    | authenticated |
| `paket_laundry` | Staff read                                  | authenticated |
| `paket_laundry` | Admin manage (CRUD)                         | authenticated |
| `transaksi`     | Staff full access (CRUD)                    | authenticated |

**Helper Functions:**
- `is_staff()` — cek apakah user punya profil di `profiles`.
- `is_admin()` — cek apakah user punya role `admin`.

---

## 11. Keamanan & Autentikasi

### 11.1 Autentikasi
- Email/password via Supabase Auth.
- Session cookie managed by `@supabase/ssr`.
- Middleware guard di semua route kecuali `/login` dan static assets.

### 11.2 Environment Variables

| Variable                          | Scope   | Keterangan                          |
|-----------------------------------|---------|-------------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`        | Public  | URL proyek Supabase                 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | Public  | Anon key untuk client & SSR         |
| `SUPABASE_SERVICE_ROLE_KEY`       | Server  | Admin API — hanya untuk daftar kasir |

### 11.3 Prinsip Keamanan
- Service Role Key **tidak pernah** dikirim ke browser.
- Server Actions memvalidasi `requireAdmin()` sebelum operasi sensitif.
- RLS aktif di semua tabel publik.
- Hapus transaksi memerlukan konfirmasi eksplisit.

---

## 12. Desain UI/UX

### 12.1 Prinsip Desain
- **Clean & Professional** — minimal, fokus pada data operasional.
- **Light Mode First** — nyaman di siang hari, kontras tinggi.
- **Responsive** — sidebar collapse di mobile dengan hamburger menu.
- **Consistent Components** — Button, Input, Select, Card, Badge, Modal reusable.

### 12.2 Komponen UI Standar

| Komponen   | Variasi / Props                                    |
|------------|----------------------------------------------------|
| Button     | primary, secondary, ghost, danger / sm, md, lg   |
| Input      | label, error, type                                 |
| Select     | label, options, disabled                           |
| Card       | title, description, action                         |
| Badge      | default, success, warning, danger, info, purple    |
| Modal      | title, open/onClose, overlay click to close       |

### 12.3 Color Coding Status

| Status Transaksi | Badge Color |
|------------------|-------------|
| Antrean          | Warning (amber) |
| Dicuci           | Info (blue)     |
| Disetrika        | Purple          |
| Selesai          | Success (green) |
| Diambil          | Default (gray)  |

| Status Pembayaran | Badge Color |
|-------------------|-------------|
| Belum Bayar       | Danger (red)  |
| Lunas             | Success (green)|

### 12.4 Format Data
- **Mata uang:** `Intl.NumberFormat('id-ID', { currency: 'IDR' })` → `Rp 35.000`
- **Tanggal:** Format Indonesia → `28 Jun 2026, 14.30`
- **Nomor Nota:** `NOT-20260628-4521`

---

## 13. Persyaratan Non-Fungsional

| Kategori        | Requirement                                              |
|-----------------|----------------------------------------------------------|
| **Performance** | Halaman load < 3 detik pada koneksi 4G                   |
| **Availability**| Bergantung uptime Supabase (~99.9%)                      |
| **Scalability** | Mendukung ribuan transaksi (PostgreSQL + index)          |
| **Compatibility**| Chrome, Edge, Firefox, Safari — desktop & tablet        |
| **Language**    | Bahasa Indonesia (UI labels & pesan error)               |
| **Data Integrity** | FK constraints, CHECK constraints, UNIQUE nomor_nota |
| **Backup**      | Supabase automatic daily backup (plan dependent)         |
| **Accessibility** | Label pada input, aria-label pada tombol ikon         |

---

## 14. Lingkup di Luar MVP (Future Scope)

Fitur berikut **belum** diimplementasi dan dapat menjadi roadmap v2:

| # | Fitur Potensial                          | Prioritas |
|---|------------------------------------------|-----------|
| 1 | Cetak nota / struk thermal printer       | Tinggi    |
| 2 | Notifikasi WhatsApp ke pelanggan         | Tinggi    |
| 3 | Multi-cabang / multi-tenant              | Sedang    |
| 4 | Riwayat perubahan (audit log)            | Sedang    |
| 5 | Dashboard analytics lanjutan             | Sedang    |
| 6 | Role granular (supervisor, operator)     | Rendah    |
| 7 | Integrasi payment gateway otomatis       | Rendah    |
| 8 | Aplikasi mobile native (React Native)    | Rendah    |
| 9 | Manajemen stok detergen / supplies       | Rendah    |
| 10| Hapus / nonaktifkan akun kasir dari UI   | Sedang    |

---

## 15. Glosarium

| Istilah              | Definisi                                                              |
|----------------------|-----------------------------------------------------------------------|
| **Nota**             | Nomor unik transaksi format `NOT-YYYYMMDD-XXXX`                       |
| **Paket Laundry**    | Kombinasi jenis (cuci lipat/setrika) + tipe (reguler/express/kilat)   |
| **Antrean**          | Status awal transaksi — cucian menunggu diproses                      |
| **Lunas**            | Status pembayaran — pelanggan sudah membayar penuh                    |
| **RLS**              | Row Level Security — kebijakan akses data per baris di PostgreSQL     |
| **SSR**              | Server-Side Rendering — render di server Next.js                      |
| **Service Role Key** | Kunci admin Supabase untuk operasi privileged di server               |
| **Staff**            | Semua user terautentikasi (admin + kasir) yang punya profil           |
| **Rollback Status**  | Mengembalikan status transaksi ke tahap sebelumnya                    |
| **Tambah Cepat**     | Fitur inline tambah pelanggan baru tanpa keluar halaman transaksi     |

---

## Lampiran

### A. Environment Setup

```bash
# Clone & install
npm install

# Environment (.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Jalankan SQL schema
# → Paste isi supabase/schema.sql ke Supabase SQL Editor

# Buat admin pertama via Supabase Auth Dashboard
# Metadata: { "full_name": "Admin", "role": "admin" }

# Dev server
npm run dev
```

### B. Referensi File Schema
- SQL lengkap: [`supabase/schema.sql`](./supabase/schema.sql)
- TypeScript types: [`types/database.ts`](./types/database.ts)

---

*Dokumen ini mencerminkan state aplikasi Laundry Wuzz per 28 Juni 2026. Perbarui versi dokumen setiap ada perubahan fitur signifikan.*
