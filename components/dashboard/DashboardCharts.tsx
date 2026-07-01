"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { statusTransaksiLabels } from "@/lib/utils/labels";

const COLORS = ["#f59e0b", "#3b82f6", "#8b5cf6", "#10b981", "#71717a"];

interface DashboardChartsProps {
  revenueData: { date: string; total: number }[];
  statusData: { status: string; count: number }[];
}

export function DashboardCharts({
  revenueData,
  statusData,
}: DashboardChartsProps) {
  const pieData = statusData.map((item) => ({
    name: statusTransaksiLabels[item.status as keyof typeof statusTransaksiLabels] || item.status,
    value: item.count,
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card title="Pendapatan 7 Hari Terakhir" description="Transaksi lunas">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value) =>
                  new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                  }).format(Number(value))
                }
              />
              <Bar dataKey="total" fill="#18181b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Status Transaksi Aktif" description="Belum diambil">
        <div className="h-72">
          {pieData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-zinc-500">
              Tidak ada data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
    </div>
  );
}
