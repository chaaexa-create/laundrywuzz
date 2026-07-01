import Link from "next/link";
import {
  ArrowRight,
  Clock,
  DollarSign,
  PlusCircle,
  Receipt,
  Users,
} from "lucide-react";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/utils/format";

async function getDashboardData() {
  const supabase = await createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = today.toISOString();

  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const [
    { count: transaksiHariIni },
    { data: pendapatanHariIni },
    { count: antreanAktif },
    { count: totalPelanggan },
    { data: transaksiMinggu },
    { data: transaksiAktif },
  ] = await Promise.all([
    supabase
      .from("transaksi")
      .select("*", { count: "exact", head: true })
      .gte("tanggal_masuk", todayIso),
    supabase
      .from("transaksi")
      .select("total_harga")
      .eq("status_pembayaran", "lunas")
      .gte("tanggal_masuk", todayIso),
    supabase
      .from("transaksi")
      .select("*", { count: "exact", head: true })
      .neq("status_transaksi", "diambil"),
    supabase.from("pelanggan").select("*", { count: "exact", head: true }),
    supabase
      .from("transaksi")
      .select("tanggal_masuk, total_harga, status_pembayaran")
      .gte("tanggal_masuk", sevenDaysAgo.toISOString())
      .eq("status_pembayaran", "lunas"),
    supabase
      .from("transaksi")
      .select("status_transaksi")
      .neq("status_transaksi", "diambil"),
  ]);

  const totalPendapatan =
    pendapatanHariIni?.reduce((sum, t) => sum + Number(t.total_harga), 0) ?? 0;

  const revenueMap = new Map<string, number>();
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    const key = d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    revenueMap.set(key, 0);
  }

  transaksiMinggu?.forEach((t) => {
    const key = new Date(t.tanggal_masuk).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
    if (revenueMap.has(key)) {
      revenueMap.set(key, (revenueMap.get(key) ?? 0) + Number(t.total_harga));
    }
  });

  const revenueData = Array.from(revenueMap.entries()).map(([date, total]) => ({
    date,
    total,
  }));

  const statusCount: Record<string, number> = {};
  transaksiAktif?.forEach((t) => {
    statusCount[t.status_transaksi] =
      (statusCount[t.status_transaksi] ?? 0) + 1;
  });

  const statusData = Object.entries(statusCount).map(([status, count]) => ({
    status,
    count,
  }));

  return {
    stats: {
      transaksiHariIni: transaksiHariIni ?? 0,
      pendapatanHariIni: totalPendapatan,
      antreanAktif: antreanAktif ?? 0,
      totalPelanggan: totalPelanggan ?? 0,
    },
    revenueData,
    statusData,
  };
}

export default async function DashboardPage() {
  const { stats, revenueData, statusData } = await getDashboardData();

  const summaryCards = [
    {
      title: "Transaksi Hari Ini",
      value: stats.transaksiHariIni.toString(),
      icon: Receipt,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400",
    },
    {
      title: "Pendapatan Hari Ini",
      value: formatRupiah(stats.pendapatanHariIni),
      icon: DollarSign,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400",
    },
    {
      title: "Antrean Aktif",
      value: stats.antreanAktif.toString(),
      icon: Clock,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-400",
    },
    {
      title: "Total Pelanggan",
      value: stats.totalPelanggan.toString(),
      icon: Users,
      color: "text-violet-600 bg-violet-50 dark:bg-violet-950 dark:text-violet-400",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Ringkasan operasional laundry hari ini"
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(({ title, value, icon: Icon, color }) => (
          <Card key={title}>
            <div className="flex items-center gap-4">
              <div className={`rounded-xl p-3 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">{title}</p>
                <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                  {value}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mb-8">
        <DashboardCharts revenueData={revenueData} statusData={statusData} />
      </div>

      <Card title="Aksi Cepat">
        <div className="flex flex-wrap gap-3">
          <Link href="/transaksi/baru">
            <Button>
              <PlusCircle className="h-4 w-4" />
              Transaksi Baru
            </Button>
          </Link>
          <Link href="/transaksi">
            <Button variant="secondary">
              <Receipt className="h-4 w-4" />
              Lihat Antrean
            </Button>
          </Link>
          <Link href="/pelanggan">
            <Button variant="secondary">
              <Users className="h-4 w-4" />
              Kelola Pelanggan
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
