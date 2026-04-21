import type { RouterOutputs } from "@finatalk/trpc";
import type { Lang } from "@/lib/lang";
import type { StrategyKind } from "@/lib/strategy-guide";

type AnalyzeResult = RouterOutputs["market"]["analyze"]["results"][number];
type Candle = RouterOutputs["market"]["analyze"]["candles"][number];

export type StrategyAction = "buy" | "sell" | "exitLong" | "exitShort" | "wait";

export type StrategySignal = {
  action: StrategyAction;
  reasons: string[];
};

type Tr = (en: string, fr: string) => string;

function findOne<K extends AnalyzeResult["kind"]>(
  results: AnalyzeResult[],
  kind: K,
): Extract<AnalyzeResult, { kind: K }> | undefined {
  return results.find((r): r is Extract<AnalyzeResult, { kind: K }> => r.kind === kind);
}

function findAll<K extends AnalyzeResult["kind"]>(
  results: AnalyzeResult[],
  kind: K,
): Extract<AnalyzeResult, { kind: K }>[] {
  return results.filter((r): r is Extract<AnalyzeResult, { kind: K }> => r.kind === kind);
}

function lastLine(r: { series: { time: number; value: number }[] } | undefined): number | undefined {
  const last = r?.series.at(-1);
  return last?.value;
}

function findEmaByPeriod(results: AnalyzeResult[], target: number): number | undefined {
  const list = findAll(results, "ema");
  if (list.length === 0) return undefined;
  let best = list[0];
  let bestDelta = Math.abs(best.spec.period - target);
  for (const r of list) {
    const d = Math.abs(r.spec.period - target);
    if (d < bestDelta) {
      best = r;
      bestDelta = d;
    }
  }
  return lastLine(best);
}

// ────────────── evaluators ──────────────

function evalTrendPullback(results: AnalyzeResult[], price: number, t: Tr): StrategySignal {
  const ema = findEmaByPeriod(results, 50) ?? lastLine(findOne(results, "ema"));
  const rsi = lastLine(findOne(results, "rsi"));
  const vwap = lastLine(findOne(results, "vwap"));
  const reasons: string[] = [];

  if (ema == null || rsi == null) {
    reasons.push(t("Missing EMA 50 or RSI — add them to evaluate.", "EMA 50 ou RSI manquant — ajoutez-les pour évaluer."));
    return { action: "wait", reasons };
  }

  const aboveEma = price > ema;
  const belowEma = price < ema;
  const aboveVwap = vwap != null ? price > vwap : null;

  reasons.push(aboveEma
    ? t(`Price above EMA (${price.toFixed(2)} > ${ema.toFixed(2)}) — uptrend`, `Prix au-dessus de l'EMA (${price.toFixed(2)} > ${ema.toFixed(2)}) — tendance haussière`)
    : t(`Price below EMA (${price.toFixed(2)} < ${ema.toFixed(2)}) — downtrend`, `Prix sous l'EMA (${price.toFixed(2)} < ${ema.toFixed(2)}) — tendance baissière`));
  reasons.push(t(`RSI ${rsi.toFixed(1)}`, `RSI ${rsi.toFixed(1)}`));
  if (vwap != null) {
    reasons.push(aboveVwap
      ? t(`Above VWAP`, `Au-dessus du VWAP`)
      : t(`Below VWAP`, `Sous le VWAP`));
  }

  if (aboveEma && rsi >= 40 && rsi <= 50 && (aboveVwap !== false)) {
    reasons.push(t("Pullback in uptrend — buy setup", "Pullback en tendance haussière — setup d'achat"));
    return { action: "buy", reasons };
  }
  if (belowEma && rsi >= 50 && rsi <= 60 && (aboveVwap !== true)) {
    reasons.push(t("Pullback in downtrend — sell setup", "Pullback en tendance baissière — setup de vente"));
    return { action: "sell", reasons };
  }
  if (aboveEma && rsi >= 70) {
    reasons.push(t("Overbought — consider exiting long", "Surachat — envisager de sortir du long"));
    return { action: "exitLong", reasons };
  }
  if (belowEma && rsi <= 30) {
    reasons.push(t("Oversold — consider exiting short", "Survente — envisager de sortir du short"));
    return { action: "exitShort", reasons };
  }
  reasons.push(t("No clean pullback — wait", "Pas de pullback net — patienter"));
  return { action: "wait", reasons };
}

function evalBreakoutMomentum(results: AnalyzeResult[], price: number, t: Tr): StrategySignal {
  const donchian = findOne(results, "donchian");
  const last = donchian?.series.at(-1);
  const prev = donchian?.series.at(-2);
  const reasons: string[] = [];

  if (!last || !prev) {
    reasons.push(t("Add Donchian Channels to evaluate breakouts.", "Ajoutez les canaux de Donchian pour évaluer les cassures."));
    return { action: "wait", reasons };
  }

  reasons.push(t(`Donchian high ${last.upper.toFixed(2)} / low ${last.lower.toFixed(2)}`, `Plus haut Donchian ${last.upper.toFixed(2)} / plus bas ${last.lower.toFixed(2)}`));
  if (price >= last.upper * 0.999) {
    reasons.push(t("Close at/above the channel high — breakout long", "Clôture à/au-dessus du plus haut — cassure haussière"));
    return { action: "buy", reasons };
  }
  if (price <= last.lower * 1.001) {
    reasons.push(t("Close at/below the channel low — breakout short", "Clôture à/sous le plus bas — cassure baissière"));
    return { action: "sell", reasons };
  }
  reasons.push(t("Price inside the range — wait for a breakout close", "Prix dans le range — attendre une clôture de cassure"));
  return { action: "wait", reasons };
}

function evalMeanReversion(results: AnalyzeResult[], price: number, t: Tr): StrategySignal {
  const bb = findOne(results, "bbands")?.series.at(-1);
  const rsi = lastLine(findOne(results, "rsi"));
  const z = lastLine(findOne(results, "zscore"));
  const pctB = lastLine(findOne(results, "bbPctB"));
  const adx = findOne(results, "adx")?.series.at(-1)?.adx;
  const reasons: string[] = [];

  if (!bb && rsi == null && z == null && pctB == null) {
    reasons.push(t("Add Bollinger / RSI / Z-Score to evaluate.", "Ajoutez Bollinger / RSI / Z-Score pour évaluer."));
    return { action: "wait", reasons };
  }

  if (adx != null) reasons.push(t(`ADX ${adx.toFixed(1)}`, `ADX ${adx.toFixed(1)}`));
  if (adx != null && adx >= 25) {
    reasons.push(t("Strong trend — mean-reversion is unsafe here", "Forte tendance — le retour à la moyenne est risqué ici"));
    return { action: "wait", reasons };
  }

  let bull = 0;
  let bear = 0;
  if (bb) {
    if (price <= bb.lower) { bull++; reasons.push(t(`Price at/below lower BB (${bb.lower.toFixed(2)})`, `Prix à/sous la BB basse (${bb.lower.toFixed(2)})`)); }
    if (price >= bb.upper) { bear++; reasons.push(t(`Price at/above upper BB (${bb.upper.toFixed(2)})`, `Prix à/au-dessus de la BB haute (${bb.upper.toFixed(2)})`)); }
  }
  if (rsi != null) {
    reasons.push(t(`RSI ${rsi.toFixed(1)}`, `RSI ${rsi.toFixed(1)}`));
    if (rsi <= 30) bull++;
    if (rsi >= 70) bear++;
  }
  if (z != null) {
    reasons.push(t(`Z-score ${z.toFixed(2)}`, `Z-score ${z.toFixed(2)}`));
    if (z <= -2) bull++;
    if (z >= 2) bear++;
  }
  if (pctB != null) {
    if (pctB <= 0) bull++;
    if (pctB >= 1) bear++;
  }

  if (bull >= 2) { reasons.push(t("Mean-reversion buy", "Achat de retour à la moyenne")); return { action: "buy", reasons }; }
  if (bear >= 2) { reasons.push(t("Mean-reversion sell", "Vente de retour à la moyenne")); return { action: "sell", reasons }; }
  reasons.push(t("Not at statistical extreme — wait", "Pas d'extrême statistique — patienter"));
  return { action: "wait", reasons };
}

function evalMaCrossover(results: AnalyzeResult[], t: Tr): StrategySignal {
  const cross = findOne(results, "maCross");
  const last = cross?.series.events.at(-1);
  const lastFast = cross?.series.fast.at(-1)?.value;
  const lastSlow = cross?.series.slow.at(-1)?.value;
  const reasons: string[] = [];
  if (!cross || lastFast == null || lastSlow == null) {
    reasons.push(t("Add the MA Cross indicator to evaluate.", "Ajoutez l'indicateur MA Cross pour évaluer."));
    return { action: "wait", reasons };
  }
  const fastAbove = lastFast > lastSlow;
  reasons.push(fastAbove
    ? t(`Fast MA above slow (${lastFast.toFixed(2)} > ${lastSlow.toFixed(2)})`, `MA rapide au-dessus de la lente (${lastFast.toFixed(2)} > ${lastSlow.toFixed(2)})`)
    : t(`Fast MA below slow (${lastFast.toFixed(2)} < ${lastSlow.toFixed(2)})`, `MA rapide sous la lente (${lastFast.toFixed(2)} < ${lastSlow.toFixed(2)})`));

  // Recent cross (within last few bars) counts as a fresh signal
  const seriesLen = cross.series.fast.length;
  const fresh = last && seriesLen > 0 && last.time >= (cross.series.fast.at(-5)?.time ?? 0);
  if (fresh && last.direction === "bull") { reasons.push(t("Recent golden cross", "Croisement doré récent")); return { action: "buy", reasons }; }
  if (fresh && last.direction === "bear") { reasons.push(t("Recent death cross", "Croisement de la mort récent")); return { action: "sell", reasons }; }
  return { action: fastAbove ? "wait" : "wait", reasons };
}

function evalSupportResistancePullback(results: AnalyzeResult[], price: number, t: Tr): StrategySignal {
  const sr = findOne(results, "srLevels");
  const reasons: string[] = [];
  if (!sr || sr.series.levels.length === 0) {
    reasons.push(t("Add S/R Levels to evaluate.", "Ajoutez les niveaux S/R pour évaluer."));
    return { action: "wait", reasons };
  }
  const nearestSupport = sr.series.levels
    .filter((l) => l.type === "support" && l.price <= price)
    .sort((a, b) => b.price - a.price)[0];
  const nearestResistance = sr.series.levels
    .filter((l) => l.type === "resistance" && l.price >= price)
    .sort((a, b) => a.price - b.price)[0];

  if (nearestSupport) {
    const pct = ((price - nearestSupport.price) / nearestSupport.price) * 100;
    reasons.push(t(`Support ${nearestSupport.price.toFixed(2)} (+${pct.toFixed(2)}%)`, `Support ${nearestSupport.price.toFixed(2)} (+${pct.toFixed(2)}%)`));
    if (pct < 1 && pct > -0.5) { reasons.push(t("Price at support — buy on hold", "Prix au support — achat si tenue")); return { action: "buy", reasons }; }
  }
  if (nearestResistance) {
    const pct = ((nearestResistance.price - price) / price) * 100;
    reasons.push(t(`Resistance ${nearestResistance.price.toFixed(2)} (+${pct.toFixed(2)}%)`, `Résistance ${nearestResistance.price.toFixed(2)} (+${pct.toFixed(2)}%)`));
    if (pct < 1 && pct > -0.5) { reasons.push(t("Price at resistance — sell on rejection", "Prix à la résistance — vente si rejet")); return { action: "sell", reasons }; }
  }
  reasons.push(t("Between levels — wait", "Entre niveaux — patienter"));
  return { action: "wait", reasons };
}

function evalOpeningRangeBreakout(_results: AnalyzeResult[], _candles: Candle[], t: Tr): StrategySignal {
  return {
    action: "wait",
    reasons: [t("Opening-range breakouts require intraday session data — not evaluated here.", "Les cassures de range d'ouverture nécessitent des données intraday — non évalué ici.")],
  };
}

function evalVwap(results: AnalyzeResult[], price: number, t: Tr): StrategySignal {
  const vwap = lastLine(findOne(results, "vwap"));
  const rsi = lastLine(findOne(results, "rsi"));
  const macd = findOne(results, "macd")?.series.at(-1);
  const reasons: string[] = [];
  if (vwap == null) {
    reasons.push(t("Add VWAP to evaluate.", "Ajoutez le VWAP pour évaluer."));
    return { action: "wait", reasons };
  }
  const above = price > vwap;
  const diffPct = ((price - vwap) / vwap) * 100;
  reasons.push(t(`Price ${above ? "above" : "below"} VWAP (${diffPct >= 0 ? "+" : ""}${diffPct.toFixed(2)}%)`, `Prix ${above ? "au-dessus" : "sous"} du VWAP (${diffPct >= 0 ? "+" : ""}${diffPct.toFixed(2)}%)`));
  if (rsi != null) reasons.push(t(`RSI ${rsi.toFixed(1)}`, `RSI ${rsi.toFixed(1)}`));
  if (macd) reasons.push(t(`MACD ${(macd.histogram).toFixed(3)}`, `MACD ${(macd.histogram).toFixed(3)}`));
  if (above && (rsi == null || rsi >= 45) && (!macd || macd.histogram >= 0)) {
    reasons.push(t("Above VWAP with positive momentum — buy bias", "Au-dessus du VWAP avec momentum positif — biais acheteur"));
    return { action: "buy", reasons };
  }
  if (!above && (rsi == null || rsi <= 55) && (!macd || macd.histogram <= 0)) {
    reasons.push(t("Below VWAP with negative momentum — sell bias", "Sous le VWAP avec momentum négatif — biais vendeur"));
    return { action: "sell", reasons };
  }
  reasons.push(t("Mixed — wait", "Mitigé — patienter"));
  return { action: "wait", reasons };
}

function evalVolumeProfileRotation(results: AnalyzeResult[], price: number, t: Tr): StrategySignal {
  const vp = findOne(results, "volProfile")?.series;
  const reasons: string[] = [];
  if (!vp) {
    reasons.push(t("Add Volume Profile to evaluate.", "Ajoutez le Volume Profile pour évaluer."));
    return { action: "wait", reasons };
  }
  reasons.push(t(`POC ${vp.poc.toFixed(2)} / VAH ${vp.vah.toFixed(2)} / VAL ${vp.val.toFixed(2)}`, `POC ${vp.poc.toFixed(2)} / VAH ${vp.vah.toFixed(2)} / VAL ${vp.val.toFixed(2)}`));
  if (price <= vp.val * 1.002) {
    reasons.push(t("Price at/below VAL — buy rotation to POC", "Prix à/sous le VAL — rotation acheteuse vers le POC"));
    return { action: "buy", reasons };
  }
  if (price >= vp.vah * 0.998) {
    reasons.push(t("Price at/above VAH — sell rotation to POC", "Prix à/au-dessus du VAH — rotation vendeuse vers le POC"));
    return { action: "sell", reasons };
  }
  reasons.push(t("Inside value area — wait for edge", "Dans la value area — attendre un bord"));
  return { action: "wait", reasons };
}

function evalOrderBlockRetest(results: AnalyzeResult[], price: number, t: Tr): StrategySignal {
  const ob = findOne(results, "orderBlock")?.series.blocks ?? [];
  const active = ob.filter((b) => !b.mitigated);
  const reasons: string[] = [];
  if (active.length === 0) {
    reasons.push(t("No active order blocks — add Order Block indicator or wait.", "Aucun order block actif — ajoutez l'indicateur ou patientez."));
    return { action: "wait", reasons };
  }
  for (const b of active) {
    const inside = price >= b.bottom * 0.998 && price <= b.top * 1.002;
    if (!inside) continue;
    reasons.push(t(`Price inside a ${b.type} order block [${b.bottom.toFixed(2)} – ${b.top.toFixed(2)}]`, `Prix dans un order block ${b.type === "bullish" ? "haussier" : "baissier"} [${b.bottom.toFixed(2)} – ${b.top.toFixed(2)}]`));
    return { action: b.type === "bullish" ? "buy" : "sell", reasons };
  }
  reasons.push(t("Outside active order blocks — wait for retest.", "Hors des order blocks actifs — attendre un retest."));
  return { action: "wait", reasons };
}

function evalPivotPointReaction(results: AnalyzeResult[], price: number, t: Tr): StrategySignal {
  const pivots = findOne(results, "pivots")?.series.periods;
  const last = pivots?.at(-1);
  const reasons: string[] = [];
  if (!last) {
    reasons.push(t("Add Pivot Points to evaluate.", "Ajoutez les Pivot Points pour évaluer."));
    return { action: "wait", reasons };
  }
  // Find nearest pivot level
  const sorted = [...last.levels].sort((a, b) => Math.abs(a.price - price) - Math.abs(b.price - price));
  const nearest = sorted[0];
  if (!nearest) return { action: "wait", reasons };
  const distPct = Math.abs((price - nearest.price) / nearest.price) * 100;
  reasons.push(t(`Nearest pivot: ${nearest.label} @ ${nearest.price.toFixed(2)} (${distPct.toFixed(2)}%)`, `Pivot le plus proche : ${nearest.label} @ ${nearest.price.toFixed(2)} (${distPct.toFixed(2)}%)`));
  if (distPct > 0.3) {
    reasons.push(t("Price not close to a pivot — wait.", "Prix éloigné d'un pivot — patienter."));
    return { action: "wait", reasons };
  }
  if (nearest.role === "support") return { action: "buy", reasons: [...reasons, t("Tagged support pivot — buy on hold", "Pivot support tagué — achat si tenue")] };
  if (nearest.role === "resistance") return { action: "sell", reasons: [...reasons, t("Tagged resistance pivot — sell on rejection", "Pivot résistance tagué — vente si rejet")] };
  return { action: "wait", reasons };
}

function evalLiqSweepReversal(results: AnalyzeResult[], candles: Candle[], t: Tr): StrategySignal {
  const sweeps = findOne(results, "liqSweep")?.series.events ?? [];
  const lastCandleTime = candles.at(-1)?.time ?? 0;
  const recent = sweeps.filter((e) => lastCandleTime - e.time < 10 * 86_400); // ~10-day window (candle time is unix seconds)
  const reasons: string[] = [];
  if (recent.length === 0) {
    reasons.push(t("No recent liquidity sweeps — wait.", "Aucun sweep de liquidité récent — patienter."));
    return { action: "wait", reasons };
  }
  const last = recent.at(-1)!;
  reasons.push(t(`Recent ${last.type}-side liquidity sweep at ${last.level.toFixed(2)}`, `Sweep récent côté ${last.type === "high" ? "haut" : "bas"} à ${last.level.toFixed(2)}`));
  return last.type === "high"
    ? { action: "sell", reasons: [...reasons, t("Sweep of highs → reversal short", "Sweep des plus hauts → retournement short")] }
    : { action: "buy", reasons: [...reasons, t("Sweep of lows → reversal long", "Sweep des plus bas → retournement long")] };
}

function evalDonchianTurtle(results: AnalyzeResult[], price: number, t: Tr): StrategySignal {
  const donchians = findAll(results, "donchian");
  if (donchians.length === 0) {
    return { action: "wait", reasons: [t("Add Donchian Channels (20/55) to evaluate.", "Ajoutez les canaux de Donchian (20/55) pour évaluer.")] };
  }
  // Pick smallest-period for entries (System 1 = 20), use 10-bar low for exit if present
  const entry = [...donchians].sort((a, b) => a.spec.period - b.spec.period)[0];
  const last = entry.series.at(-1);
  const reasons: string[] = [];
  if (!last) return { action: "wait", reasons: [t("Insufficient data.", "Données insuffisantes.")] };
  reasons.push(t(`Donchian(${entry.spec.period}) high ${last.upper.toFixed(2)} / low ${last.lower.toFixed(2)}`, `Donchian(${entry.spec.period}) plus haut ${last.upper.toFixed(2)} / plus bas ${last.lower.toFixed(2)}`));
  if (price >= last.upper * 0.999) return { action: "buy", reasons: [...reasons, t("Close at channel high → enter long", "Clôture au plus haut → entrée long")] };
  if (price <= last.lower * 1.001) return { action: "sell", reasons: [...reasons, t("Close at channel low → enter short", "Clôture au plus bas → entrée short")] };
  reasons.push(t("Inside channel — hold or wait.", "Dans le canal — tenir ou patienter."));
  return { action: "wait", reasons };
}

function evalTrendStructureVolatility(results: AnalyzeResult[], price: number, t: Tr): StrategySignal {
  const ema = findEmaByPeriod(results, 50) ?? lastLine(findOne(results, "ema"));
  const adx = findOne(results, "adx")?.series.at(-1);
  const rsi = lastLine(findOne(results, "rsi"));
  const keltner = findOne(results, "keltner")?.series.at(-1);
  const vwap = lastLine(findOne(results, "vwap"));
  const vp = findOne(results, "volProfile")?.series;
  const reasons: string[] = [];

  if (ema == null || adx == null || rsi == null || !keltner) {
    reasons.push(t("Missing core indicator (EMA / ADX / RSI / Keltner) — add them.", "Indicateur clé manquant (EMA / ADX / RSI / Keltner) — ajoutez-les."));
    return { action: "wait", reasons };
  }

  const aboveEma = price > ema;
  const strongTrend = adx.adx >= 25;
  const plusDominant = adx.pdi > adx.mdi;
  reasons.push(t(`ADX ${adx.adx.toFixed(1)}`, `ADX ${adx.adx.toFixed(1)}`));
  reasons.push(t(`RSI ${rsi.toFixed(1)}`, `RSI ${rsi.toFixed(1)}`));
  reasons.push(t(aboveEma ? `Above EMA 50 (${ema.toFixed(2)})` : `Below EMA 50 (${ema.toFixed(2)})`, aboveEma ? `Au-dessus EMA 50 (${ema.toFixed(2)})` : `Sous EMA 50 (${ema.toFixed(2)})`));

  if (!strongTrend) {
    reasons.push(t("ADX < 25 — chop regime, stand aside", "ADX < 25 — régime choppy, rester à l'écart"));
    return { action: "wait", reasons };
  }

  // Long scenario
  if (aboveEma && plusDominant) {
    const pullbackOk = rsi >= 40 && rsi <= 55;
    const structureOk = (vwap == null || price >= vwap) && (vp == null || price >= vp.val);
    const triggerOk = price >= keltner.middle;
    if (pullbackOk && structureOk && triggerOk) {
      reasons.push(t("All six filters align long", "Tous les six filtres s'alignent long"));
      return { action: "buy", reasons };
    }
    if (rsi >= 70) { reasons.push(t("RSI overbought — consider trimming longs", "RSI en surachat — envisager d'alléger les longs")); return { action: "exitLong", reasons }; }
    reasons.push(t("Long bias but setup incomplete — wait", "Biais long mais setup incomplet — patienter"));
    return { action: "wait", reasons };
  }
  // Short scenario
  if (!aboveEma && !plusDominant) {
    const pullbackOk = rsi >= 45 && rsi <= 60;
    const structureOk = (vwap == null || price <= vwap) && (vp == null || price <= vp.vah);
    const triggerOk = price <= keltner.middle;
    if (pullbackOk && structureOk && triggerOk) {
      reasons.push(t("All six filters align short", "Tous les six filtres s'alignent short"));
      return { action: "sell", reasons };
    }
    if (rsi <= 30) { reasons.push(t("RSI oversold — consider covering shorts", "RSI en survente — envisager de couvrir les shorts")); return { action: "exitShort", reasons }; }
    reasons.push(t("Short bias but setup incomplete — wait", "Biais short mais setup incomplet — patienter"));
    return { action: "wait", reasons };
  }
  reasons.push(t("Trend/direction conflict — wait", "Conflit tendance/direction — patienter"));
  return { action: "wait", reasons };
}

export function evaluateStrategy(
  kind: StrategyKind,
  results: AnalyzeResult[],
  candles: Candle[],
  lang: Lang,
): StrategySignal | null {
  const lastCandle = candles.at(-1);
  if (!lastCandle) return null;
  const price = lastCandle.close;
  const t: Tr = (en, fr) => (lang === "fr" ? fr : en);

  switch (kind) {
    case "trendPullback": return evalTrendPullback(results, price, t);
    case "breakoutMomentum": return evalBreakoutMomentum(results, price, t);
    case "meanReversion": return evalMeanReversion(results, price, t);
    case "maCrossover": return evalMaCrossover(results, t);
    case "supportResistancePullback": return evalSupportResistancePullback(results, price, t);
    case "openingRangeBreakout": return evalOpeningRangeBreakout(results, candles, t);
    case "vwapStrategy": return evalVwap(results, price, t);
    case "volumeProfileRotation": return evalVolumeProfileRotation(results, price, t);
    case "orderBlockRetest": return evalOrderBlockRetest(results, price, t);
    case "pivotPointReaction": return evalPivotPointReaction(results, price, t);
    case "liqSweepReversal": return evalLiqSweepReversal(results, candles, t);
    case "donchianTurtleBreakout": return evalDonchianTurtle(results, price, t);
    case "trendStructureVolatility": return evalTrendStructureVolatility(results, price, t);
    default: return null;
  }
}
