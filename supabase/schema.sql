-- ============================================================
-- Kasir Laundry - Supabase PostgreSQL Schema
-- Run this entire script in Supabase SQL Editor
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUM TYPES
-- ============================================================
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'kasir');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE jenis_laundry AS ENUM ('cuci_lipat', 'cuci_setrika');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE tipe_paket AS ENUM ('reguler', 'express', 'kilat');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE status_pembayaran AS ENUM ('belum_bayar', 'lunas');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE metode_pembayaran AS ENUM ('cash', 'qris');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE status_transaksi AS ENUM ('antrean', 'dicuci', 'disetrika', 'selesai', 'diambil');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- PROFILES (linked to auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  role user_role NOT NULL DEFAULT 'kasir',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'User'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'kasir')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- PELANGGAN
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pelanggan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  nomor_hp TEXT NOT NULL DEFAULT '',
  alamat TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pelanggan_nama ON public.pelanggan (nama);
CREATE INDEX IF NOT EXISTS idx_pelanggan_nomor_hp ON public.pelanggan (nomor_hp);

-- ============================================================
-- PAKET LAUNDRY
-- ============================================================
CREATE TABLE IF NOT EXISTS public.paket_laundry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_paket TEXT NOT NULL,
  jenis jenis_laundry NOT NULL,
  tipe tipe_paket NOT NULL,
  harga_per_kg NUMERIC(12, 2) NOT NULL CHECK (harga_per_kg >= 0),
  estimasi_jam INTEGER NOT NULL DEFAULT 24 CHECK (estimasi_jam > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (jenis, tipe)
);

-- ============================================================
-- TRANSAKSI
-- ============================================================
CREATE TABLE IF NOT EXISTS public.transaksi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pelanggan_id UUID NOT NULL REFERENCES public.pelanggan(id) ON DELETE RESTRICT,
  paket_id UUID NOT NULL REFERENCES public.paket_laundry(id) ON DELETE RESTRICT,
  berat_kg NUMERIC(8, 2) NOT NULL CHECK (berat_kg > 0),
  total_harga NUMERIC(14, 2) NOT NULL CHECK (total_harga >= 0),
  status_pembayaran status_pembayaran NOT NULL DEFAULT 'belum_bayar',
  metode_pembayaran metode_pembayaran,
  status_transaksi status_transaksi NOT NULL DEFAULT 'antrean',
  nomor_nota TEXT NOT NULL UNIQUE,
  tanggal_masuk TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tanggal_selesai TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transaksi_pelanggan ON public.transaksi (pelanggan_id);
CREATE INDEX IF NOT EXISTS idx_transaksi_paket ON public.transaksi (paket_id);
CREATE INDEX IF NOT EXISTS idx_transaksi_status ON public.transaksi (status_transaksi);
CREATE INDEX IF NOT EXISTS idx_transaksi_tanggal_masuk ON public.transaksi (tanggal_masuk DESC);
CREATE INDEX IF NOT EXISTS idx_transaksi_nomor_nota ON public.transaksi (nomor_nota);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS paket_laundry_updated_at ON public.paket_laundry;
CREATE TRIGGER paket_laundry_updated_at
  BEFORE UPDATE ON public.paket_laundry
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS transaksi_updated_at ON public.transaksi;
CREATE TRIGGER transaksi_updated_at
  BEFORE UPDATE ON public.transaksi
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pelanggan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paket_laundry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaksi ENABLE ROW LEVEL SECURITY;

-- Helper: check if user is authenticated staff
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Profiles policies
DROP POLICY IF EXISTS "Staff can read all profiles" ON public.profiles;
CREATE POLICY "Staff can read all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.is_staff());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admin can update any profile" ON public.profiles;
CREATE POLICY "Admin can update any profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- Pelanggan policies
DROP POLICY IF EXISTS "Staff full access pelanggan" ON public.pelanggan;
CREATE POLICY "Staff full access pelanggan"
  ON public.pelanggan FOR ALL
  TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- Paket laundry policies
DROP POLICY IF EXISTS "Staff read paket" ON public.paket_laundry;
CREATE POLICY "Staff read paket"
  ON public.paket_laundry FOR SELECT
  TO authenticated
  USING (public.is_staff());

DROP POLICY IF EXISTS "Admin manage paket" ON public.paket_laundry;
CREATE POLICY "Admin manage paket"
  ON public.paket_laundry FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Transaksi policies
DROP POLICY IF EXISTS "Staff full access transaksi" ON public.transaksi;
CREATE POLICY "Staff full access transaksi"
  ON public.transaksi FOR ALL
  TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- ============================================================
-- SEED DATA: Default laundry packages
-- ============================================================
INSERT INTO public.paket_laundry (nama_paket, jenis, tipe, harga_per_kg, estimasi_jam)
VALUES
  ('Cuci Lipat Reguler', 'cuci_lipat', 'reguler', 7000, 48),
  ('Cuci Lipat Express', 'cuci_lipat', 'express', 9000, 24),
  ('Cuci Lipat Kilat', 'cuci_lipat', 'kilat', 12000, 12),
  ('Cuci Setrika Reguler', 'cuci_setrika', 'reguler', 9000, 48),
  ('Cuci Setrika Express', 'cuci_setrika', 'express', 11000, 24),
  ('Cuci Setrika Kilat', 'cuci_setrika', 'kilat', 14000, 12)
ON CONFLICT (jenis, tipe) DO NOTHING;

-- ============================================================
-- NOTE: Create users via Supabase Auth Dashboard
-- Set user metadata: { "full_name": "Admin", "role": "admin" }
-- First user should be created manually as admin.
-- ============================================================
