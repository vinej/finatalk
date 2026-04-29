import type { Lang } from "@/lib/lang";
import type { TaLink } from "@/lib/ta-guide";

export type BuySellSection = {
  id: string;
  title: string;
  body: string;
};

export type BuySellGuide = {
  intro: string;
  sections: BuySellSection[];
  links: TaLink[];
};

const EN: BuySellGuide = {
  intro:
    "Technical indicators never say *buy now* or *sell now* — they describe the state of supply and demand and shift the probabilities. The signals below are the ones established TA literature (Murphy, Pring, Elder, Wilder, Appel, Bollinger) and modern trading desks actually use. Combine two or three, check the market regime, confirm the fundamentals, size the risk — then act.",
  sections: [
    {
      id: "regime",
      title: "1. Identify the market regime first",
      body:
        "The **same indicator flips meaning depending on regime**. Check this before reading any signal:\n\n" +
        "- **Trending market** — ADX > 25, Bollinger Bands expanding, price making higher highs (or lower lows). Oscillator extremes (RSI > 70, Stoch > 80) can stay pinned for weeks — do not fade them. Trade with moving-average crossovers, MACD, and pullbacks to trend support.\n" +
        "- **Range-bound market** — ADX < 20, Bollinger Bands contracting, price oscillating between support and resistance. This is where oscillators shine: buy oversold near support, sell overbought near resistance. Avoid trend-following signals, they produce whipsaws.\n" +
        "- **Transition / squeeze** — Bollinger Band width at multi-month lows signals an imminent breakout but not direction. Wait for the first strong candle + volume to confirm the side.",
    },
    {
      id: "long-short",
      title: "2. Long vs short — the two sides of a trade",
      body:
        "Every technical signal is meaningful only *relative to which side you're on*. Before reading any buy/sell rule, know what long and short actually mean.\n\n" +
        "**Long — betting the price rises**\n" +
        "- You **own** the asset (or a contract to buy it). You profit when price goes **up**.\n" +
        "- Buy 100 shares at $150, sell later at $180 → +$30/share.\n" +
        "- **Max loss**: price can only go to $0, so loss is capped at what you paid.\n" +
        "- **Max gain**: theoretically unlimited — price can rise forever.\n" +
        "- \"Going long\" = buying. \"Closing a long\" = selling what you own.\n\n" +
        "**Short — betting the price falls**\n" +
        "- You **sell an asset you don't own**, betting the price will fall. Mechanically: your broker lends you the shares, you sell them at today's price, then later **buy them back** (\"cover\") and return them.\n" +
        "- Short 100 shares at $180, price drops to $150, buy back → +$30/share.\n" +
        "- **Max gain**: capped — price can only fall to $0.\n" +
        "- **Max loss**: *theoretically unlimited* — price can rise forever and you'd have to buy back at any cost.\n" +
        "- Extra costs and risks: borrow fees, margin requirements, and the possibility of a **forced buy-in** if the lender recalls the shares.\n\n" +
        "**How the platform's signal evaluator maps to this**\n" +
        "- `buy` → open or add to a **long** (price expected to rise).\n" +
        "- `sell` → open or add to a **short** (price expected to fall).\n" +
        "- `exitLong` → close an existing long (take profit or cut loss on a bullish position).\n" +
        "- `exitShort` → close an existing short (buy back the borrowed shares).\n" +
        "- `wait` → no edge; stand aside.\n\n" +
        "**Why the distinction matters for reading indicators**\n" +
        "The same reading can mean opposite things depending on which side you're on. RSI at 75 is a *warning for long holders* (overbought — consider trimming) but a potential *entry for shorts* in a mean-reversion setup. The evaluator picks a side first (trend direction, ADX, structure) before deciding whether overbought means \"trim longs\" or \"look to short.\"\n\n" +
        "**Practical note for retail investors**\n" +
        "Most retail brokerage cash accounts only allow going **long**. Shorting requires a **margin account**, carries unlimited theoretical risk, and is usually not permitted in retirement accounts (RRSP, TFSA, 401(k), IRA). If you cannot short, treat `sell` and `exitShort` signals as *do-not-buy-here* warnings rather than actionable entries — and focus on `buy` / `exitLong` / `wait` for your own book.",
    },
    {
      id: "entry",
      title: "3. Buy signals (long entries)",
      body:
        "Higher-probability long setups share **confluence** — multiple independent signals agreeing at the same price.\n\n" +
        "- **Oversold + reversal candle at support** — RSI < 30 (or Williams %R < −80, Stoch < 20) AND a bullish hammer/engulfing AND a prior support or the 200-day MA. Classic swing-trade long.\n" +
        "- **Bullish divergence** — price makes a lower low, oscillator (RSI, MACD) makes a higher low. Strongest when it forms at major support.\n" +
        "- **Breakout with volume** — close above a horizontal resistance or descending trendline on volume ≥ 1.5× the 20-day average. Wait for the close, not the intrabar wick.\n" +
        "- **Pullback to rising moving average** — in a confirmed uptrend (ADX > 25, price above 200-day MA), a dip to the 20- or 50-day MA with oversold stochastics and a reversal candle is a high-quality add point.\n" +
        "- **Golden cross confirmed** — 50-day MA crosses above 200-day MA with ADX rising. Avoid if the cross happens on a tight, flat pair — that's not a trend.\n" +
        "- **MACD zero-line cross up** — bullish MACD crossovers are stronger when the MACD line is below zero than when it's already extended above.\n" +
        "- **PSAR flip to below price** + rising ADX — trend-following entry trigger.\n" +
        "- **VWAP reclaim (intraday)** — price breaks back above a rising VWAP on volume after an early dip. This is the textbook institutional buy trigger: desks and algos target VWAP for execution, so a reclaim means buyers are outpaying the day's volume-weighted average. Pullbacks that hold VWAP support in an uptrending session are high-quality adds.\n" +
        "- **Fibonacci retracement into a key level** — after a strong up-move, pullbacks into the 38.2%, 50%, or 61.8% retracement (the 'golden zone' 50–61.8% is the most watched) are frequent long entry points. The edge is largely self-fulfilling: enough discretionary traders place orders at those levels that reactions cluster there. Confirm with a reversal candle or oversold oscillator — the level alone is not a trigger. Works best on liquid instruments and clear, single-leg swings.\n" +
        "- **Liquidity sweep low + reversal** — price pierces a prior N-bar swing low, triggering stop orders, then closes back inside the range. Reveals a failed supply push / stop run. High-probability long when the sweep lands at an auto-detected S/R cluster, unmitigated bullish Order Block, or Value Area Low. Entry on the reversal candle close, stop just below the sweep wick.\n" +
        "- **Unmitigated bullish Order Block retest** — in an uptrend, price pulls back to the last bearish candle that preceded a strong impulse up, reacts and holds. That candle's range is the 'order block' — the footprint of institutional accumulation. Enter on the bullish reversal candle inside the block, stop below the block's low. Best combined with a sweep or FVG inside the zone.\n" +
        "- **Bullish Fair Value Gap fill and hold** — price retraces into a prior bullish FVG (3-bar imbalance) and rejects the gap's lower edge. FVGs that coincide with S/R or a pivot are the highest-quality reaction zones. Confirm with a bullish candle closing above the gap's upper edge.\n" +
        "- **Volume Profile — reclaim of VAL or POC** — in rotational regimes, price dips below the Value Area Low, reclaims it on a bullish close, and holds POC on first retest. Natural target: the Value Area High. Skip if ADX > 25 or the profile is bimodal — that's a trending / regime-shift environment, not rotation.\n" +
        "- **Reaction at Pivot S1 (or PP) in a bullish period** — price opens above the period's PP (bullish bias), pulls back to S1 and reacts. PP itself is the intraday/weekly bias line — long bias above it, short below. Camarilla L3 / Fibonacci S1 are the tighter mean-reversion variants.\n" +
        "- **Auto S/R cluster with high touches** — the auto-detection indicator flags a support cluster with many prior touches; price tags the level with a bullish rejection candle. More touches + recency = stronger level. Flip-zones (broken resistance becoming support) are particularly reliable on retest.",
    },
    {
      id: "exit",
      title: "4. Sell signals (exits and shorts)",
      body:
        "The exit is harder than the entry. Plan it *before* you enter.\n\n" +
        "- **Overbought is a warning, not a trigger.** Exit on the *turn*: RSI back under 70, MACD rolling over, bearish divergence — not the first overbought print.\n" +
        "- **Bearish divergence at resistance** — price makes a higher high, oscillator makes a lower high, and you're into known overhead supply. High-probability fade or exit.\n" +
        "- **Break below trend support** — loss of the 20- or 50-day MA in an uptrend, especially on expanding volume, is often the first real sell signal.\n" +
        "- **Death cross confirmed** — 50-day crosses below 200-day MA, ADX rising. Lagging but reliable regime-change signal for long-term holders.\n" +
        "- **MACD bearish cross above zero** — strongest when MACD has been extended well above zero and then crosses its signal line down.\n" +
        "- **Trailing stop triggered** — the most underrated exit. ATR-based stop (e.g. 2× ATR below recent swing high) lets winners run while capping give-back.\n" +
        "- **Volatility expansion on bad news** — a 3σ move on negative catalyst usually continues 1–3 days; don't try to catch the first bounce.\n" +
        "- **Loss of VWAP from above (intraday)** — price spent the session above VWAP, then breaks down through it on rising volume. Early warning that control has flipped from buyers to sellers; a failed attempt to reclaim VWAP from below confirms the change and often sets up a trend-day down.\n" +
        "- **Failed Fibonacci bounce / break of 61.8%** — price retraces to a Fib level (38.2% or 50%), tries to hold, then closes back through it on volume. A close beyond 61.8% of the prior swing invalidates the retracement thesis — the move is no longer a pullback, it's a reversal. Tight invalidation makes Fib levels useful for stop placement even if you don't enter on them.\n" +
        "- **Liquidity sweep high + reversal** — price pierces a prior N-bar swing high, triggering stops, then closes back inside the range. Classic short trigger and a high-probability long exit. Strongest at session highs, prior-day highs, round numbers, or at the upper edge of a Value Area. Stop just above the sweep wick — one of the tightest risk definitions available.\n" +
        "- **Unmitigated bearish Order Block retest** — in a downtrend, price rallies into the last bullish candle before an impulsive drop and rejects. Enter on the bearish reversal candle inside the block, stop just above the block's high. Blocks already touched ('mitigated') have largely spent their edge — skip them.\n" +
        "- **Rejection at a bearish FVG** — in a downtrend, rallies into an unfilled bearish Fair Value Gap tend to reject; a candle that pushes into the gap and closes back below the lower edge is a short trigger. If the gap fills with acceptance (close above the upper edge), the short thesis is invalidated.\n" +
        "- **Volume Profile — rejection at VAH or loss of POC** — in rotation, price stretches to the Value Area High with no acceptance (wicks, no follow-through close) and returns toward POC. Target POC first, then VAL on extension. A close below POC that holds flips the session bias short and opens VAL as a target.\n" +
        "- **Break of Pivot PP with a down-close** — a decisive close through PP shifts the period's bias from bullish to bearish. R1 then becomes the natural rally-back short level; S1/S2 are the next targets. Reliable on index futures and major FX where pivots get respected.\n" +
        "- **Break of a major auto S/R cluster on volume** — the top-touched support cluster fails with a volume-expanding close below. The flip zone (old support becoming resistance) is the retest short; target the next cluster down. Multi-touch levels give more warning but also larger follow-through when they finally break.",
    },
    {
      id: "confirmation",
      title: "5. Confirmation and confluence",
      body:
        "A single indicator firing is noise. Two agreeing is a signal. Three aligning at the same price is a setup.\n\n" +
        "- **Pair a trend filter with a trigger** — e.g. price above 200-day MA (filter) + MACD bullish cross (trigger). Ignore triggers that fight the filter.\n" +
        "- **Pair a momentum oscillator with price structure** — RSI oversold is better at support than in mid-range.\n" +
        "- **Volume confirms price** — breakouts without volume usually fail. Distribution (price up, volume drying up) precedes tops.\n" +
        "- **Multi-timeframe agreement** — a daily buy signal aligned with a weekly uptrend has much higher odds than a daily signal fighting the weekly trend.\n" +
        "- **VWAP as intraday bias filter** — trading on the same side of VWAP as your signal aligns you with the day's volume-weighted consensus (what institutions are paying). Fighting VWAP with a single-stock setup is low-probability; wait for the reclaim or the break before taking the trigger.\n" +
        "- **Fibonacci as a confluence amplifier, not a standalone** — Fib retracements (38.2 / 50 / 61.8%) work mostly through self-fulfilling behavior: many discretionary traders act on the same levels. Treat them as magnets, not triggers. A Fib level that coincides with a prior support, the 200-day MA, or a trendline is a far higher-quality zone than a Fib level in open space. Pure quant models rarely rely on Fibs alone — use them to *refine* entries and stops, not to replace trend or momentum signals.\n" +
        "- **Avoid redundant confirmation** — RSI, Stoch, Williams %R, StochRSI all say essentially the same thing. Confluence means *different* signal families agreeing (trend + momentum + volume + structure).\n" +
        "- **Structure indicators are a dedicated family** — auto S/R, Pivot Points, Volume Profile, Order Blocks, Fair Value Gaps, and Liquidity Sweeps all describe *where* supply and demand sit, not *when* they act. Stacking a structure level (e.g. Pivot S1 + bullish Order Block + Value Area Low) with a momentum trigger (RSI oversold + bullish MACD cross) is the highest-quality confluence available. Rule of thumb: a structure level without a trigger is a watch, a trigger without a level is noise, both together is a setup.\n" +
        "- **Mitigation / fill state matters** — unmitigated Order Blocks and unfilled Fair Value Gaps retain their edge; mitigated/filled ones have mostly paid out and should be deprioritised. Similarly, an S/R cluster that has been tested many times without breaking is a higher-quality level than a fresh pivot seen once.",
    },
    {
      id: "palette",
      title: "6. Extended indicator palette",
      body:
        "Beyond the eight core indicators (EMA / RSI / MACD / Bollinger / ATR / ADX / OBV / VWAP), Finatalk ships roughly thirty alternatives. Each slots into one of a handful of families — use them as substitutes, confirmations, or structural context, not as additions for their own sake.\n\n" +
        "**Moving-average variants (companions / substitutes for EMA)**\n" +
        "- **SMA (Simple MA)** — equal-weighted average of the last N closes. The workhorse long-term filter — the 200-day SMA is the institutional regime line, the 50-day the swing-trend line. Slower than EMA, which is the point: less whipsaw.\n" +
        "- **RMA (Wilder's MA)** — the exponential smoothing Wilder actually used inside RSI and ATR (alpha = 1/N). Smoother than EMA of the same period; useful whenever you want EMA-style reactivity without noise spikes.\n" +
        "- **WMA (Weighted MA)** — linear weights so the most recent close counts most. Sits between SMA and EMA — faster than SMA, steadier than EMA. Short-term swing traders favour it on fast timeframes.\n" +
        "- **DEMA (Double EMA)** — two-pass EMA designed to cancel lag. Hugs price tightly; catches trend changes earlier than EMA at the cost of more chop in ranges. A good choice for active trend-following when you accept more false flips.\n\n" +
        "**Momentum alternatives (substitutes / companions for RSI)**\n" +
        "- **Momentum (MOM)** — raw `close − close[N]`. Positive and rising = accelerating; zero-line crossings flag directional shifts. Unbounded, so useful for divergence but not for overbought/oversold gating.\n" +
        "- **Rate of Change (ROC)** — percent version of Momentum: comparable across price levels and across tickers. Extremes are asset-specific — calibrate against the instrument's own history, not a fixed threshold.\n" +
        "- **Stochastic Oscillator** — close vs the high-low range over N bars. %K/%D crossovers at extremes (<20 / >80) are the textbook signal. Faster than RSI, but noisier in trends.\n" +
        "- **Stochastic RSI** — Stoch formula applied to RSI rather than price. Catches shorter cycles than plain RSI; excellent in ranges, whippy in trends. Pair with a regime filter.\n" +
        "- **Williams %R** — mechanically the Stochastic %K on an inverted −100…0 scale (>−20 overbought, <−80 oversold). Redundant with Stoch — pick one, not both.\n\n" +
        "**Volatility bands and measures (substitutes / companions for Bollinger and ATR)**\n" +
        "- **Keltner Channels** — ATR-based envelope around an EMA. A close above the upper band = momentum breakout, a pullback to the middle EMA in an uptrend = add point. Less prone to false squeezes than Bollinger in trending markets because ATR scales the bands to *directional* volatility, not standard deviation.\n" +
        "- **Donchian Channels** — simply the highest-high / lowest-low of the last N bars. A close above the 20-day Donchian high = classic Turtle-trader entry; a close below the 10-day low = Turtle exit. The middle line is the mid-range mean.\n" +
        "- **Chaikin Volatility** — rate of change of the EMA of (high − low). Rising ChaikinVol = widening ranges (often precedes breakouts); collapsing ChaikinVol = contraction warning that a range will resolve soon. Use as a timing filter, not a signal.\n\n" +
        "**Volume / money flow (substitutes and companions for OBV and VWAP)**\n" +
        "- **A/D (Accumulation / Distribution) Line** — cumulative close-location volume. Divergence between A/D and price = quiet institutional accumulation (bullish) or distribution (bearish) before price confirms. Especially useful at range edges.\n" +
        "- **Chaikin Money Flow (CMF)** — money-flow volume over a rolling 20–21 bar window. CMF > 0 = net accumulation, < 0 = net distribution. The cross of zero after a clear divergence is a timing trigger.\n" +
        "- **Volume Oscillator** — difference (or %) between a fast and a slow volume MA. Rising during a breakout candle = genuine participation; flat or falling = almost certainly a fake breakout, step aside.\n\n" +
        "**Trend-strength alternatives (companions to ADX)**\n" +
        "- **Aroon (Up / Down)** — bars since the highest-high and lowest-low in a window. Aroon-Up > 70 with Aroon-Down < 30 = strong uptrend; crossovers of Up/Down = trend shifts; both < 50 = consolidation. More intuitive for spotting the *start* of a trend than ADX.\n" +
        "- **Vortex (+VI / −VI)** — +VI crossing above −VI = trend change to up (and mirror); widening spread between the two = strengthening trend. More reactive than ADX on mid-timeframes, slightly more whipsaw-prone.\n" +
        "- **Trend Intensity Index (TII)** — proportion of closes above/below a long-term SMA, rescaled 0–100. TII > 80 = clean uptrend; < 20 = clean downtrend; 40–60 = chop. Excellent binary regime filter before running any other setup.\n\n" +
        "**Trend-following stops and crossovers**\n" +
        "- **Parabolic SAR (PSAR)** — trend-following stop-and-reverse dots that flip from below price (uptrend) to above (downtrend). Use as a trailing stop in confirmed trends; whips badly in chop — gate with ADX > 20.\n" +
        "- **MA Cross** — plots a fast and a slow moving average and marks every crossover. The 50/200 SMA pair produces the Golden Cross (bullish regime) and Death Cross (bearish). Lagging but reliable for position-sizing decisions and regime flips.\n" +
        "- **MACD Cross** — marks every MACD signal-line crossover on the chart. Faster than MA Cross; best used under a trend filter (e.g. price above 200-day SMA) to avoid chop.\n\n" +
        "**Statistical / regime indicators**\n" +
        "- **Bollinger %B** — normalised Bollinger reading (0 at lower band, 1 at upper). %B > 1 or < 0 = closing outside the bands (extreme stretch). Divergences with %B are often cleaner to spot than with raw price because the indicator is already scaled.\n" +
        "- **Price Z-Score** — standardised distance of close from its rolling mean, expressed in σ. |Z| > 2 = stretched; |Z| > 3 = statistically extreme. Direct mean-reversion trigger that needs no further normalisation.\n" +
        "- **Hurst Exponent** — long-memory exponent from R/S analysis. H > 0.55 = trending / momentum regime (prefer trend-following setups); H < 0.45 = mean-reverting (prefer fades); ≈ 0.5 = random walk (no TA edge). Use as a *meta-filter* before choosing which entry family to deploy — arguably the single most valuable regime tool in this list.\n\n" +
        "**Retracement and price structure (where supply and demand sit)**\n" +
        "- **Fibonacci Retracement** — horizontal levels (23.6 / 38.2 / 50 / 61.8 / 78.6 %) between swing high and low. The 50 % and 61.8 % levels (the 'golden zone') are the most watched. Works through self-fulfilling reaction, not a formula — treat as a magnet, pair with a trigger.\n" +
        "- **Support/Resistance Levels (auto S/R)** — horizontal levels clustered from fractal swing pivots, ranked by touch count and recency. The most-touched levels act as genuine supply/demand zones; flip-zones (prior resistance become support) are particularly fertile at retest.\n" +
        "- **Pivot Points** — floor-trader PP / R1–R3 / S1–S3 derived from the prior period's high/low/close. Classic, Fibonacci, and Camarilla variants. A clean close above PP = bullish day bias; below = bearish. Intraday and futures desks anchor stops here.\n" +
        "- **Volume Profile** — horizontal distribution of traded volume across price. POC, VAH, VAL act as magnets and decision levels; low-volume nodes produce fast transit moves. Orthogonal to time-series volume — answers *where* activity happened, not *when*.\n" +
        "- **Order Block** — the last opposite-colour candle before an impulsive move. Unmitigated OBs retain their edge on retest; mitigated ones have paid out. Stack with a sweep or an FVG inside the zone for highest-quality re-entries.\n" +
        "- **Fair Value Gap (FVG)** — three-bar imbalance where bars i-2 and i do not overlap. Unfilled gaps act as magnets and often pause / support the next leg. Pair with S/R or an OB for confluence.\n" +
        "- **Liquidity Sweep** — detects stop-hunt bars that briefly pierce a prior N-bar high/low and close back inside. Among the tightest risk definitions available — stop just beyond the sweep wick — especially strong at session highs/lows or prior-day extremes.",
    },
    {
      id: "fundamentals",
      title: "7. Company fundamentals",
      body:
        "TA tells you **when**; fundamentals tell you **what**. Ignore either at your peril.\n\n" +
        "- **Strong fundamentals + TA weakness = accumulation opportunity.** A high-quality company pulling back to major support with oversold signals is the textbook long.\n" +
        "- **Weak fundamentals + TA strength = suspicious.** Short squeezes, meme runs, and sector rotations can lift junk — but reversion tends to be violent. Reduce size and tighten stops.\n" +
        "- **Earnings-season rules**: reduce size or flatten before reports unless the thesis *is* the earnings surprise. Post-earnings drift (stocks continuing in the report's direction for 20–60 days) is one of the most documented anomalies in finance.\n" +
        "- **Valuation context** — an RSI-oversold signal on a stock trading at 50× earnings and falling revenue is not the same as one on a stock at 10× with growing cash flow. Cheap + oversold ≫ expensive + oversold.\n" +
        "- **Check the financial-health basics** — debt trend, interest coverage, free cash flow direction, insider transactions, short interest. A TA signal against deteriorating fundamentals is a value trap.",
    },
    {
      id: "news",
      title: "8. News, catalysts and macro",
      body:
        "Price leads news, but news accelerates price.\n\n" +
        "- **Gaps on news** — gap up/down on a real catalyst (earnings, FDA, guidance) usually continues in the gap direction for 1–3 sessions. Don't fade day one.\n" +
        "- **Analyst upgrades/downgrades** — move stocks 2–5% initially, then fade over 2–6 weeks. Not a reason to enter alone.\n" +
        "- **Insider buying > selling** as a signal — clusters of insider purchases at a support level are a high-quality long filter. Insider selling is noisier (taxes, diversification).\n" +
        "- **Macro overrides TA in stress** — FOMC days, CPI prints, and major geopolitical events trump individual chart patterns. Reduce exposure around known calendar risks.\n" +
        "- **Sector and market context** — a bullish stock setup in a falling sector has lower odds. Check the sector ETF and the broad index regime before taking a single-stock signal.\n" +
        "- **News exhaustion** — when a stock stops reacting to good news (or stops falling on bad), the next move tends to be the opposite of the recent trend.",
    },
    {
      id: "risk",
      title: "9. Risk management (the only non-negotiable)",
      body:
        "You don't control price, you control size and stops. Every professional book stresses this more than any indicator.\n\n" +
        "- **Risk ≤ 1–2% of account per trade.** Position size = (account × risk%) ÷ stop distance. This lets you be wrong repeatedly and still be in the game.\n" +
        "- **Stops go where the thesis is wrong** — under a support, under a swing low, or 1–2× ATR away. Not at a round-number dollar amount.\n" +
        "- **R:R ≥ 2:1** — expected reward at least twice the expected risk. A 40% win rate at 2:1 is profitable.\n" +
        "- **Never average down on a losing thesis.** Averaging in to a *plan* (pre-set scaled entries) is different from averaging to avoid admitting you're wrong.\n" +
        "- **Trail stops in the direction of the trend** — Chandelier Exit, Parabolic SAR, or 20-day MA. Take the market out, don't predict the top.\n" +
        "- **Diversify timeframes and sectors** — if three of your positions share one thesis (e.g. long-duration tech), you have one position, not three.",
    },
    {
      id: "psychology",
      title: "10. Psychological pitfalls",
      body:
        "Most losing trades are correctly-spotted setups executed badly.\n\n" +
        "- **Confirmation bias** — you find the one indicator that supports your existing view. Defense: decide the criteria before you look at the chart.\n" +
        "- **FOMO entries** — chasing a bar that already ran. Almost always pays worse than waiting for a pullback to the moving average.\n" +
        "- **Revenge trading** — taking the next trade to recover the last loss. Best response to a loss is a *smaller* next position, not a larger one.\n" +
        "- **Anchoring to the entry price** — once filled, 'I'll sell when it gets back to even' is the worst reason to hold. Your cost basis is not a signal.\n" +
        "- **Overtrading the news** — every hour of CNBC feels like a signal. It isn't. Stick to your timeframe.\n" +
        "- **Journal every trade** — setup, thesis, risk, outcome, lesson. The journal is where edge actually compounds.",
    },
    {
      id: "action-glossary",
      title: "11. Action vocabulary (Analysis › Proposed action)",
      body:
        "The Analysis page shows a *Proposed action* in the top-right of *Latest values*. Each label maps to one of these meanings:\n\n" +
        "- **Buy** — open or add to a **long** position. Indicators agree the bullish edge is intact. You profit if price goes up.\n" +
        "- **Sell** — open or add to a **short** position (a bet that price will fall). Requires a margin account and is not allowed in most retirement accounts. If you can only go long, read this as a warning *not to buy here* rather than an entry.\n" +
        "- **Exit long** — close an existing **long** position. The bullish edge has weakened — take profit or cut the loss. If you don't currently hold the asset, no action is needed.\n" +
        "- **Exit short** — close an existing **short** position by buying back the borrowed shares (\"cover\"). The bearish edge has weakened. If you weren't short, no action.\n" +
        "- **Wait** — no clear edge in either direction. Stand aside. Often the correct answer when signals conflict, the regime is transitioning, or volume is too thin to trust.\n\n" +
        "These are *signal labels*, not orders — confirm the regime, the broader context, and your own position size before acting.",
    },
  ],
  links: [
    { title: "Investopedia — How to Use Technical Analysis", url: "https://www.investopedia.com/articles/trading/04/110304.asp" },
    { title: "Investopedia — Combining Fundamental and Technical Analysis", url: "https://www.investopedia.com/articles/trading/07/tech_fund_analysis.asp" },
    { title: "Investopedia — Position Sizing in Investment", url: "https://www.investopedia.com/terms/p/positionsizing.asp" },
    { title: "Investopedia — Risk/Reward Ratio", url: "https://www.investopedia.com/terms/r/riskrewardratio.asp" },
    { title: "Investopedia — Volume-Weighted Average Price (VWAP)", url: "https://www.investopedia.com/terms/v/vwap.asp" },
    { title: "Investopedia — Fibonacci Retracement Levels", url: "https://www.investopedia.com/terms/f/fibonacciretracement.asp" },
    { title: "Investopedia — Post-Earnings Announcement Drift (PEAD)", url: "https://www.investopedia.com/terms/p/postearnings-announcement-drift-pead.asp" },
    { title: "StockCharts ChartSchool — Trading Strategies", url: "https://chartschool.stockcharts.com/table-of-contents/trading-strategies-and-models" },
    { title: "Fidelity — Combining Fundamentals and Technicals", url: "https://www.fidelity.com/learning-center/trading-investing/technical-analysis/technical-and-fundamental-analysis" },
    { title: "Book — Murphy, Technical Analysis of the Financial Markets", url: "https://www.amazon.com/Technical-Analysis-Financial-Markets-Comprehensive/dp/0735200661" },
    { title: "Book — Elder, Trading for a Living", url: "https://www.amazon.com/Trading-Living-Psychology-Tactics-Management/dp/0471592242" },
    { title: "Book — Pring, Technical Analysis Explained", url: "https://www.amazon.com/Technical-Analysis-Explained-Fifth-Successful/dp/0071825177" },
  ],
};

const FR: BuySellGuide = {
  intro:
    "Les indicateurs techniques ne disent jamais *achetez maintenant* ou *vendez maintenant* — ils décrivent l'état de l'offre et de la demande et font pencher les probabilités. Les signaux ci-dessous sont ceux qu'utilisent réellement la littérature établie (Murphy, Pring, Elder, Wilder, Appel, Bollinger) et les salles de marché modernes. Combinez-en deux ou trois, vérifiez le régime de marché, confirmez avec les fondamentaux, dimensionnez le risque — puis agissez.",
  sections: [
    {
      id: "regime",
      title: "1. Identifier d'abord le régime de marché",
      body:
        "Le **même indicateur change de sens selon le régime**. À vérifier avant de lire n'importe quel signal :\n\n" +
        "- **Marché en tendance** — ADX > 25, bandes de Bollinger qui s'élargissent, prix qui fait de nouveaux sommets (ou creux). Les extrêmes d'oscillateurs (RSI > 70, Stoch > 80) peuvent rester collés des semaines — ne les fadez pas. Privilégiez les croisements de moyennes mobiles, le MACD et les replis sur le support de tendance.\n" +
        "- **Marché sans tendance (range)** — ADX < 20, bandes de Bollinger qui se resserrent, prix qui oscille entre support et résistance. C'est là que les oscillateurs brillent : achetez survendu près du support, vendez suracheté près de la résistance. Évitez les signaux de suivi de tendance (faux signaux).\n" +
        "- **Transition / squeeze** — largeur des bandes de Bollinger au plus bas de plusieurs mois : cassure imminente, mais direction inconnue. Attendez la première bougie forte + volume pour confirmer le côté.",
    },
    {
      id: "long-short",
      title: "2. Long vs short — les deux côtés d'un trade",
      body:
        "Tout signal technique n'a de sens que *par rapport au côté sur lequel vous êtes*. Avant de lire n'importe quelle règle d'achat/vente, comprenez ce que signifient vraiment long et short.\n\n" +
        "**Long — parier sur la hausse**\n" +
        "- Vous **possédez** l'actif (ou un contrat d'achat). Vous gagnez quand le prix **monte**.\n" +
        "- Acheter 100 actions à 150 $, revendre à 180 $ → +30 $/action.\n" +
        "- **Perte max** : le prix ne peut descendre qu'à 0, donc la perte est plafonnée à ce que vous avez payé.\n" +
        "- **Gain max** : théoriquement illimité — le prix peut monter sans fin.\n" +
        "- « Être long » = acheter. « Clore un long » = vendre ce que vous possédez.\n\n" +
        "**Short — parier sur la baisse**\n" +
        "- Vous **vendez un actif que vous ne possédez pas**, en pariant sur une baisse. Mécaniquement : votre courtier vous prête les actions, vous les vendez au prix du jour, puis plus tard vous les **rachetez** (« couverture » / « cover ») et les rendez.\n" +
        "- Short 100 actions à 180 $, le prix tombe à 150 $, rachat → +30 $/action.\n" +
        "- **Gain max** : plafonné — le prix ne peut descendre qu'à 0.\n" +
        "- **Perte max** : *théoriquement illimitée* — le prix peut monter sans fin et il faudra racheter à n'importe quel cours.\n" +
        "- Coûts et risques additionnels : frais d'emprunt, exigences de marge, et possibilité d'un **rachat forcé (buy-in)** si le prêteur rappelle les titres.\n\n" +
        "**Comment l'évaluateur de signaux de la plateforme se connecte à tout ça**\n" +
        "- `buy` → ouvrir ou renforcer un **long** (prix attendu à la hausse).\n" +
        "- `sell` → ouvrir ou renforcer un **short** (prix attendu à la baisse).\n" +
        "- `exitLong` → clore un long existant (prise de profit ou coupe de perte sur une position haussière).\n" +
        "- `exitShort` → clore un short existant (racheter les actions empruntées).\n" +
        "- `wait` → pas d'edge ; rester à l'écart.\n\n" +
        "**Pourquoi cette distinction change la lecture des indicateurs**\n" +
        "La même lecture peut vouloir dire l'inverse selon le côté sur lequel vous êtes. RSI à 75 est un *avertissement pour les détenteurs longs* (suracheté — envisager d'alléger) mais une *entrée potentielle pour les shorts* dans un setup de mean reversion. L'évaluateur choisit d'abord un côté (direction de tendance, ADX, structure) avant de décider si « suracheté » veut dire « alléger les longs » ou « chercher un short ».\n\n" +
        "**Note pratique pour l'investisseur particulier**\n" +
        "La plupart des comptes au comptant du courtage retail n'autorisent que le **long**. Le short nécessite un **compte sur marge**, comporte un risque théoriquement illimité, et n'est généralement pas permis dans les comptes de retraite (REER, CELI, 401(k), IRA). Si vous ne pouvez pas shorter, traitez les signaux `sell` et `exitShort` comme des avertissements *ne-pas-acheter-ici* plutôt que comme des entrées exécutables — et concentrez-vous sur `buy` / `exitLong` / `wait` pour votre propre portefeuille.",
    },
    {
      id: "entry",
      title: "3. Signaux d'achat (entrées longues)",
      body:
        "Les meilleures entrées longues partagent un principe de **confluence** — plusieurs signaux indépendants qui s'accordent au même prix.\n\n" +
        "- **Survente + bougie de retournement sur support** — RSI < 30 (ou Williams %R < −80, Stoch < 20) ET bougie haussière (marteau, englobante) ET support horizontal ou MM200. Setup classique de swing trading.\n" +
        "- **Divergence haussière** — prix fait un creux plus bas, oscillateur (RSI, MACD) fait un creux plus haut. Plus fort quand il se forme sur un support majeur.\n" +
        "- **Cassure avec volume** — clôture au-dessus d'une résistance horizontale ou d'une ligne de tendance descendante, volume ≥ 1,5× la moyenne 20 jours. Attendez la clôture, pas la mèche intrabarre.\n" +
        "- **Repli sur moyenne mobile haussière** — en tendance haussière confirmée (ADX > 25, prix au-dessus de la MM200), un repli sur la MM20 ou MM50 avec stochastique en survente et bougie de retournement est un excellent point de renforcement.\n" +
        "- **Golden cross confirmé** — MM50 passe au-dessus de la MM200 avec ADX qui monte. À ignorer si le croisement survient sur un couple plat — ce n'est pas une tendance.\n" +
        "- **MACD franchit zéro à la hausse** — un croisement MACD haussier est plus fort quand la ligne MACD est sous zéro qu'au-dessus.\n" +
        "- **PSAR qui bascule sous le prix** + ADX qui monte — déclencheur d'entrée en suivi de tendance.\n" +
        "- **Reconquête du VWAP (intraday)** — le prix repasse au-dessus d'un VWAP haussier sur volume après un creux en séance. C'est le déclencheur d'achat institutionnel par excellence : pupitres et algos visent le VWAP à l'exécution, donc une reconquête signifie que les acheteurs surpaient la moyenne pondérée du jour. Un repli qui tient le VWAP en séance haussière est un excellent point de renforcement.\n" +
        "- **Retracement de Fibonacci sur niveau clé** — après une impulsion haussière, les replis vers 38,2 %, 50 % ou 61,8 % (la « zone d'or » 50–61,8 % est la plus surveillée) sont des points d'entrée longs fréquents. L'edge est en grande partie auto-réalisateur : suffisamment de traders discrétionnaires placent des ordres sur ces niveaux pour que les réactions s'y concentrent. Confirmez avec une bougie de retournement ou un oscillateur en survente — le niveau seul n'est pas un déclencheur. Fonctionne mieux sur des instruments liquides et des impulsions nettes en une seule patte.\n" +
        "- **Sweep de liquidité bas + retournement** — le prix perce un plus bas de swing sur N barres, déclenche les stops, puis reclôt dans la fourchette. Signale une offre qui échoue / chasse aux stops. Long à haute probabilité quand le sweep tombe sur un cluster S/R auto, un Order Block haussier non mitigé, ou la Value Area Low. Entrée à la clôture de la bougie de retournement, stop juste sous la mèche du sweep.\n" +
        "- **Retest d'un Order Block haussier non mitigé** — en tendance haussière, le prix se replie sur la dernière bougie baissière précédant une impulsion, réagit et tient. Cette bougie est l'« order block » — empreinte d'accumulation institutionnelle. Entrée sur la bougie haussière de retournement à l'intérieur du bloc, stop sous le bas du bloc. Optimal combiné à un sweep ou un FVG à l'intérieur de la zone.\n" +
        "- **Remplissage + tenue d'un Fair Value Gap haussier** — le prix retrace dans un FVG haussier (déséquilibre 3 barres) et rejette le bord inférieur. Les FVG qui coïncident avec un S/R ou un pivot sont les zones de réaction les plus qualitatives. Confirmez avec une bougie haussière qui clôt au-dessus du bord supérieur du gap.\n" +
        "- **Volume Profile — reconquête du VAL ou du POC** — en régime rotationnel, le prix plonge sous le Value Area Low, le reconquiert sur clôture haussière, puis tient le POC au premier retest. Cible naturelle : le Value Area High. À éviter si ADX > 25 ou si le profil est bimodal — c'est un environnement de tendance / changement de régime, pas de rotation.\n" +
        "- **Réaction au pivot S1 (ou PP) en période haussière** — le prix ouvre au-dessus du PP (biais haussier), repli sur S1 et réaction. PP = ligne de biais intraday / hebdomadaire — biais long au-dessus, short en dessous. Camarilla L3 / Fibonacci S1 sont les variantes plus serrées pour le mean reversion.\n" +
        "- **Cluster S/R auto à nombreuses touches** — l'indicateur S/R auto signale un cluster de support avec beaucoup de touches antérieures ; le prix tag le niveau avec une bougie de rejet haussière. Plus de touches + récence = niveau plus fort. Les flip-zones (résistance cassée devenue support) sont particulièrement fiables au retest.",
    },
    {
      id: "exit",
      title: "4. Signaux de vente (sorties et shorts)",
      body:
        "La sortie est plus difficile que l'entrée. Planifiez-la *avant* d'entrer.\n\n" +
        "- **Suracheté est un avertissement, pas un déclencheur.** Sortez au *retournement* : RSI qui repasse sous 70, MACD qui roule à la baisse, divergence baissière — pas sur le premier suracheté.\n" +
        "- **Divergence baissière sur résistance** — prix fait un sommet plus haut, oscillateur fait un sommet plus bas, dans une zone de vendeurs connus. Fade ou sortie haute probabilité.\n" +
        "- **Cassure du support de tendance** — perte de la MM20 ou MM50 en tendance haussière, surtout sur volume qui s'élargit, est souvent le premier vrai signal de vente.\n" +
        "- **Death cross confirmé** — MM50 sous MM200, ADX qui monte. Signal tardif mais fiable de changement de régime pour les porteurs long terme.\n" +
        "- **MACD croisement baissier au-dessus de zéro** — plus fort quand le MACD est étendu bien au-dessus de zéro puis coupe sa ligne de signal à la baisse.\n" +
        "- **Stop suiveur déclenché** — la sortie la plus sous-estimée. Un stop basé sur l'ATR (p. ex. 2× ATR sous le plus haut récent) laisse courir les gagnants tout en limitant le give-back.\n" +
        "- **Expansion de volatilité sur mauvaise nouvelle** — un mouvement de 3σ sur catalyseur négatif continue souvent 1–3 jours ; ne pas essayer d'attraper le premier rebond.\n" +
        "- **Perte du VWAP par le dessus (intraday)** — le prix a passé la séance au-dessus du VWAP puis casse en dessous sur volume qui grimpe. Signal précoce que le contrôle est passé des acheteurs aux vendeurs ; une tentative ratée de reconquérir le VWAP par le dessous confirme le changement et déclenche souvent une journée de tendance baissière.\n" +
        "- **Rebond Fibonacci raté / cassure du 61,8 %** — le prix retrace sur un niveau Fib (38,2 % ou 50 %), tente de tenir, puis reclôt en dessous sur volume. Une clôture au-delà du 61,8 % de l'impulsion précédente invalide la thèse de retracement — le mouvement n'est plus un repli, c'est un retournement. L'invalidation nette rend les niveaux Fib utiles pour placer les stops, même sans entrer dessus.\n" +
        "- **Sweep de liquidité haut + retournement** — le prix perce un plus haut de swing sur N barres, déclenche les stops, puis reclôt dans la fourchette. Déclencheur short classique et sortie long à haute probabilité. Plus fort aux sommets de séance, plus hauts de la veille, chiffres ronds, ou au bord supérieur d'une Value Area. Stop juste au-dessus de la mèche — l'une des définitions de risque les plus serrées disponibles.\n" +
        "- **Retest d'un Order Block baissier non mitigé** — en tendance baissière, le prix rallye dans la dernière bougie haussière précédant une chute impulsive et rejette. Entrée sur la bougie baissière de retournement à l'intérieur du bloc, stop juste au-dessus du haut. Les blocs déjà touchés (« mitigés ») ont largement épuisé leur edge — à éviter.\n" +
        "- **Rejet sur un FVG baissier** — en tendance baissière, les rallyes dans un Fair Value Gap baissier non rempli rejettent souvent ; une bougie qui pousse dans le gap et reclôt sous le bord inférieur est un déclencheur short. Si le gap se remplit avec acceptation (clôture au-dessus du bord supérieur), la thèse short est invalidée.\n" +
        "- **Volume Profile — rejet au VAH ou perte du POC** — en rotation, le prix s'étire au Value Area High sans acceptation (mèches, pas de clôture de suivi) et retourne vers le POC. Cible POC d'abord, puis VAL en extension. Une clôture sous le POC qui tient fait basculer le biais de séance à la vente et ouvre le VAL comme cible.\n" +
        "- **Cassure du pivot PP avec clôture baissière** — une clôture nette sous le PP fait basculer le biais de la période de haussier à baissier. R1 devient alors le niveau naturel de short sur remontée ; S1/S2 sont les prochaines cibles. Fiable sur les futures d'indices et le Forex majeur où les pivots sont respectés.\n" +
        "- **Cassure d'un cluster S/R auto majeur sur volume** — le cluster de support le plus touché cède sur clôture baissière avec expansion de volume. La flip zone (ancien support devenu résistance) est le short au retest ; cible = prochain cluster plus bas. Les niveaux multi-touches préviennent plus tôt mais le suivi est aussi plus ample quand ils finissent par céder.",
    },
    {
      id: "confirmation",
      title: "5. Confirmation et confluence",
      body:
        "Un seul indicateur qui parle = du bruit. Deux qui s'accordent = un signal. Trois qui s'alignent au même prix = un setup.\n\n" +
        "- **Associez un filtre de tendance et un déclencheur** — p. ex. prix au-dessus de la MM200 (filtre) + croisement haussier MACD (déclencheur). Ignorez les déclencheurs qui vont contre le filtre.\n" +
        "- **Associez oscillateur de momentum et structure de prix** — RSI survendu est bien meilleur sur support qu'en milieu de fourchette.\n" +
        "- **Le volume confirme le prix** — les cassures sans volume échouent souvent. La distribution (prix qui monte, volume qui s'assèche) précède les sommets.\n" +
        "- **Accord multi-horizons** — un signal d'achat journalier aligné avec une tendance haussière hebdomadaire a de bien meilleures chances qu'un signal journalier contre la tendance hebdo.\n" +
        "- **VWAP comme filtre de biais intraday** — trader du même côté du VWAP que votre signal vous aligne avec le consensus pondéré par le volume de la séance (ce que paient les institutions). Aller contre le VWAP avec un setup single-stock est à faible probabilité ; attendez la reconquête ou la cassure avant d'exécuter le déclencheur.\n" +
        "- **Fibonacci comme amplificateur de confluence, pas comme signal autonome** — les retracements Fib (38,2 / 50 / 61,8 %) fonctionnent surtout par auto-réalisation : beaucoup de traders discrétionnaires agissent sur les mêmes niveaux. Traitez-les comme des aimants, pas des déclencheurs. Un niveau Fib qui coïncide avec un support antérieur, la MM200 ou une ligne de tendance est une zone bien plus qualitative qu'un Fib dans le vide. Les modèles quantitatifs purs s'appuient rarement sur les Fibs seuls — utilisez-les pour *affiner* entrées et stops, pas pour remplacer les signaux de tendance ou de momentum.\n" +
        "- **Évitez la confirmation redondante** — RSI, Stoch, Williams %R, StochRSI disent essentiellement la même chose. La confluence, c'est *différentes* familles de signaux (tendance + momentum + volume + structure) qui s'accordent.\n" +
        "- **Les indicateurs de structure forment une famille dédiée** — S/R auto, Pivot Points, Volume Profile, Order Blocks, Fair Value Gaps et Liquidity Sweeps décrivent *où* se trouvent l'offre et la demande, pas *quand* elles agissent. Empiler un niveau de structure (p. ex. Pivot S1 + Order Block haussier + Value Area Low) avec un déclencheur de momentum (RSI survendu + croisement MACD haussier) est la confluence la plus qualitative disponible. Règle : un niveau sans déclencheur = une veille, un déclencheur sans niveau = du bruit, les deux ensemble = un setup.\n" +
        "- **L'état de mitigation / remplissage compte** — les Order Blocks non mitigés et les Fair Value Gaps non remplis conservent leur edge ; ceux qui sont mitigés / remplis ont largement payé et doivent être dépriorisés. De même, un cluster S/R testé de nombreuses fois sans cassure est un niveau plus qualitatif qu'un pivot neuf vu une seule fois.",
    },
    {
      id: "palette",
      title: "6. Palette étendue d'indicateurs",
      body:
        "Au-delà des huit indicateurs cœur (EMA / RSI / MACD / Bollinger / ATR / ADX / OBV / VWAP), Finatalk embarque une trentaine d'alternatives. Chacune entre dans l'une de quelques familles — utilisez-les comme substituts, confirmations ou contexte structurel, pas comme ajouts pour eux-mêmes.\n\n" +
        "**Variantes de moyennes mobiles (compléments / substituts à l'EMA)**\n" +
        "- **SMA (moyenne simple)** — moyenne équipondérée des N dernières clôtures. Le filtre long terme de référence — la SMA 200 jours est la ligne de régime institutionnelle, la 50 jours la ligne de tendance swing. Plus lente que l'EMA, ce qui est justement l'avantage : moins de faux signaux.\n" +
        "- **RMA (moyenne de Wilder)** — le lissage exponentiel que Wilder utilisait à l'intérieur du RSI et de l'ATR (alpha = 1/N). Plus lisse que l'EMA de même période ; utile lorsqu'on veut une réactivité proche de l'EMA sans les pics de bruit.\n" +
        "- **WMA (moyenne pondérée)** — pondérations linéaires donnant le plus de poids à la clôture la plus récente. Se situe entre SMA et EMA — plus rapide que la SMA, plus stable que l'EMA. Les swing traders court terme la privilégient sur les timeframes rapides.\n" +
        "- **DEMA (double EMA)** — EMA à deux passes conçue pour annuler le retard. Épouse le prix de près ; capte plus tôt les changements de tendance au prix de plus de chop en range. Bon choix en suivi de tendance actif lorsqu'on accepte plus de faux signaux.\n\n" +
        "**Alternatives de momentum (substituts / compléments au RSI)**\n" +
        "- **Momentum (MOM)** — brut : `clôture − clôture[N]`. Positif et croissant = accélération ; les franchissements de zéro signalent les changements directionnels. Non borné, donc utile pour les divergences mais pas pour gérer le surachat/survente.\n" +
        "- **Taux de variation (ROC)** — version en pourcentage du Momentum : comparable entre niveaux de prix et entre titres. Les extrêmes sont propres à l'actif — étalonnez sur l'historique de l'instrument, pas un seuil fixe.\n" +
        "- **Oscillateur stochastique** — clôture comparée à la plage haut-bas des N dernières barres. Les croisements %K/%D aux extrêmes (<20 / >80) sont le signal de manuel. Plus rapide que le RSI, mais plus bruyant en tendance.\n" +
        "- **Stochastique RSI** — formule Stoch appliquée au RSI plutôt qu'au prix. Capte des cycles plus courts que le RSI simple ; excellent en range, erratique en tendance. À combiner avec un filtre de régime.\n" +
        "- **Williams %R** — mécaniquement le Stochastic %K sur une échelle inversée −100…0 (>−20 suracheté, <−80 survendu). Redondant avec le Stoch — choisissez l'un, pas les deux.\n\n" +
        "**Bandes et mesures de volatilité (substituts / compléments à Bollinger et à l'ATR)**\n" +
        "- **Keltner Channels** — enveloppe basée sur l'ATR autour d'une EMA. Clôture au-dessus de la bande supérieure = cassure de momentum ; repli sur l'EMA centrale en tendance haussière = renforcement. Moins sujet aux faux squeezes que Bollinger en marché tendance, car l'ATR cale les bandes sur la volatilité *directionnelle*, pas l'écart-type.\n" +
        "- **Donchian Channels** — simplement le plus haut / plus bas des N dernières barres. Clôture au-dessus du Donchian 20 jours = entrée Turtle classique ; clôture sous le plus bas 10 jours = sortie Turtle. La ligne médiane est la moyenne de la plage.\n" +
        "- **Chaikin Volatility** — taux de variation de l'EMA de (haut − bas). ChaikinVol en hausse = plages qui s'élargissent (précède souvent les cassures) ; ChaikinVol en baisse = contraction, résolution de range imminente. Filtre de timing, pas un signal.\n\n" +
        "**Volume / flux de monnaie (substituts et compléments à l'OBV et au VWAP)**\n" +
        "- **Ligne A/D (Accumulation / Distribution)** — volume cumulatif positionné par la clôture. Divergence entre A/D et prix = accumulation (haussier) ou distribution (baissier) institutionnelle silencieuse avant confirmation par le prix. Particulièrement utile aux bords d'un range.\n" +
        "- **Chaikin Money Flow (CMF)** — volume de flux monétaire sur une fenêtre glissante de 20–21 barres. CMF > 0 = accumulation nette, < 0 = distribution nette. La cassure de zéro après une divergence nette = déclencheur de timing.\n" +
        "- **Volume Oscillator** — différence (ou %) entre une MA rapide et une MA lente du volume. En hausse sur la bougie de cassure = vraie participation ; plat ou en baisse = fausse cassure quasi certaine, on s'écarte.\n\n" +
        "**Alternatives de force de tendance (compléments à l'ADX)**\n" +
        "- **Aroon (Up / Down)** — barres depuis le plus haut / plus bas de la fenêtre. Aroon-Up > 70 avec Aroon-Down < 30 = tendance haussière forte ; les croisements Up/Down = changements de tendance ; les deux < 50 = consolidation. Plus intuitif que l'ADX pour repérer le *début* d'une tendance.\n" +
        "- **Vortex (+VI / −VI)** — +VI passant au-dessus de −VI = changement de tendance haussier (miroir inverse) ; écart qui s'élargit = tendance qui se renforce. Plus réactif que l'ADX sur les timeframes moyennes, légèrement plus sujet aux whipsaws.\n" +
        "- **Trend Intensity Index (TII)** — proportion de clôtures au-dessus / en dessous d'une SMA long terme, rescalée 0–100. TII > 80 = tendance haussière propre ; < 20 = baissière propre ; 40–60 = chop. Excellent filtre de régime binaire avant tout autre setup.\n\n" +
        "**Stops de suivi de tendance et croisements**\n" +
        "- **Parabolic SAR (PSAR)** — points de « stop-and-reverse » en suivi de tendance qui basculent sous le prix (tendance haussière) puis au-dessus (baissière). À utiliser comme stop suiveur en tendance confirmée ; erratique en chop — à filtrer par ADX > 20.\n" +
        "- **MA Cross** — trace une MA rapide et une MA lente et marque chaque croisement. Le couple 50/200 SMA produit le Golden Cross (régime haussier) et le Death Cross (baissier). Tardif mais fiable pour les décisions de dimensionnement et de bascule de régime.\n" +
        "- **MACD Cross** — marque chaque franchissement de la ligne de signal MACD sur le graphique. Plus rapide que le MA Cross ; à utiliser sous un filtre de tendance (p. ex. prix au-dessus de la SMA 200) pour éviter le chop.\n\n" +
        "**Indicateurs statistiques / de régime**\n" +
        "- **Bollinger %B** — lecture de Bollinger normalisée (0 à la bande basse, 1 à la haute). %B > 1 ou < 0 = clôture hors des bandes (extension extrême). Les divergences sur %B sont souvent plus propres à repérer que sur le prix brut, car l'indicateur est déjà rescalé.\n" +
        "- **Price Z-Score** — distance standardisée de la clôture à sa moyenne glissante, exprimée en σ. |Z| > 2 = étiré ; |Z| > 3 = extrême statistique. Déclencheur de mean reversion direct, sans normalisation supplémentaire.\n" +
        "- **Exposant de Hurst** — exposant de mémoire longue issu de l'analyse R/S. H > 0,55 = régime de tendance / momentum (privilégier le trend-following) ; H < 0,45 = régime mean-reverting (privilégier les fades) ; ≈ 0,5 = marche aléatoire (pas d'edge AT). À utiliser comme *méta-filtre* avant de choisir la famille d'entrée — sans doute l'outil de régime le plus précieux de cette liste.\n\n" +
        "**Retracements et structure de prix (où sont l'offre et la demande)**\n" +
        "- **Retracement de Fibonacci** — niveaux horizontaux (23,6 / 38,2 / 50 / 61,8 / 78,6 %) entre swing haut et bas. Les niveaux 50 % et 61,8 % (la « zone d'or ») sont les plus surveillés. Fonctionne par réaction auto-réalisatrice, pas par formule — traiter comme un aimant, associer à un déclencheur.\n" +
        "- **Niveaux de support/résistance (S/R auto)** — niveaux horizontaux issus du clustering de pivots fractaux, classés par nombre de touches et fraîcheur. Les niveaux les plus touchés agissent comme de véritables zones d'offre/demande ; les flip-zones (ancienne résistance devenue support) sont particulièrement fertiles au retest.\n" +
        "- **Points pivots** — PP / R1–R3 / S1–S3 de floor trader dérivés du haut/bas/clôture de la période précédente. Variantes classique, Fibonacci et Camarilla. Une clôture nette au-dessus du PP = biais haussier du jour ; en dessous = baissier. Les pupitres intraday et futures y ancrent leurs stops.\n" +
        "- **Profil de volume** — distribution horizontale du volume échangé par niveau de prix. POC, VAH, VAL agissent comme aimants et niveaux de décision ; les LVN favorisent les mouvements rapides. Orthogonal au volume temporel — répond au *où* de l'activité, pas au *quand*.\n" +
        "- **Order Block** — dernière bougie de couleur opposée avant un mouvement impulsif. Les OB non mitigés conservent leur edge au retest ; les mitigés ont déjà payé. À empiler avec un sweep ou un FVG dans la zone pour des ré-entrées de la meilleure qualité.\n" +
        "- **Fair Value Gap (FVG)** — déséquilibre sur trois barres où les barres i-2 et i ne se chevauchent pas. Les gaps non remplis agissent comme aimants et marquent souvent une pause / un support pour le prochain segment. Combinez avec un S/R ou un OB pour la confluence.\n" +
        "- **Sweep de liquidité** — détecte les barres de chasse aux stops qui percent brièvement un plus haut/bas sur N barres puis reclôturent à l'intérieur. Parmi les définitions de risque les plus serrées — stop juste au-delà de la mèche du sweep — particulièrement fort aux extrêmes de séance ou aux extrêmes de la veille.",
    },
    {
      id: "fundamentals",
      title: "7. Fondamentaux de l'entreprise",
      body:
        "L'AT dit **quand** ; les fondamentaux disent **quoi**. Ignorer l'un ou l'autre coûte cher.\n\n" +
        "- **Bons fondamentaux + AT faible = opportunité d'accumulation.** Une entreprise de qualité qui se replie sur un support majeur avec signaux de survente est le long classique.\n" +
        "- **Fondamentaux faibles + AT forte = suspect.** Les short squeezes, mèmes et rotations sectorielles peuvent soulever des titres de piètre qualité — mais le retour à la moyenne est violent. Réduisez la taille, resserrez les stops.\n" +
        "- **Règles en saison des résultats** : réduisez la taille ou fermez avant les rapports, sauf si la thèse *est* la surprise sur les résultats. Le post-earnings drift (le titre continue dans la direction du rapport 20–60 jours) est l'une des anomalies les mieux documentées.\n" +
        "- **Contexte de valorisation** — un RSI survendu sur un titre à 50× les bénéfices avec revenus en baisse n'a rien à voir avec un titre à 10× avec cash-flow en hausse. Bon marché + survendu ≫ cher + survendu.\n" +
        "- **Vérifiez les bases de santé financière** — tendance de la dette, couverture des intérêts, direction du free cash-flow, transactions d'initiés, short interest. Un signal AT contre des fondamentaux qui se détériorent, c'est un piège à valeur.",
    },
    {
      id: "news",
      title: "8. Nouvelles, catalyseurs et macro",
      body:
        "Le prix précède la nouvelle, mais la nouvelle accélère le prix.\n\n" +
        "- **Gaps sur nouvelle** — un gap haussier/baissier sur un vrai catalyseur (résultats, FDA, guidance) continue généralement dans le sens du gap 1–3 séances. Ne pas fader le jour 1.\n" +
        "- **Upgrades/downgrades d'analystes** — bougent les titres de 2–5% initialement, puis s'estompent sur 2–6 semaines. Pas une raison d'entrer seul.\n" +
        "- **Achats d'initiés > ventes** comme signal — des grappes d'achats d'initiés sur un support sont un excellent filtre long. Les ventes sont plus bruyantes (fiscalité, diversification).\n" +
        "- **La macro écrase l'AT en stress** — jours de FOMC, CPI, événements géopolitiques majeurs l'emportent sur les patrons graphiques individuels. Réduisez l'exposition autour des risques de calendrier connus.\n" +
        "- **Contexte sectoriel et marché** — un setup haussier dans un secteur baissier a de moins bonnes chances. Vérifiez l'ETF sectoriel et le régime de l'indice large avant d'exécuter un signal single-stock.\n" +
        "- **Épuisement des nouvelles** — quand un titre cesse de réagir aux bonnes nouvelles (ou cesse de chuter sur les mauvaises), le prochain mouvement va souvent à l'opposé de la tendance récente.",
    },
    {
      id: "risk",
      title: "9. Gestion du risque (non négociable)",
      body:
        "Vous ne contrôlez pas le prix, vous contrôlez la taille et les stops. C'est ce que tout livre professionnel souligne plus que n'importe quel indicateur.\n\n" +
        "- **Risque ≤ 1–2% du compte par trade.** Taille = (compte × risque%) ÷ distance du stop. Cela vous permet de vous tromper à répétition et de rester dans la partie.\n" +
        "- **Le stop va là où la thèse est invalidée** — sous un support, sous un creux, ou à 1–2× ATR. Pas à un montant rond en dollars.\n" +
        "- **R:R ≥ 2:1** — espérance de gain au moins deux fois le risque. Un taux de réussite de 40% à 2:1 est profitable.\n" +
        "- **Ne jamais moyenner à la baisse sur une thèse perdante.** Moyenner selon un *plan* (entrées échelonnées prédéfinies) est différent de moyenner pour ne pas admettre qu'on a tort.\n" +
        "- **Trainez les stops dans le sens de la tendance** — Chandelier Exit, Parabolic SAR, ou MM20. Laissez le marché vous sortir, ne prédisez pas le sommet.\n" +
        "- **Diversifiez horizons et secteurs** — si trois positions partagent une seule thèse (p. ex. tech longue durée), vous avez une seule position, pas trois.",
    },
    {
      id: "psychology",
      title: "10. Pièges psychologiques",
      body:
        "La plupart des trades perdants sont des setups correctement identifiés mais mal exécutés.\n\n" +
        "- **Biais de confirmation** — vous trouvez l'indicateur qui appuie votre opinion. Parade : décidez des critères avant de regarder le graphique.\n" +
        "- **FOMO** — courir après une bougie déjà partie. Attendre un repli sur la moyenne mobile paie presque toujours mieux.\n" +
        "- **Trading de revanche** — prendre le trade suivant pour récupérer la perte. La bonne réponse à une perte est une taille *plus petite*, pas plus grande.\n" +
        "- **Ancrage au prix d'entrée** — une fois servi, « je vendrai quand ça reviendra au break-even » est la pire raison de tenir. Votre prix de revient n'est pas un signal.\n" +
        "- **Sur-trading sur les nouvelles** — chaque heure de CNBC ressemble à un signal. Ça n'en est pas un. Tenez votre horizon.\n" +
        "- **Journal de trades** — setup, thèse, risque, résultat, leçon. C'est là que l'edge se construit vraiment.",
    },
    {
      id: "action-glossary",
      title: "11. Vocabulaire des actions (Analyse › Action proposée)",
      body:
        "La page Analyse affiche une *Action proposée* en haut à droite des *Dernières valeurs*. Chaque libellé correspond à l'une de ces significations :\n\n" +
        "- **Acheter** — ouvrir ou renforcer une position **longue**. Les indicateurs s'accordent sur un biais haussier intact. Vous gagnez si le prix monte.\n" +
        "- **Vendre** — ouvrir ou renforcer une position **courte** (pari sur une baisse du prix). Nécessite un compte sur marge et n'est généralement pas autorisé dans les comptes enregistrés (REER, CELI, 401(k), IRA). Si vous ne pouvez prendre que des positions longues, lisez ce signal comme un avertissement *à ne pas acheter ici* plutôt qu'une entrée.\n" +
        "- **Sortir long** — clôturer une position **longue** existante. Le biais haussier s'est affaibli — encaissez le profit ou coupez la perte. Si vous ne détenez pas l'actif, aucune action requise.\n" +
        "- **Sortir court** — clôturer une position **courte** existante en rachetant les actions empruntées (« couvrir »). Le biais baissier s'est affaibli. Si vous n'étiez pas vendeur à découvert, aucune action.\n" +
        "- **Attendre** — aucun edge clair dans aucune direction. Restez en retrait. Souvent la bonne réponse quand les signaux se contredisent, que le régime de marché est en transition, ou que le volume est trop faible pour être fiable.\n\n" +
        "Ce sont des *libellés de signaux*, pas des ordres — confirmez le régime, le contexte global, et la taille de votre position avant d'agir.",
    },
  ],
  links: [
    { title: "Investopedia — How to Use Technical Analysis (anglais)", url: "https://www.investopedia.com/articles/trading/04/110304.asp" },
    { title: "Investopedia — Combining Fundamental and Technical Analysis (anglais)", url: "https://www.investopedia.com/articles/trading/07/tech_fund_analysis.asp" },
    { title: "Investopedia — Position Sizing (anglais)", url: "https://www.investopedia.com/terms/p/positionsizing.asp" },
    { title: "Investopedia — Ratio risque/rendement (anglais)", url: "https://www.investopedia.com/terms/r/riskrewardratio.asp" },
    { title: "Investopedia — Volume-Weighted Average Price (VWAP) (anglais)", url: "https://www.investopedia.com/terms/v/vwap.asp" },
    { title: "Investopedia — Fibonacci Retracement Levels (anglais)", url: "https://www.investopedia.com/terms/f/fibonacciretracement.asp" },
    { title: "Investopedia — Post-Earnings Announcement Drift (anglais)", url: "https://www.investopedia.com/terms/p/postearnings-announcement-drift-pead.asp" },
    { title: "StockCharts ChartSchool — Trading Strategies (anglais)", url: "https://chartschool.stockcharts.com/table-of-contents/trading-strategies-and-models" },
    { title: "Fidelity — Combining Fundamentals and Technicals (anglais)", url: "https://www.fidelity.com/learning-center/trading-investing/technical-analysis/technical-and-fundamental-analysis" },
    { title: "Livre — Murphy, Technical Analysis of the Financial Markets", url: "https://www.amazon.com/Technical-Analysis-Financial-Markets-Comprehensive/dp/0735200661" },
    { title: "Livre — Elder, Trading for a Living", url: "https://www.amazon.com/Trading-Living-Psychology-Tactics-Management/dp/0471592242" },
    { title: "Livre — Pring, Technical Analysis Explained", url: "https://www.amazon.com/Technical-Analysis-Explained-Fifth-Successful/dp/0071825177" },
  ],
};

export const BUY_SELL_GUIDE: Record<Lang, BuySellGuide> = { en: EN, fr: FR };
