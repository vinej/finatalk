import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatusCard({
  status,
  message,
  className,
}: {
  status: "loading" | "empty" | "error";
  message: string;
  className?: string;
}) {
  const tone =
    status === "error"
      ? "text-[var(--color-destructive)]"
      : "text-[var(--color-muted-fg)]";
  return (
    <Card className={className}>
      <CardContent className={cn("p-6 text-sm", tone)}>{message}</CardContent>
    </Card>
  );
}
