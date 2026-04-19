import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  KINDS,
  createActive,
  kindDescription,
  kindLabel,
  type ActiveIndicator,
  type IndicatorKind,
} from "@/lib/indicator-defaults";
import { pickLang } from "@/lib/lang";

export function IndicatorLibrary({ onAdd }: { onAdd: (item: ActiveIndicator) => void }) {
  const { t, i18n } = useTranslation();
  const lang = pickLang(i18n.language);
  const sortedKinds = useMemo(
    () => [...KINDS].sort((a, b) => kindLabel(a).localeCompare(kindLabel(b))),
    [],
  );
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-[var(--color-muted-fg)]">{t("analysis.add")}</span>
      {sortedKinds.map((kind: IndicatorKind) => (
        <Button
          key={kind}
          type="button"
          size="sm"
          variant="outline"
          title={kindDescription(kind, lang)}
          onClick={() => onAdd(createActive(kind))}
        >
          + {kindLabel(kind)}
        </Button>
      ))}
    </div>
  );
}
