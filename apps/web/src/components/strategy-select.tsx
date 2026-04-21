import { useTranslation } from "react-i18next";
import type { Lang } from "@/lib/lang";
import {
  STRATEGY_GROUPS,
  STRATEGY_GROUP_ORDER,
  STRATEGY_GUIDE,
  type StrategyKind,
} from "@/lib/strategy-guide";

export type StrategySelectProps = {
  value: StrategyKind | "" | null | undefined;
  onChange: (kind: StrategyKind | "") => void;
  strategies: readonly StrategyKind[];
  lang: Lang;
  grouped?: boolean;
  placeholder?: string;
  suffixFor?: (kind: StrategyKind) => string | null | undefined;
  className?: string;
  disabled?: boolean;
  id?: string;
  title?: string;
  "aria-label"?: string;
};

export function StrategySelect({
  value,
  onChange,
  strategies,
  lang,
  grouped = false,
  placeholder,
  suffixFor,
  className,
  disabled,
  id,
  title,
  "aria-label": ariaLabel,
}: StrategySelectProps) {
  const { t } = useTranslation();
  const allowed = new Set<StrategyKind>(strategies);
  const labelOf = (k: StrategyKind) => STRATEGY_GUIDE[lang][k].label;
  const sortByLabel = (a: StrategyKind, b: StrategyKind) =>
    labelOf(a).localeCompare(labelOf(b), lang);

  function renderOption(k: StrategyKind) {
    const suffix = suffixFor?.(k);
    return (
      <option key={k} value={k}>
        {labelOf(k)}
        {suffix ? ` — ${suffix}` : ""}
      </option>
    );
  }

  return (
    <select
      id={id}
      className={className}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value as StrategyKind | "")}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
    >
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {grouped
        ? STRATEGY_GROUP_ORDER.map((group) => {
            const items = STRATEGY_GROUPS[group]
              .filter((k) => allowed.has(k))
              .slice()
              .sort(sortByLabel);
            if (items.length === 0) return null;
            return (
              <optgroup key={group} label={t(`learnStrategies.group.${group}`)}>
                {items.map(renderOption)}
              </optgroup>
            );
          })
        : [...allowed].sort(sortByLabel).map(renderOption)}
    </select>
  );
}
