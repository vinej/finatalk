import { cn } from "@/lib/utils";

export type TabBarItem<K extends string> = { key: K; label: string };

export function TabBar<K extends string>({
  tabs,
  activeKey,
  onSelect,
  className,
}: {
  tabs: readonly TabBarItem<K>[];
  activeKey: K;
  onSelect: (key: K) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn("flex gap-1 border-b border-[var(--color-border)]", className)}
    >
      {tabs.map((tab) => {
        const active = tab.key === activeKey;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(tab.key)}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-sm transition-colors",
              active
                ? "border-[var(--color-primary)] font-medium text-[var(--color-fg)]"
                : "border-transparent text-[var(--color-muted-fg)] hover:text-[var(--color-fg)]",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
