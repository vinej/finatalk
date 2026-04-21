import { ChevronDown, ChevronRight } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function CollapsibleCard({
  title,
  subtitle,
  defaultOpen = true,
  className,
  headerClassName,
  contentClassName,
  children,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className={cn("shrink-0", className)}>
      <CardHeader className={cn("p-0", headerClassName)}>
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="flex w-full cursor-pointer items-start gap-2 select-none p-6 text-left"
        >
          {open ? (
            <ChevronDown className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-muted-fg)]" aria-hidden />
          ) : (
            <ChevronRight className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-muted-fg)]" aria-hidden />
          )}
          <div className="flex flex-col gap-1">
            <CardTitle>{title}</CardTitle>
            {subtitle && <p className="text-sm text-[var(--color-muted-fg)]">{subtitle}</p>}
          </div>
        </button>
      </CardHeader>
      {open && <CardContent className={cn("flex flex-col gap-3", contentClassName)}>{children}</CardContent>}
    </Card>
  );
}
