import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChevronIcon({ open, className }: { open: boolean; className?: string }) {
  const Icon = open ? ChevronDown : ChevronRight;
  return (
    <Icon
      aria-hidden
      className={cn("h-4 w-4 text-[var(--color-muted-fg)]", className)}
    />
  );
}
