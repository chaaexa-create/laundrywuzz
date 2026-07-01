import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { getProfile } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-zinc-950">
      <Sidebar profile={profile} />
      <div className="fixed right-4 top-4 z-40 lg:hidden">
        <ThemeToggle />
      </div>
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl px-4 py-8 pt-16 lg:px-8 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
