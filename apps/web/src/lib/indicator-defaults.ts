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

const FULL_NAME_EN: Record<IndicatorKind, string> = {
  sma: "Simple Moving Average",
  ema: "Exponential Moving Average",
  rma: "Running Moving Average",
  wma: "Weighted Moving Average",
  dema: "Double Exponential Moving Average",
  rsi: "Relative Strength Index",
  mom: "Momentum",
  roc: "Rate of Change",
  macd: "Moving Average Convergence Divergence",
  bbands: "Bollinger Bands",
  atr: "Average True Range",
  adx: "Average Directional Index",
  stoch: "Stochastic Oscillator",
  stochRsi: "Stochastic RSI",
  williamsR: "Williams Percent Range",
  obv: "On-Balance Volume",
  psar: "Parabolic Stop and Reverse",
  maCross: "Moving Average Crossover",
  macdCross: "MACD Signal Crossover",
};

const FULL_NAME_FR: Record<IndicatorKind, string> = {
  sma: "Moyenne mobile simple",
  ema: "Moyenne mobile exponentielle",
  rma: "Moyenne mobile de Wilder",
  wma: "Moyenne mobile pondérée",
  dema: "Double moyenne mobile exponentielle",
  rsi: "Indice de force relative",
  mom: "Momentum",
  roc: "Taux de variation",
  macd: "Convergence-divergence de moyennes mobiles",
  bbands: "Bandes de Bollinger",
  atr: "Écart moyen réel",
  adx: "Indice directionnel moyen",
  stoch: "Oscillateur stochastique",
  stochRsi: "Stochastique RSI",
  williamsR: "Williams %R",
  obv: "Volume d'équilibre",
  psar: "SAR parabolique",
  maCross: "Croisement de moyennes mobiles",
  macdCross: "Croisement du signal MACD",
};

export function kindFullName(kind: IndicatorKind, lang: Lang = "en"): string {
  if (lang === "fr") {
    return `${FULL_NAME_EN[kind]}, ${FULL_NAME_FR[kind]}`;
  }
  return FULL_NAME_EN[kind];
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
  sma: "Moyenne mobile simple — moyenne équipondérée des N dernières clôtures. Lisse le prix pour révéler la direction de la tendance ; le franchissement du prix au-dessus/au-dessous de la SMA est un signal de tendance courant. Périodes typiques : 20 (courte), 50 (moyenne), 200 (longue).",
  ema: "Moyenne mobile exponentielle — moyenne pondérée qui réagit plus vite aux prix récents que la SMA. Souvent utilisée pour les croisements en suivi de tendance (p. ex. EMA 12 vs EMA 26) et comme support/résistance dynamique.",
  rma: "Moyenne mobile de Wilder — lissage exponentiel à décroissance lente (alpha = 1/N). C'est le lissage utilisé à l'intérieur du RSI et de l'ATR ; plus lisse que l'EMA, moins réactive aux pics.",
  wma: "Moyenne mobile pondérée — pondérations linéaires donnant le plus de poids à la clôture la plus récente. Réagit plus vite que la SMA tout en restant plus lisse que l'EMA. Utile pour détecter les tendances à court terme.",
  dema: "Double moyenne mobile exponentielle — EMA à deux passes conçue pour réduire le retard. Épouse le prix de plus près que l'EMA, utile pour capter plus tôt les changements de tendance (au prix d'un peu plus de bruit).",
  rsi: "Indice de force relative — oscillateur de momentum borné 0–100 comparant les gains et pertes moyens sur N périodes. Au-dessus de 70 = suracheté, en dessous de 30 = survendu ; les divergences avec le prix signalent souvent des renversements. Défaut : 14.",
  mom: "Momentum — clôture actuelle moins clôture d'il y a N périodes. Positif = prix en hausse vs il y a N barres, négatif = en baisse. Les franchissements de zéro indiquent un changement de force directionnelle.",
  roc: "Taux de variation — variation en pourcentage par rapport à la clôture d'il y a N périodes. Semblable au Momentum mais normalisé, donc comparable entre niveaux de prix. Sert à repérer accélération, divergence et extrêmes de surachat/survente.",
  macd: "Convergence-divergence de moyennes mobiles — ligne MACD = EMA(rapide) − EMA(lente), ligne de signal = EMA de la MACD, histogramme = MACD − signal. Les croisements de la ligne de signal, les franchissements de zéro et les divergences d'histogramme sont les déclencheurs classiques. Défauts 12/26/9.",
  bbands: "Bandes de Bollinger — SMA(N) centrale avec bandes supérieure/inférieure à K écarts-types. Les bandes s'élargissent en forte volatilité et se resserrent en calme (le « squeeze » précède les cassures) ; les touches près des bandes signalent un excès. Défauts : période 20, écart-type 2.",
  atr: "Écart moyen réel — mesure de volatilité de Wilder : moyenne du « true range » (haut-bas avec ajustement des gaps) sur N périodes. Sert au dimensionnement des stops et des positions, pas à la direction. Défaut : 14.",
  adx: "Indice directionnel moyen — force de la tendance (0–100) dérivée de +DI et −DI. ADX > 25 suggère un marché en tendance ; +DI au-dessus de −DI = tendance haussière, inverse = baissière. Excellent filtre pour les croisements de moyennes mobiles. Défaut : 14.",
  stoch: "Oscillateur stochastique — compare la clôture actuelle à l'intervalle haut/bas sur N périodes. Lignes %K et %D bornées 0–100 ; >80 suracheté, <20 survendu. Les croisements %K/%D près des extrêmes sont le signal classique. Défauts 14/3/3.",
  stochRsi: "Stochastique RSI — applique la formule Stochastic aux valeurs du RSI plutôt qu'au prix. Plus sensible que le RSI simple, capte des cycles surachat/survente plus courts. Plage 0–1 (ou 0–100). Défaut : 14.",
  williamsR: "Williams %R — oscillateur de momentum sur une échelle inversée de −100 à 0. Au-dessus de −20 = suracheté, en dessous de −80 = survendu. Mécaniquement semblable au Stochastic %K mais inversé. Défaut : 14.",
  obv: "Volume d'équilibre — volume cumulé : ajoute le volume des jours haussiers, retranche celui des jours baissiers. Un OBV haussier confirme les tendances ; les divergences avec le prix précèdent souvent les renversements. La direction compte plus que le niveau absolu.",
  psar: "SAR parabolique — points de « stop-and-reverse » en suivi de tendance qui basculent du dessous du prix (tendance haussière) au-dessus (tendance baissière). Utilisé comme stop suiveur ou filtre de tendance. Défauts : pas 0,02, max 0,2.",
  maCross: "Croisement de moyennes mobiles — trace une moving average rapide et une lente sur le graphique des prix et marque chaque croisement. Le classique 50/200 en SMA donne le « Golden Cross » (la rapide franchit la lente à la hausse — régime haussier) et le « Death Cross » (franchissement à la baisse). Périodes et type (SMA/EMA) configurables.",
  macdCross: "Croisement du signal MACD — exécute la MACD et marque chaque franchissement de la ligne de signal : flèche haute = haussier, flèche basse = baissier. À utiliser avec un filtre de tendance pour éviter les faux signaux en marché chaotique. Défauts 12/26/9.",
};

export function kindDescription(kind: IndicatorKind, lang: Lang = "en"): string {
  return (lang === "fr" ? KIND_DESCRIPTIONS_FR : KIND_DESCRIPTIONS_EN)[kind];
}

const KIND_ONELINER_EN: Record<IndicatorKind, string> = {
  sma: "Price above a rising SMA = uptrend, below a falling SMA = downtrend.",
  ema: "Faster than SMA — EMA crossovers (e.g. 12/26) catch trend shifts earlier.",
  rma: "Smoother than EMA — the internal smoothing behind RSI and ATR.",
  wma: "Reacts faster than SMA, smoother than EMA — good for short-term trend detection.",
  dema: "Reduced-lag EMA — catches trend changes earlier at the cost of more noise.",
  rsi: "Classic levels: above 70 = overbought, below 30 = oversold (use 80/20 in strong trends).",
  mom: "Close minus close N bars ago — zero-line crossings flag directional shifts.",
  roc: "Percent change vs N bars ago — spot acceleration and divergences across any price level.",
  macd: "Signal-line crossovers, zero-line crossings, histogram divergences — triple trigger system.",
  bbands: "Bands widen on volatility, narrow before breakouts (the 'squeeze'); touches flag overextension.",
  atr: "Measures volatility, not direction — use for stop-loss and position sizing.",
  adx: "ADX > 25 = trending market; +DI above −DI = up, reverse = down.",
  stoch: "%K/%D crossovers near 80 (overbought) or 20 (oversold) are the classic signals.",
  stochRsi: "More sensitive than plain RSI — catches shorter overbought/oversold cycles.",
  williamsR: "Above −20 = overbought, below −80 = oversold — inverted Stochastic %K.",
  obv: "Rising OBV confirms uptrends; divergence with price often precedes reversals.",
  psar: "Dots below price = uptrend, above = downtrend — acts as a trailing stop.",
  maCross: "Golden Cross (50 above 200) = bullish regime, Death Cross = bearish.",
  macdCross: "Flags every MACD/signal crossover — use with a trend filter to avoid whipsaws.",
};

const KIND_ONELINER_FR: Record<IndicatorKind, string> = {
  sma: "Prix au-dessus d'une SMA haussière = tendance haussière, en dessous = baissière.",
  ema: "Plus rapide que la SMA — les croisements EMA (ex. 12/26) captent plus tôt les retournements.",
  rma: "Plus lisse que l'EMA — le lissage interne du RSI et de l'ATR.",
  wma: "Réagit plus vite que la SMA, plus lisse que l'EMA — idéale pour les tendances court terme.",
  dema: "EMA à retard réduit — capte les changements de tendance plus tôt, avec un peu plus de bruit.",
  rsi: "Niveaux classiques : au-dessus de 70 = suracheté, en dessous de 30 = survendu (80/20 en forte tendance).",
  mom: "Clôture moins clôture il y a N barres — les franchissements de zéro signalent un changement directionnel.",
  roc: "Variation en % vs N barres — repère accélération et divergences quel que soit le niveau de prix.",
  macd: "Croisements du signal, franchissements de zéro, divergences de l'histogramme — triple déclencheur.",
  bbands: "Les bandes s'élargissent en volatilité, se resserrent avant les cassures ; les touches signalent un excès.",
  atr: "Mesure la volatilité, pas la direction — utilisé pour dimensionner stops et positions.",
  adx: "ADX > 25 = marché en tendance ; +DI au-dessus de −DI = hausse, inverse = baisse.",
  stoch: "Croisements %K/%D près de 80 (suracheté) ou 20 (survendu) : les signaux classiques.",
  stochRsi: "Plus sensible que le RSI simple — capte des cycles surachat/survente plus courts.",
  williamsR: "Au-dessus de −20 = suracheté, en dessous de −80 = survendu — Stochastic %K inversé.",
  obv: "Un OBV haussier confirme la tendance ; les divergences avec le prix précèdent souvent les renversements.",
  psar: "Points sous le prix = tendance haussière, au-dessus = baissière — sert de stop suiveur.",
  maCross: "Golden Cross (50 au-dessus de 200) = régime haussier, Death Cross = baissier.",
  macdCross: "Signale chaque croisement MACD/signal — à combiner avec un filtre de tendance.",
};

export function kindOneliner(kind: IndicatorKind, lang: Lang = "en"): string {
  return (lang === "fr" ? KIND_ONELINER_FR : KIND_ONELINER_EN)[kind];
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
  { localId: newId(), spec: { kind: "sma", period: 50 }, color: defaultColor("sma") },
  { localId: newId(), spec: { kind: "rsi", period: 14 }, color: defaultColor("rsi") },
  { localId: newId(), spec: { kind: "macd", fast: 12, slow: 26, signal: 9 }, color: defaultColor("macd") },
  { localId: newId(), spec: { kind: "bbands", period: 20, stdDev: 2 }, color: defaultColor("bbands") },
];
