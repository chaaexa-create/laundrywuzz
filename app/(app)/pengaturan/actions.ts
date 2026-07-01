"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/types/database";

export interface KasirWithEmail extends Profile {
  email: string;
}

export async function getKasirList(): Promise<KasirWithEmail[]> {
  await requireAdmin();

  const admin = createAdminClient();

  const { data: profiles, error } = await admin
    .from("profiles")
    .select("*")
    .eq("role", "kasir")
    .order("created_at", { ascending: false });

  if (error || !profiles) return [];

  const kasirWithEmail = await Promise.all(
    profiles.map(async (profile) => {
      const { data: authData } = await admin.auth.admin.getUserById(profile.id);
      return {
        ...profile,
        email: authData.user?.email ?? "-",
      } satisfies KasirWithEmail;
    })
  );

  return kasirWithEmail;
}

interface CreateKasirInput {
  fullName: string;
  email: string;
  password: string;
}

interface ActionResult {
  success: boolean;
  message: string;
}

export async function createKasir(input: CreateKasirInput): Promise<ActionResult> {
  await requireAdmin();

  const fullName = input.fullName.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!fullName) {
    return { success: false, message: "Nama lengkap wajib diisi." };
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, message: "Format email tidak valid." };
  }

  if (password.length < 6) {
    return { success: false, message: "Password minimal 6 karakter." };
  }

  const admin = createAdminClient();

  const { data: newUser, error: createError } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: "kasir",
      },
    });

  if (createError) {
    if (createError.message.includes("already been registered")) {
      return { success: false, message: "Email sudah terdaftar." };
    }
    return { success: false, message: createError.message };
  }

  if (!newUser.user) {
    return { success: false, message: "Gagal membuat akun kasir." };
  }

  // Pastikan profile ter-update (trigger signup sudah handle, ini sebagai fallback)
  const { error: profileError } = await admin.from("profiles").upsert(
    {
      id: newUser.user.id,
      full_name: fullName,
      role: "kasir",
    },
    { onConflict: "id" }
  );

  if (profileError) {
    await admin.auth.admin.deleteUser(newUser.user.id);
    return {
      success: false,
      message: `Gagal menyimpan profil: ${profileError.message}`,
    };
  }

  revalidatePath("/pengaturan");

  return {
    success: true,
    message: `Kasir "${fullName}" berhasil didaftarkan.`,
  };
}
