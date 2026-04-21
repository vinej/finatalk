import type { Lang } from "@/lib/lang";
import type { StrategyEntry, StrategyKind } from "@/lib/strategy-guide/kinds";
import { STRATEGY_GUIDE_EN } from "@/lib/strategy-guide/entries-en";
import { STRATEGY_GUIDE_FR } from "@/lib/strategy-guide/entries-fr";

export type { StrategyLink, StrategyStep, StrategyEntry, StrategyKind, StrategyGroup } from "@/lib/strategy-guide/kinds";
export {
  STRATEGY_KINDS,
  STRATEGY_GROUPS,
  STRATEGY_GROUP_ORDER,
  STRATEGY_GENERAL_LINKS,
} from "@/lib/strategy-guide/kinds";

export const STRATEGY_GUIDE: Record<Lang, Record<StrategyKind, StrategyEntry>> = {
  en: STRATEGY_GUIDE_EN,
  fr: STRATEGY_GUIDE_FR,
};
