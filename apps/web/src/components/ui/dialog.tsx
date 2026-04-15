import { useEffect } from "react";
import { cn } from "@/lib/utils";

export function Dialog({
  open,
  onOpenChange,
  title,
  children,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false);
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onOpenChange]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center">
      <div
        className="absolute inset-0 bg-black/50"
        aria-hidden
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative z-10 w-full max-w-2xl rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] shadow-xl",
          className,
        )}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
          <h2 className="text-base font-semibold">{title}</h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="rounded p-1 text-[var(--color-muted-fg)] hover:bg-[var(--color-accent)] hover:text-[var(--color-fg)]"
          >
            ✕
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}
