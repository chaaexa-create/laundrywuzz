import { cn } from "@/lib/utils/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function Card({
  children,
  className,
  title,
  description,
  action,
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900",
        className
      )}
    >
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title && (
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {title}
              </h3>
            )}
            {description && (
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                {description}
              </p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
