import type { Lang } from "@/lib/lang";

export type StrategyLink = { title: string; url: string };

export type StrategyStep = {
  title: string;
  body: string;
};

export type StrategyEntry = {
  label: string;
  summary: string;
  description: string;
  whenToUse: string;
  prosAndCons: string;
  links: StrategyLink[];
  indicatorsUsed?: string[];
  coreIdea?: string;
  steps?: StrategyStep[];
  whyItWorks?: string;
};

export const STRATEGY_KINDS = [
  "buyAndHold",
  "dollarCostAveraging",
  "valueInvesting",
  "growthInvesting",
  "dividendInvesting",
  "indexInvesting",
  "bondLaddering",
  "barbellStrategy",
  "assetAllocation",
  "coreSatellite",
  "momentumInvesting",
  "contrarianInvesting",
  "trendPullback",
  "breakoutMomentum",
  "meanReversion",
  "maCrossover",
  "supportResistancePullback",
  "openingRangeBreakout",
  "vwapStrategy",
  "volumeProfileRotation",
  "orderBlockRetest",
  "pivotPointReaction",
  "liqSweepReversal",
  "donchianTurtleBreakout",
  "trendStructureVolatility",
] as const;

export type StrategyKind = (typeof STRATEGY_KINDS)[number];

export type StrategyGroup = "longTerm" | "swing" | "intraday";

export const STRATEGY_GROUPS: Record<StrategyGroup, readonly StrategyKind[]> = {
  longTerm: [
    "buyAndHold",
    "dollarCostAveraging",
    "valueInvesting",
    "growthInvesting",
    "dividendInvesting",
    "indexInvesting",
    "bondLaddering",
    "barbellStrategy",
    "assetAllocation",
    "coreSatellite",
  ],
  swing: [
    "momentumInvesting",
    "contrarianInvesting",
    "trendPullback",
    "breakoutMomentum",
    "meanReversion",
    "maCrossover",
    "supportResistancePullback",
    "donchianTurtleBreakout",
    "trendStructureVolatility",
  ],
  intraday: [
    "openingRangeBreakout",
    "vwapStrategy",
    "volumeProfileRotation",
    "orderBlockRetest",
    "pivotPointReaction",
    "liqSweepReversal",
  ],
};

export const STRATEGY_GROUP_ORDER: readonly StrategyGroup[] = ["longTerm", "swing", "intraday"];
export const STRATEGY_GENERAL_LINKS: Record<Lang, StrategyLink[]> = {
  en: [
    { title: "Investopedia — Investment strategies", url: "https://www.investopedia.com/terms/i/investmentstrategy.asp" },
    { title: "Canada.ca — Savings and investments", url: "https://www.canada.ca/en/financial-consumer-agency/services/savings-investments.html" },
    { title: "AMF Quebec — Investing", url: "https://lautorite.qc.ca/en/general-public/investments" },
    { title: "Canadian Couch Potato", url: "https://canadiancouchpotato.com/" },
  ],
  fr: [
    { title: "Investopedia — Stratégies d'investissement (anglais)", url: "https://www.investopedia.com/terms/i/investmentstrategy.asp" },
    { title: "Canada.ca — Épargne et investissements", url: "https://www.canada.ca/fr/agence-consommation-matiere-financiere/services/epargne-investissements.html" },
    { title: "AMF Québec — Investissements", url: "https://lautorite.qc.ca/grand-public/investissements" },
    { title: "Canadian Couch Potato (anglais)", url: "https://canadiancouchpotato.com/" },
  ],
};
