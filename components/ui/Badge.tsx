import { cn } from "@/lib/utils/cn";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "purple";

const variants: Record<BadgeVariant, string> = {
  default:
    "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  success:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  warning:
    "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  danger: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  info: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  purple:
    "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function statusTransaksiVariant(
  status: string
): BadgeVariant {
  switch (status) {
    case "antrean":
      return "warning";
    case "dicuci":
      return "info";
    case "disetrika":
      return "purple";
    case "selesai":
      return "success";
    case "diambil":
      return "default";
    default:
      return "default";
  }
}

export function statusPembayaranVariant(
  status: string
): BadgeVariant {
  return status === "lunas" ? "success" : "danger";
}
