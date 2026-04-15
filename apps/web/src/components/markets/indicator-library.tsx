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

export function IndicatorLibrary({ onAdd }: { onAdd: (item: ActiveIndicator) => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-[var(--color-muted-fg)]">{t("markets.add")}</span>
      {KINDS.map((kind: IndicatorKind) => (
        <Button
          key={kind}
          type="button"
          size="sm"
          variant="outline"
          title={kindDescription(kind)}
          onClick={() => onAdd(createActive(kind))}
        >
          + {kindLabel(kind)}
        </Button>
      ))}
    </div>
  );
}
