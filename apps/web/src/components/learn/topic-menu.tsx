import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type TopicMenuItem<K extends string> = { key: K; label: string };

export function TopicMenu<K extends string>({
  title,
  items,
  activeKey,
  onSelect,
}: {
  title: string;
  items: readonly TopicMenuItem<K>[];
  activeKey: K;
  onSelect: (key: K) => void;
}) {
  return (
    <Card className="flex max-h-full flex-col overflow-hidden">
      <CardHeader className="shrink-0">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-auto">
        <ul className="flex flex-col gap-1">
          {items.map((item) => {
            const active = item.key === activeKey;
            return (
              <li key={item.key}>
                <button
                  type="button"
                  onClick={() => onSelect(item.key)}
                  className={`w-full rounded-md border px-2.5 py-1.5 text-left text-sm transition-colors ${
                    active
                      ? "border-[var(--color-border)] bg-[var(--color-accent)] font-medium"
                      : "border-transparent hover:bg-[var(--color-accent)]/60"
                  }`}
                >
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
