import type { RouterInputs } from "@finatalk/trpc";
import type { Lang } from "@/lib/lang";

export type ActiveIndicator =
  RouterInputs["analysis"]["createAnalysis"]["indicators"][number];
export type IndicatorSpec = ActiveIndicator["spec"];
export type IndicatorColor = ActiveIndicator["color"];
export type IndicatorKind = IndicatorSpec["kind"];

export const KINDS: IndicatorKind[] = [
  "sma", "ema", "rma", "wma", "dema",
  "rsi", "mom", "roc", "macd", "bbands",
  "atr", "adx", "stoch", "stochRsi", "williamsR", "obv", "psar",
  "maCross", "macdCross",
];

export function kindLabel(kind: IndicatorKind): string {
  switch (kind) {
    case "sma": return "SMA";
    case "ema": return "EMA";
    case "rma": return "RMA";
    case "wma": return "WMA";
    case "dema": return "DEMA";
    case "rsi": return "RSI";
    case "mom": return "MOM";
    case "roc": return "ROC";
    case "macd": return "MACD";
    case "bbands": return "BBands";
    case "atr": return "ATR";
    case "adx": return "ADX";
    case "stoch": return "Stoch";
    case "stochRsi": return "StochRSI";
    case "williamsR": return "Williams %R";
    case "obv": return "OBV";
    case "psar": return "PSAR";
    case "maCross": return "MA Cross";
    case "macdCross": return "MACD Cross";
  }
}

export function defaultSpec(kind: IndicatorKind): IndicatorSpec {
  switch (kind) {
    case "sma": return { kind: "sma", period: 20 };
    case "ema": return { kind: "ema", period: 50 };
    case "rma": return { kind: "rma", period: 14 };
    case "wma": return { kind: "wma", period: 20 };
    case "dema": return { kind: "dema", period: 20 };
    case "rsi": return { kind: "rsi", period: 14 };
    case "mom": return { kind: "mom", period: 10 };
    case "roc": return { kind: "roc", period: 12 };
    case "macd": return { kind: "macd", fast: 12, slow: 26, signal: 9 };
    case "bbands": return { kind: "bbands", period: 20, stdDev: 2 };
    case "atr": return { kind: "atr", period: 14 };
    case "adx": return { kind: "adx", period: 14 };
    case "stoch": return { kind: "stoch", period: 14, signal: 3, smooth: 3 };
    case "stochRsi": return { kind: "stochRsi", period: 14 };
    case "williamsR": return { kind: "williamsR", period: 14 };
    case "obv": return { kind: "obv" };
    case "psar": return { kind: "psar", step: 0.02, max: 0.2 };
    case "maCross": return { kind: "maCross", fastPeriod: 50, slowPeriod: 200, maType: "sma" };
    case "macdCross": return { kind: "macdCross", fast: 12, slow: 26, signal: 9 };
  }
}

export function defaultColor(kind: IndicatorKind): IndicatorColor {
  switch (kind) {
    case "sma": return "#2563eb";
    case "ema": return "#16a34a";
    case "rma": return "#0ea5e9";
    case "wma": return "#f59e0b";
    case "dema": return "#14b8a6";
    case "rsi": return "#7c3aed";
    case "mom": return "#ef4444";
    case "roc": return "#a855f7";
    case "macd": return { kind: "macd", line: "#2563eb", signal: "#dc2626", hist: "#9ca3af" };
    case "bbands": return "#db2777";
    case "atr": return "#f97316";
    case "adx": return { kind: "adx", adx: "#1f2937", pdi: "#16a34a", mdi: "#dc2626" };
    case "stoch": return { kind: "stoch", k: "#2563eb", d: "#dc2626" };
    case "stochRsi": return "#9333ea";
    case "williamsR": return "#0891b2";
    case "obv": return "#64748b";
    case "psar": return "#f43f5e";
    case "maCross":
      return { kind: "maCross", fast: "#2563eb", slow: "#ea580c", bull: "#16a34a", bear: "#dc2626" };
    case "macdCross":
      return { kind: "macdCross", bull: "#16a34a", bear: "#dc2626" };
  }
}

const KIND_DESCRIPTIONS_EN: Record<IndicatorKind, string> = {
  sma: "Simple Moving Average — equal-weighted average of the last N closes. Smooths price to reveal trend direction; price crossing above/below the SMA is a common trend signal. Typical periods: 20 (short), 50 (medium), 200 (long).",
  ema: "Exponential Moving Average — weighted average that reacts faster to recent prices than the SMA. Often used in trend-following crossovers (e.g. EMA 12 vs EMA 26) and as dynamic support/resistance.",
  rma: "Running (Wilder's) Moving Average — exponential smoothing with a slower decay (alpha = 1/N). The smoothing used inside RSI and ATR; smoother than EMA, less reactive to spikes.",
  wma: "Weighted Moving Average — linear weights so the most recent close counts most. Reacts faster than SMA while staying smoother than EMA. Useful for short-term trend detection.",
  dema: "Double Exponential Moving Average — two-stage EMA designed to reduce lag. Hugs price more tightly than EMA, useful for catching trend changes earlier (at the cost of more noise).",
  rsi: "Relative Strength Index — momentum oscillator bounded 0–100, comparing average gains to average losses over N periods. Above 70 = overbought, below 30 = oversold; divergence with price often signals reversals. Default 14.",
  mom: "Momentum — close minus close N periods ago. Positive = price rising vs N bars ago, negative = falling. Zero-line crossings flag shifts in directional strength.",
  roc: "Rate of Change — percent change vs close N periods ago. Like Momentum but normalized, so it's comparable across price levels. Used to spot acceleration, divergence, and overbought/oversold extremes.",
  macd: "Moving Average Convergence Divergence — MACD line = EMA(fast) − EMA(slow), Signal = EMA of MACD, Histogram = MACD − Signal. Signal-line crossovers, zero-line crossings, and histogram divergences are the classic trade triggers. Defaults 12/26/9.",
  bbands: "Bollinger Bands — middle SMA(N) with upper/lower bands at K standard deviations. Bands widen on volatility, narrow on calm (the 'squeeze' precedes breakouts); touches near the bands flag overextension. Defaults period 20, stdDev 2.",
  atr: "Average True Range — Wilder's measure of volatility: average of the true range (high-low with gap adjustments) over N periods. Used for stop-loss sizing and position sizing, not direction. Default 14.",
  adx: "Average Directional Index — trend strength (0–100) derived from +DI and −DI. ADX > 25 suggests a trending market; +DI above −DI = uptrend, reverse = downtrend. Great filter for moving-average crossovers. Default 14.",
  stoch: "Stochastic Oscillator — compares current close to the high/low range over N periods. %K and %D lines bounded 0–100; >80 overbought, <20 oversold. %K/%D crossovers near extremes are the classic signal. Defaults 14/3/3.",
  stochRsi: "Stochastic RSI — applies the Stochastic formula to RSI values instead of price. More sensitive than plain RSI, catching shorter overbought/oversold cycles. Range 0–1 (or 0–100). Default 14.",
  williamsR: "Williams %R — momentum oscillator on an inverted −100 to 0 scale. Above −20 = overbought, below −80 = oversold. Mechanically similar to Stochastic %K but flipped. Default 14.",
  obv: "On-Balance Volume — cumulative volume: adds volume on up days, subtracts on down days. Rising OBV confirms uptrends; divergence with price often precedes reversals. Direction matters more than absolute level.",
  psar: "Parabolic SAR — trend-following stop-and-reverse dots that flip from below price (uptrend) to above (downtrend). Used as a trailing stop or trend filter. Defaults step 0.02, max 0.2.",
  maCross: "MA Cross — plots a fast and a slow moving average on the price chart and marks every crossover. The classic 50/200 SMA pair produces the 'Golden Cross' (fast crosses above slow — bullish regime) and 'Death Cross' (fast crosses below — bearish). Configurable periods and SMA/EMA.",
  macdCross: "MACD Signal Cross — runs MACD and flags every time the MACD line crosses its signal line: up-arrow for bullish, down-arrow for bearish. Use alongside a trend filter to avoid choppy-market whipsaws. Defaults 12/26/9.",
};

const KIND_DESCRIPTIONS_FR: Record<IndicatorKind, string> = {
  sma: "Moyenne mobile simple — moyenne équipondérée des N dernières clôtures. Lisse le prix pour révéler la direction de la tendance ; le franchissement du prix au-dessus/au-dessous de la MMS est un signal de tendance courant. Périodes typiques : 20 (courte), 50 (moyenne), 200 (longue).",
  ema: "Moyenne mobile exponentielle — moyenne pondérée qui réagit plus vite aux prix récents que la MMS. Souvent utilisée pour les croisements en suivi de tendance (p. ex. MME 12 vs MME 26) et comme support/résistance dynamique.",
  rma: "Moyenne mobile de Wilder (RMA) — lissage exponentiel à décroissance lente (alpha = 1/N). C'est le lissage utilisé à l'intérieur du RSI et de l'ATR ; plus lisse que la MME, moins réactive aux pics.",
  wma: "Moyenne mobile pondérée — pondérations linéaires donnant le plus de poids à la clôture la plus récente. Réagit plus vite que la MMS tout en restant plus lisse que la MME. Utile pour détecter les tendances à court terme.",
  dema: "Double moyenne mobile exponentielle — MME à deux passes conçue pour réduire le retard. Épouse le prix de plus près que la MME, utile pour capter plus tôt les changements de tendance (au prix d'un peu plus de bruit).",
  rsi: "Indice de force relative — oscillateur de momentum borné 0–100 comparant les gains et pertes moyens sur N périodes. Au-dessus de 70 = suracheté, en dessous de 30 = survendu ; les divergences avec le prix signalent souvent des renversements. Défaut : 14.",
  mom: "Momentum — clôture actuelle moins clôture d'il y a N périodes. Positif = prix en hausse vs il y a N barres, négatif = en baisse. Les franchissements de zéro indiquent un changement de force directionnelle.",
  roc: "Taux de variation — variation en pourcentage par rapport à la clôture d'il y a N périodes. Semblable au Momentum mais normalisé, donc comparable entre niveaux de prix. Sert à repérer accélération, divergence et extrêmes de surachat/survente.",
  macd: "Convergence-divergence de moyennes mobiles — ligne MACD = MME(rapide) − MME(lente), ligne de signal = MME de la MACD, histogramme = MACD − signal. Les croisements de la ligne de signal, les franchissements de zéro et les divergences d'histogramme sont les déclencheurs classiques. Défauts 12/26/9.",
  bbands: "Bandes de Bollinger — MMS(N) centrale avec bandes supérieure/inférieure à K écarts-types. Les bandes s'élargissent en forte volatilité et se resserrent en calme (le « squeeze » précède les cassures) ; les touches près des bandes signalent un excès. Défauts : période 20, écart-type 2.",
  atr: "Average True Range — mesure de volatilité de Wilder : moyenne du « true range » (haut-bas avec ajustement des gaps) sur N périodes. Sert au dimensionnement des stops et des positions, pas à la direction. Défaut : 14.",
  adx: "Indice directionnel moyen — force de la tendance (0–100) dérivée de +DI et −DI. ADX > 25 suggère un marché en tendance ; +DI au-dessus de −DI = tendance haussière, inverse = baissière. Excellent filtre pour les croisements de moyennes mobiles. Défaut : 14.",
  stoch: "Oscillateur stochastique — compare la clôture actuelle à l'intervalle haut/bas sur N périodes. Lignes %K et %D bornées 0–100 ; >80 suracheté, <20 survendu. Les croisements %K/%D près des extrêmes sont le signal classique. Défauts 14/3/3.",
  stochRsi: "Stochastique RSI — applique la formule stochastique aux valeurs du RSI plutôt qu'au prix. Plus sensible que le RSI simple, capte des cycles surachat/survente plus courts. Plage 0–1 (ou 0–100). Défaut : 14.",
  williamsR: "Williams %R — oscillateur de momentum sur une échelle inversée de −100 à 0. Au-dessus de −20 = suracheté, en dessous de −80 = survendu. Mécaniquement semblable au %K stochastique mais inversé. Défaut : 14.",
  obv: "On-Balance Volume — volume cumulé : ajoute le volume des jours haussiers, retranche celui des jours baissiers. Un OBV haussier confirme les tendances ; les divergences avec le prix précèdent souvent les renversements. La direction compte plus que le niveau absolu.",
  psar: "Parabolic SAR — points de « stop-and-reverse » en suivi de tendance qui basculent du dessous du prix (tendance haussière) au-dessus (tendance baissière). Utilisé comme stop suiveur ou filtre de tendance. Défauts : pas 0,02, max 0,2.",
  maCross: "Croisement de MM — trace une moyenne mobile rapide et une lente sur le graphique des prix et marque chaque croisement. Le classique 50/200 en MMS donne le « Golden Cross » (la rapide franchit la lente à la hausse — régime haussier) et le « Death Cross » (franchissement à la baisse). Périodes et type (MMS/MME) configurables.",
  macdCross: "Croisement du signal MACD — exécute la MACD et marque chaque franchissement de la ligne de signal : flèche haute = haussier, flèche basse = baissier. À utiliser avec un filtre de tendance pour éviter les faux signaux en marché chaotique. Défauts 12/26/9.",
};

export function kindDescription(kind: IndicatorKind, lang: Lang = "en"): string {
  return (lang === "fr" ? KIND_DESCRIPTIONS_FR : KIND_DESCRIPTIONS_EN)[kind];
}

export function formatLabel(spec: IndicatorSpec): string {
  switch (spec.kind) {
    case "sma":
    case "ema":
    case "rma":
    case "wma":
    case "dema":
    case "rsi":
    case "mom":
    case "roc":
    case "atr":
    case "adx":
    case "stochRsi":
    case "williamsR":
      return `${kindLabel(spec.kind)} ${spec.period}`;
    case "macd":
      return `MACD ${spec.fast}/${spec.slow}/${spec.signal}`;
    case "bbands":
      return `BBands ${spec.period}/${spec.stdDev}`;
    case "stoch":
      return `Stoch ${spec.period}/${spec.signal}/${spec.smooth}`;
    case "obv":
      return "OBV";
    case "psar":
      return `PSAR ${spec.step}/${spec.max}`;
    case "maCross": {
      const isGolden = spec.maType === "sma" && spec.fastPeriod === 50 && spec.slowPeriod === 200;
      if (isGolden) return "Golden/Death Cross (SMA 50/200)";
      const base = spec.maType.toUpperCase();
      return `${base} Cross ${spec.fastPeriod}/${spec.slowPeriod}`;
    }
    case "macdCross":
      return `MACD Cross ${spec.fast}/${spec.slow}/${spec.signal}`;
  }
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function createActive(kind: IndicatorKind): ActiveIndicator {
  return { localId: newId(), spec: defaultSpec(kind), color: defaultColor(kind) };
}

export const DEFAULT_SEED: ActiveIndicator[] = [
  createActive("sma"),
  createActive("rsi"),
  createActive("macd"),
];
