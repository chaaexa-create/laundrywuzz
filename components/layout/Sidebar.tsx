"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  Receipt,
  Settings,
  Shirt,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";
import { roleLabels } from "@/lib/utils/labels";
import type { Profile } from "@/types/database";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transaksi/baru", label: "Transaksi Baru", icon: PlusCircle },
  { href: "/transaksi", label: "Daftar Transaksi", icon: Receipt },
  { href: "/pelanggan", label: "Pelanggan", icon: Users },
  { href: "/laporan", label: "Laporan", icon: BarChart3 },
  { href: "/pengaturan", label: "Pengaturan", icon: Settings, adminOnly: true },
];

interface SidebarProps {
  profile: Profile;
}

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const supabase = createClient();

  const filteredNav = navItems.filter(
    (item) => !item.adminOnly || profile.role === "admin"
  );

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const NavContent = () => (
    <>
      <div className="flex items-center gap-3 px-2 py-1">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
          <Shirt className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Kasir Laundry
          </p>
          <p className="text-xs text-zinc-500">Manajemen POS</p>
        </div>
      </div>

      <nav className="mt-8 space-y-1">
        {filteredNav.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <div className="mb-3 px-2">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {profile.full_name}
          </p>
          <p className="text-xs text-zinc-500">{roleLabels[profile.role]}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-950 dark:hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </button>
      </div>
    </>
  );

  return (
    <>
      <button
        className="fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white shadow-sm lg:hidden dark:border-zinc-800 dark:bg-zinc-900"
        onClick={() => setMobileOpen(true)}
        aria-label="Buka menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-white p-5 dark:bg-zinc-950">
            <button
              className="absolute right-4 top-4 text-zinc-500"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <NavContent />
          </aside>
        </div>
      )}

      <aside className="hidden w-64 shrink-0 flex-col border-r border-zinc-200 bg-white p-5 lg:flex dark:border-zinc-800 dark:bg-zinc-950">
        <NavContent />
      </aside>
    </>
  );
}
