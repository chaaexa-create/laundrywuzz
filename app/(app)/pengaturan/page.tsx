import { redirect } from "next/navigation";
import { getKasirList } from "@/app/(app)/pengaturan/actions";
import { PengaturanTabs } from "@/components/pengaturan/PengaturanTabs";
import { PageHeader } from "@/components/layout/PageHeader";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function PengaturanPage() {
  await requireAdmin();

  const supabase = await createClient();
  const [{ data: paket }, kasirList] = await Promise.all([
    supabase.from("paket_laundry").select("*").order("jenis").order("tipe"),
    getKasirList(),
  ]);

  if (!paket) redirect("/dashboard");

  return (
    <div>
      <PageHeader
        title="Pengaturan"
        description="Kelola harga paket laundry dan akun kasir"
      />
      <PengaturanTabs initialPaket={paket} initialKasir={kasirList} />
    </div>
  );
}
