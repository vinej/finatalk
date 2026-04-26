import { ChevronDown, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  CATEGORIES,
  KINDS,
  categoryLabel,
  createActive,
  isCoreKind,
  kindCategory,
  kindDescription,
  kindLabel,
  type ActiveIndicator,
  type IndicatorCategory,
  type IndicatorKind,
} from "@/lib/indicator-defaults";
import { pickLang } from "@/lib/lang";
import { cn } from "@/lib/utils";

type IndicatorFilter = IndicatorCategory | "all" | "core";

export function IndicatorLibrary({ onAdd }: { onAdd: (item: ActiveIndicator) => void }) {
  const { t, i18n } = useTranslation();
  const lang = pickLang(i18n.language);
  const [filter, setFilter] = useState<IndicatorFilter>("all");
  const [collapsed, setCollapsed] = useState(true);

  const sortedKinds = useMemo(
    () => [...KINDS].sort((a, b) => kindLabel(a).localeCompare(kindLabel(b))),
    [],
  );

  const visibleKinds = useMemo(() => {
    if (filter === "all") return sortedKinds;
    if (filter === "core") return sortedKinds.filter((k) => isCoreKind(k));
    return sortedKinds.filter((k) => kindCategory(k) === filter);
  }, [sortedKinds, filter]);

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center gap-1.5 self-start rounded px-1 py-0.5 text-xs text-[var(--color-muted-fg)] hover:bg-[var(--color-accent)] hover:text-[var(--color-fg)]"
        aria-expanded={!collapsed}
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" aria-hidden />
        )}
        <span>{t("analysis.add")}</span>
      </button>
      {!collapsed && (
        <>
          <p className="flex items-center gap-1.5 text-xs text-[var(--color-muted-fg)]">
            <span className="inline-block h-2 w-2 rounded-full bg-[var(--color-primary)]" aria-hidden />
            {t("learnTa.coreLegend")}
          </p>
          <div className="flex flex-wrap items-center gap-1">
            <FilterPill
              active={filter === "all"}
              onClick={() => setFilter("all")}
              label={t("analysis.filterAll")}
            />
            <FilterPill
              active={filter === "core"}
              onClick={() => setFilter("core")}
              label={t("learnTa.coreLabel")}
              tone="core"
            />
            {CATEGORIES.map((cat) => (
              <FilterPill
                key={cat}
                active={filter === cat}
                onClick={() => setFilter(cat)}
                label={categoryLabel(cat, lang)}
              />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {visibleKinds.map((kind: IndicatorKind) => {
              const core = isCoreKind(kind);
              return (
                <Button
                  key={kind}
                  type="button"
                  size="sm"
                  variant="outline"
                  title={kindDescription(kind, lang)}
                  onClick={() => onAdd(createActive(kind))}
                  className={cn(
                    core &&
                      "border-[var(--color-primary)]/40 bg-[var(--color-primary)]/10 font-semibold text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20",
                  )}
                >
                  + {kindLabel(kind)}
                </Button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  label,
  tone = "default",
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  tone?: "default" | "core";
}) {
  const inactiveCore =
    "border-[var(--color-primary)]/40 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10";
  const inactiveDefault =
    "border-[var(--color-border)] text-[var(--color-muted-fg)] hover:bg-[var(--color-accent)] hover:text-[var(--color-fg)]";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-2.5 py-0.5 text-xs transition-colors",
        active
          ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-fg)]"
          : tone === "core"
            ? inactiveCore
            : inactiveDefault,
      )}
    >
      {label}
    </button>
  );
}
