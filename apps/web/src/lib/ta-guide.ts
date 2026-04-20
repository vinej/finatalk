import type { IndicatorKind } from "@/lib/indicator-defaults";
import type { Lang } from "@/lib/lang";

export type TaLink = { title: string; url: string };

export type TaGuideEntry = {
  when: string;
  how: string;
  analyse: string;
  links: TaLink[];
};

export const TA_GENERAL_LINKS: Record<Lang, TaLink[]> = {
  en: [
    {
      title: "Investopedia — Technical Analysis",
      url: "https://www.investopedia.com/terms/t/technicalanalysis.asp",
    },
    {
      title: "StockCharts — ChartSchool",
      url: "https://chartschool.stockcharts.com/table-of-contents",
    },
    {
      title: "Wikipedia — Technical Analysis",
      url: "https://en.wikipedia.org/wiki/Technical_analysis",
    },
  ],
  fr: [
    {
      title: "Investopedia — Analyse technique",
      url: "https://www.investopedia.com/terms/t/technicalanalysis.asp",
    },
    {
      title: "StockCharts — ChartSchool (anglais)",
      url: "https://chartschool.stockcharts.com/table-of-contents",
    },
    {
      title: "Wikipédia — Analyse technique",
      url: "https://fr.wikipedia.org/wiki/Analyse_technique",
    },
  ],
};

const TA_GUIDE_EN: Record<IndicatorKind, TaGuideEntry> = {
  sma: {
    when: "Use a Simple Moving Average to smooth noisy price data and visualize the underlying trend over a fixed window. It's the baseline trend filter most other indicators are compared against.",
    how: "Pick a period that matches your horizon: 20 for swing trading, 50 for medium-term trend, 200 for the long-term institutional trend. Plot it as an overlay on price; the line equally weights every close in the window.",
    analyse: "Price above a rising SMA = uptrend, below a falling SMA = downtrend. Crossovers between two SMAs (e.g. 50/200 'golden' / 'death' cross) are classic regime-shift signals. Because every bar weighs the same, an SMA reacts slowly — late on reversals but resistant to single-bar spikes.",
    links: [
      { title: "Investopedia — Simple Moving Average (SMA)", url: "https://www.investopedia.com/terms/s/sma.asp" },
      { title: "StockCharts — Moving Averages (Simple and Exponential)", url: "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-overlays/moving-averages-simple-and-exponential" },
    ],
  },
  ema: {
    when: "Use an EMA when you want a moving average that reacts faster to recent price action than the SMA — useful for trend-following on shorter timeframes or as the input to oscillators (MACD uses EMAs).",
    how: "Pick a period the same way you would for SMA. The EMA applies exponentially decaying weights, so the most recent close has the largest impact. Common pairings: 12/26 (intraday/swing), 50/200 (longer trend).",
    analyse: "Price crossing the EMA, or two EMAs crossing each other, signals trend changes earlier than the equivalent SMA — at the cost of more whipsaws in choppy markets. Slope of the EMA is itself a momentum read: a flat EMA means trend exhaustion.",
    links: [
      { title: "Investopedia — Exponential Moving Average (EMA)", url: "https://www.investopedia.com/terms/e/ema.asp" },
      { title: "StockCharts — Moving Averages (Simple and Exponential)", url: "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-overlays/moving-averages-simple-and-exponential" },
    ],
  },
  rma: {
    when: "Use Wilder's Running Moving Average when you want EMA-style smoothing that reacts even more slowly — it's the smoothing built into RSI, ATR and ADX. Reach for it when you want to filter out short-term noise without lagging as badly as a long SMA.",
    how: "RMA uses an alpha of 1/N (vs. 2/(N+1) for EMA), so an RMA(14) smooths much more than an EMA(14). Treat the period as roughly equivalent to a 2N-period EMA when comparing.",
    analyse: "Read it like an EMA — slope and price-vs-line crossovers — but expect fewer signals and longer lag. Most useful as a smoother feeding another calculation rather than a standalone signal.",
    links: [
      { title: "Investopedia — Wilder's DMI/ADX (introduces Wilder smoothing)", url: "https://www.investopedia.com/terms/w/wilders-dmi-adx.asp" },
      { title: "Wikipedia — Modified Moving Average", url: "https://en.wikipedia.org/wiki/Moving_average#Modified_moving_average" },
    ],
  },
  wma: {
    when: "Use a Weighted Moving Average when you want a middle ground between SMA and EMA: faster than SMA, smoother than EMA, with linearly decreasing weights instead of exponential decay.",
    how: "Each bar in the window gets a weight equal to its position (most recent = N, oldest = 1), then divided by the sum of weights. Period selection follows the same rules as other MAs.",
    analyse: "Use price-vs-line crossovers and slope just like SMA/EMA. The WMA tends to track price more tightly than SMA but with less choppiness than EMA, which makes it popular for short-term trend filters where lag is the main complaint about SMA.",
    links: [
      { title: "Investopedia — Weighted Average", url: "https://www.investopedia.com/terms/w/weightedaverage.asp" },
      { title: "Wikipedia — Weighted Moving Average", url: "https://en.wikipedia.org/wiki/Moving_average#Weighted_moving_average" },
    ],
  },
  dema: {
    when: "Use the Double Exponential Moving Average when EMA's lag is hurting you — DEMA hugs price more tightly and turns earlier on reversals. Best on liquid, trending instruments where false signals can be tolerated.",
    how: "DEMA = 2·EMA(N) − EMA(EMA(N)). The double-smoothing is mathematically designed to subtract out the EMA's lag. Configure with the same kind of period you'd use for an EMA; results respond noticeably faster.",
    analyse: "Read it the same way as EMA (price/line crossovers, two-DEMA crossovers, slope) but expect earlier entries and earlier exits. The cost of less lag is more sensitivity to noise — pair with a trend filter on choppy markets.",
    links: [
      { title: "Investopedia — Double Exponential Moving Average (DEMA)", url: "https://www.investopedia.com/terms/d/double-exponential-moving-average.asp" },
      { title: "Wikipedia — Double Exponential Moving Average", url: "https://en.wikipedia.org/wiki/Double_exponential_moving_average" },
    ],
  },
  rsi: {
    when: "Use RSI to gauge the strength of a move and to flag when price is stretched. It's the standard tool for spotting overbought/oversold conditions and bullish/bearish divergences.",
    how: "Plotted on its own 0–100 scale, default period 14. Compares the average up-close move to the average down-close move over the window using Wilder's smoothing.",
    analyse: "Classic levels: above 70 = overbought, below 30 = oversold (use 80/20 in strong trends). The most reliable signal is divergence — price makes a new high while RSI doesn't (bearish), or price a new low while RSI doesn't (bullish). Don't fade RSI in a strong trend; it can stay overbought for weeks.",
    links: [
      { title: "Investopedia — Relative Strength Index (RSI)", url: "https://www.investopedia.com/terms/r/rsi.asp" },
      { title: "StockCharts — Relative Strength Index (RSI)", url: "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/relative-strength-index-rsi" },
    ],
  },
  mom: {
    when: "Use Momentum when you want the simplest possible read on directional strength: how much higher (or lower) is price today than N bars ago. Good as a confirmation overlay for trend systems.",
    how: "Computed as `close − close[N]`. Plotted as an oscillator with a zero line; common periods are 10 and 14. Note that the absolute scale depends on the instrument's price.",
    analyse: "Zero-line crossings flag momentum sign changes. The slope and magnitude of Momentum tell you whether a trend is accelerating or losing steam. Divergence vs. price (price up, momentum flattening) often precedes reversals.",
    links: [
      { title: "Investopedia — Momentum Indicator", url: "https://www.investopedia.com/terms/m/momentum.asp" },
      { title: "Wikipedia — Momentum (technical analysis)", url: "https://en.wikipedia.org/wiki/Momentum_(technical_analysis)" },
    ],
  },
  roc: {
    when: "Use Rate of Change when you want Momentum normalized as a percentage — directly comparable across stocks at different price levels and across timeframes.",
    how: "Computed as `(close / close[N] − 1) × 100`. Plotted as an oscillator centered on zero; common periods are 12 and 25. Positive = price is up vs. N bars ago, negative = down.",
    analyse: "Zero-line crossings, divergence with price, and overbought/oversold extremes (instrument-specific — read your own history) are the standard signals. ROC is especially useful for ranking and comparing momentum across a watchlist.",
    links: [
      { title: "Investopedia — Price Rate of Change (ROC)", url: "https://www.investopedia.com/terms/p/pricerateofchange.asp" },
      { title: "StockCharts — Rate of Change (ROC)", url: "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/rate-of-change-roc" },
    ],
  },
  macd: {
    when: "Use MACD when you want a single indicator that combines trend direction, momentum, and entry timing. It's the most widely-watched oscillator after RSI.",
    how: "MACD line = EMA(fast) − EMA(slow). Signal line = EMA(MACD, signal). Histogram = MACD − Signal. Defaults are 12/26/9. Plotted in its own pane below price.",
    analyse: "The three classic signals: (1) signal-line crossovers — MACD crosses above the signal = buy, below = sell; (2) zero-line crossovers — MACD above zero = bullish trend, below = bearish; (3) divergence — price makes a new extreme but MACD doesn't, often a reversal warning. The histogram visualizes momentum acceleration: bars growing = trend strengthening.",
    links: [
      { title: "Investopedia — Moving Average Convergence Divergence (MACD)", url: "https://www.investopedia.com/terms/m/macd.asp" },
      { title: "StockCharts — MACD", url: "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/macd-moving-average-convergence-divergence-oscillator" },
    ],
  },
  bbands: {
    when: "Use Bollinger Bands to read volatility and to spot when price is statistically stretched. Especially useful on instruments that oscillate within a range.",
    how: "Middle band = SMA(N), upper/lower bands = middle ± K·stddev(N). Defaults are period 20, stdDev 2. The band width adapts automatically to recent volatility.",
    analyse: "A 'squeeze' (bands narrow, low volatility) often precedes a breakout — direction unknown, but a big move is statistically due. Touches near the upper/lower band flag overextension but aren't reversal signals on their own; combine with RSI or candle pattern. Walking the band (price riding along the upper band) is a strong-trend signature, not an exit.",
    links: [
      { title: "Investopedia — Bollinger Bands", url: "https://www.investopedia.com/terms/b/bollingerbands.asp" },
      { title: "StockCharts — Bollinger Bands", url: "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-overlays/bollinger-bands" },
      { title: "BollingerBands.com — John Bollinger's official site", url: "https://www.bollingerbands.com/" },
    ],
  },
  atr: {
    when: "Use Average True Range when you need to size positions or place stops in a way that respects the instrument's actual volatility. ATR is a volatility gauge, not a direction signal.",
    how: "ATR = Wilder-smoothed average of true range (max of: high−low, |high−prev close|, |low−prev close|) over N periods. Default 14. Plotted in its own pane in the same units as price.",
    analyse: "Rising ATR = volatility expanding (bigger moves, wider stops needed); falling ATR = volatility contracting (tighter market, often preceding breakouts). Typical use: stop = entry − k·ATR (k often 1.5–3). Don't look for buy/sell signals in ATR itself — it's a risk-sizing input.",
    links: [
      { title: "Investopedia — Average True Range (ATR)", url: "https://www.investopedia.com/terms/a/atr.asp" },
      { title: "StockCharts — Average True Range (ATR)", url: "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/average-true-range-atr" },
    ],
  },
  adx: {
    when: "Use ADX to measure how strong a trend is, regardless of direction. It's the best filter for deciding whether trend-following setups (moving-average crossovers, breakouts) are worth trading right now.",
    how: "ADX = smoothed average of DX, where DX combines +DI and −DI (directional movement). Plotted 0–100 in its own pane alongside +DI and −DI. Default 14.",
    analyse: "ADX > 25 = trending market (trade trend-following systems); ADX < 20 = range-bound (fade extremes, avoid breakout entries). +DI above −DI = uptrend; −DI above +DI = downtrend. ADX itself says nothing about direction — only strength. A rising ADX from low levels is often the earliest sign a new trend is starting.",
    links: [
      { title: "Investopedia — Average Directional Index (ADX)", url: "https://www.investopedia.com/terms/a/adx.asp" },
      { title: "StockCharts — ADX", url: "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/average-directional-index-adx" },
    ],
  },
  stoch: {
    when: "Use the Stochastic Oscillator in ranging or cyclical markets to time entries on overbought/oversold extremes. Complements RSI — it catches turns RSI misses on faster timeframes.",
    how: "%K = 100·(close − lowest low N) / (highest high N − lowest low N), smoothed by M periods. %D = SMA(%K, P). Defaults 14/3/3. Plotted 0–100 in its own pane.",
    analyse: "Above 80 = overbought, below 20 = oversold. The classic signal is a %K/%D crossover inside those zones: %K crossing above %D below 20 = buy, %K crossing below %D above 80 = sell. Divergence (price new high, stochastic doesn't) is a strong reversal warning. In a strong trend, Stochastic can stay pinned at extremes — pair with ADX as a trend filter.",
    links: [
      { title: "Investopedia — Stochastic Oscillator", url: "https://www.investopedia.com/terms/s/stochasticoscillator.asp" },
      { title: "StockCharts — Stochastic Oscillator (Fast, Slow, Full)", url: "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/stochastic-oscillator-fast-slow-and-full" },
    ],
  },
  stochRsi: {
    when: "Use Stochastic RSI when plain RSI is too slow to catch short-cycle reversals. It's RSI's sensitivity amplifier — faster signals, more noise.",
    how: "Applies the Stochastic formula to RSI values instead of price: (RSI − lowest RSI N) / (highest RSI N − lowest RSI N). Default period 14. Output is 0–1 (or 0–100 depending on library).",
    analyse: "Treat the extremes like Stochastic — above 0.8 overbought, below 0.2 oversold — but expect more whipsaws. Most useful on ranging markets; in a trend, StochRSI pins at extremes and its signals become unreliable. Combine with plain RSI for divergence or with ADX to filter trends out.",
    links: [
      { title: "Investopedia — Stochastic RSI (StochRSI)", url: "https://www.investopedia.com/terms/s/stochrsi.asp" },
      { title: "StockCharts — StochRSI", url: "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/stochrsi" },
    ],
  },
  williamsR: {
    when: "Use Williams %R as a momentum oscillator when you want a Stochastic-style read on overbought/oversold but without %D smoothing. Popular for short-term reversal trades.",
    how: "%R = −100·(highest high N − close) / (highest high N − lowest low N). Default 14. Plotted on an inverted −100 to 0 scale in its own pane.",
    analyse: "Above −20 = overbought, below −80 = oversold. Moves are mechanically the mirror of Stochastic %K. In strong trends it stays pinned at extremes, so use it with a trend filter (ADX or moving-average slope). Divergence with price often precedes reversals, same as RSI/Stochastic.",
    links: [
      { title: "Investopedia — Williams %R", url: "https://www.investopedia.com/terms/w/williamsr.asp" },
      { title: "StockCharts — Williams %R", url: "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/williams-r" },
    ],
  },
  obv: {
    when: "Use On-Balance Volume to confirm price moves with volume. It's the first stop for spotting whether a breakout or trend is being driven by real buying/selling pressure.",
    how: "Cumulative running total: add today's volume if close went up, subtract if it went down, ignore flat days. No period parameter. Plotted as a line in its own pane — absolute level is arbitrary, only direction and slope matter.",
    analyse: "OBV rising with price = uptrend confirmed; OBV flat or falling while price rises = bearish divergence (distribution). Breakouts accompanied by a sharp OBV acceleration are higher-quality than those on flat OBV. Treat OBV as volume-weighted trend confirmation, not a standalone entry signal.",
    links: [
      { title: "Investopedia — On-Balance Volume (OBV)", url: "https://www.investopedia.com/terms/o/onbalancevolume.asp" },
      { title: "StockCharts — On Balance Volume (OBV)", url: "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/on-balance-volume-obv" },
    ],
  },
  vwap: {
    when: "Use Volume-Weighted Average Price as a fair-price benchmark — it's the line institutional desks and algo execution target when filling large orders. Most useful intraday, but on a daily chart the cumulative VWAP still acts as a long-horizon average cost basis for the range shown.",
    how: "For every bar, accumulate (typical price × volume) and volume, then plot their ratio (typical price = (high + low + close) / 3). No period parameter: the average runs from the first candle of the loaded range. Plotted as an overlay on the price pane.",
    analyse: "Price above VWAP = buyers in control / bullish bias; price below = sellers in control / bearish bias. Pullbacks into VWAP in an uptrend are classic 'value' entries for intraday traders; rejections at VWAP from below confirm distribution. A flat VWAP with price whipping across it = range day, skip directional trades. Pair with volume spikes to read conviction.",
    links: [
      { title: "Investopedia — Volume-Weighted Average Price (VWAP)", url: "https://www.investopedia.com/terms/v/vwap.asp" },
      { title: "StockCharts — VWAP", url: "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/vwap-intraday" },
    ],
  },
  psar: {
    when: "Use Parabolic SAR on clearly trending instruments for a visual trailing stop and trend-direction read. Avoid it in ranging markets — it whipsaws.",
    how: "Dots plotted below price in an uptrend and above price in a downtrend. The gap accelerates (step starts at 0.02, grows by 0.02 up to max 0.2) each bar a new extreme forms, tightening the stop as the trend matures.",
    analyse: "A flip from below to above price = trend reversal signal (and suggested exit of longs); flip from above to below = reverse. Use the dot's price as a hard trailing stop. In choppy markets expect frequent flips with small losses — pair with ADX > 25 to only act on PSAR in genuine trends.",
    links: [
      { title: "Investopedia — Parabolic SAR", url: "https://www.investopedia.com/terms/p/parabolicindicator.asp" },
      { title: "StockCharts — Parabolic SAR", url: "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/parabolic-sar" },
    ],
  },
  maCross: {
    when: "Use the MA Cross to visualise regime shifts between a fast and a slow moving average on the price chart. The classic 50/200 SMA pairing produces the widely-watched Golden Cross (bullish) and Death Cross (bearish) — useful as a long-horizon trend filter. Shorter pairings (e.g. 9/21 EMA) give swing-trading triggers.",
    how: "Pick a fast and a slow period (defaults 50/200) and the MA type (SMA for smoother signals, EMA to react faster). Two lines are drawn on the price pane. Every time the fast line crosses the slow, a bull (↑) or bear (↓) marker is plotted on the candle at that bar.",
    analyse: "Bull markers above rising price suggest a regime change to the upside; bear markers in a down-sloping structure confirm distribution. Crossovers near flat/tangled MAs are low-quality — the wider the separation after the cross, the stronger the signal. Confirm with rising ADX or increasing volume before acting on a cross in isolation.",
    links: [
      { title: "Investopedia — Golden Cross", url: "https://www.investopedia.com/terms/g/goldencross.asp" },
      { title: "Investopedia — Death Cross", url: "https://www.investopedia.com/terms/d/deathcross.asp" },
      { title: "StockCharts — Moving Average Crossovers", url: "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/moving-averages" },
    ],
  },
  macdCross: {
    when: "Use MACD Signal Cross when you want the MACD signal-line crossovers made visually explicit on the chart — each cross gets a dated marker so you can scan reaction speed and false-signal rate at a glance. Best in trending markets.",
    how: "Runs a standard MACD (defaults 12/26/9) and flags every bar where the MACD line crosses its signal line: bull (↑) markers when MACD crosses above signal, bear (↓) when it crosses below. The markers are drawn on the price candles so you can see context immediately.",
    analyse: "Bullish crosses near or below the zero line are higher-quality long entries than ones already stretched above zero; the reverse holds for bearish crosses. Many crosses in a tight cluster = chop — stand aside. Pair with a trend filter (200 SMA, ADX) to reject counter-trend signals.",
    links: [
      { title: "Investopedia — MACD", url: "https://www.investopedia.com/terms/m/macd.asp" },
      { title: "StockCharts — MACD (Moving Average Convergence/Divergence)", url: "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/moving-average-convergence-divergence-macd" },
    ],
  },
  fib: {
    when: "Use Fibonacci Retracement when a clear swing — a visible rally or sell-off — is printed on the chart and you want to project the most-watched pullback zones before the next leg. It is the go-to tool for discretionary swing traders plotting entries on a retracement.",
    how: "The tool takes the highest high and lowest low of the loaded range (or the last N bars if a lookback is set) and draws horizontal lines at 23.6%, 38.2%, 50%, 61.8%, and 78.6% between them. Direction is auto-detected: if the high came after the low, lines project downward as retracements of an uptrend; if the low came last, they project upward as retracements of a downtrend. The 50% line isn't strictly a Fibonacci ratio but is conventionally included.",
    analyse: "Price tagging 38.2% after a strong impulse often holds — it's the 'shallow' retracement typical of trending names. 50%–61.8% is the 'golden pocket' watched by most desks: reactions here are frequent but never guaranteed, so wait for a confirming candle before acting. A clean break below 78.6% in an uptrend retracement usually means the swing is invalidated. Remember: the levels work partly because so many traders watch them — it's more self-fulfilling prophecy than market physics. Always combine with structure, volume, and another signal family.",
    links: [
      { title: "Investopedia — Fibonacci Retracement Levels", url: "https://www.investopedia.com/terms/f/fibonacciretracement.asp" },
      { title: "StockCharts — Fibonacci Retracements", url: "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-overlays/fibonacci-retracements" },
    ],
  },
  keltner: {
    when: "Use Keltner Channels when you want a smoother volatility envelope than Bollinger Bands — ATR-based bands stay stable through noise and are favored for trend-following breakout systems and trailing stops.",
    how: "Plots an EMA(period) in the middle and bands at multiplier × ATR(atrPeriod) above and below. Defaults: EMA 20, ATR 20, multiplier 2. Price riding the upper band = strong uptrend; riding the lower band = strong downtrend. Closes outside the channel often flag trend initiations rather than mean-reversion setups.",
    analyse: "Unlike Bollinger Bands, which widen sharply on outliers, Keltner bands react proportionally to true range — useful when you want the channel to feel the 'average' volatility. Combine with ADX > 20 for breakout confirmation. A typical setup: enter long on a close above the upper band with ADX rising, trail the stop at the middle EMA or lower band. Avoid in sideways markets where price whipsaws between bands.",
    links: [
      { title: "Investopedia — Keltner Channel", url: "https://www.investopedia.com/terms/k/keltnerchannel.asp" },
      { title: "StockCharts — Keltner Channels", url: "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-overlays/keltner-channels" },
    ],
  },
  donchian: {
    when: "Use Donchian Channels when you want the textbook breakout signal — the channel the original Turtle Traders traded. Ideal for trend-following systems and for spotting the rolling N-bar highest high / lowest low at a glance.",
    how: "Upper band = highest high of the last N bars, lower band = lowest low of the last N bars, middle = their average. Default period 20 (Turtle entry) or 55 (longer-term trend). A close above the upper band = long breakout signal; below the lower = short/exit.",
    analyse: "Donchian is as mechanical as it gets — no smoothing, no params beyond period. That's the point: it reflects pure structure. The tradeoff is whipsaws in range-bound markets, so it's paired with a trend filter (ADX, 200-SMA direction) in practical systems. The lower band also doubles as a built-in trailing stop for long positions.",
    links: [
      { title: "Investopedia — Donchian Channels", url: "https://www.investopedia.com/terms/d/donchianchannels.asp" },
      { title: "StockCharts — Donchian Channels", url: "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-overlays/donchian-channels" },
    ],
  },
  chaikinVol: {
    when: "Use Chaikin Volatility when you want to track how quickly the trading range is expanding or contracting — useful for spotting volatility regime shifts, breakout setups, and climax exhaustion moves.",
    how: "Takes an EMA(emaPeriod) of (high − low), then expresses the rate of change versus rocPeriod bars ago as a percentage. Defaults 10/10: Marc Chaikin's original values. Positive values = range is expanding (volatility rising); negative = contracting (calm returning).",
    analyse: "Rising Chaikin Volatility often accompanies the initial phase of a trend or a panic selloff — expect higher ATR, wider candles, and larger intraday swings. Falling values mark consolidation periods where breakout strategies underperform and mean-reversion works better. Use as a regime filter: require Chaikin Vol above zero (or a threshold) before taking breakout signals. Unlike ATR, which is absolute, Chaikin Vol is relative so it's comparable across different assets and price levels.",
    links: [
      { title: "StockCharts — Chaikin Volatility", url: "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/chaikin-volatility" },
      { title: "Investopedia — Chaikin Indicator Overview", url: "https://www.investopedia.com/terms/c/chaikinoscillator.asp" },
    ],
  },
  ad: {
    when: "Use Accumulation/Distribution when you want a volume-weighted read on whether each bar's close location within its range argues for accumulation or distribution. Like OBV but with intra-bar nuance: a close near the high counts fully bullish, a close mid-range is neutral even on heavy volume.",
    how: "For each bar, CLV = ((close − low) − (high − close)) / (high − low), then MFV = CLV × volume, and AD is the running cumulative sum. No parameters. Plotted as a line in its own pane; absolute level is arbitrary, only direction and slope matter.",
    analyse: "AD rising with price = trend confirmed by real buying; AD flat or falling while price rises = bearish divergence (distribution — smart money selling into strength). AD is more refined than OBV because closes inside the range are weighted proportionally rather than binary up/down. The strongest signal is divergence over several weeks; short-term moves are noisy. Use as confirmation for breakouts, not as a standalone entry.",
    links: [
      { title: "Investopedia — Accumulation/Distribution Indicator (A/D)", url: "https://www.investopedia.com/terms/a/accumulationdistribution.asp" },
      { title: "StockCharts — Accumulation/Distribution Line", url: "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/accumulation-distribution-line" },
    ],
  },
  cmf: {
    when: "Use Chaikin Money Flow when you want an oscillator version of A/D that reads money-flow pressure over a rolling window — easier to interpret than a cumulative line because it oscillates around zero with clear buy/sell zones.",
    how: "For each bar, money-flow volume (MFV) = CLV × volume (same as A/D). CMF = sum(MFV, N) / sum(volume, N). Default period 20 (Marc Chaikin's recommendation). Plotted in its own pane around a zero line; bounded approximately between −1 and +1.",
    analyse: "CMF above zero for sustained periods = buying pressure dominates (bullish bias); below zero = selling pressure (bearish). Sharp spikes above +0.25 or below −0.25 are notable but usually mean-revert. Divergence with price is the classic signal: price higher, CMF lower = distribution warning. Combine with a trend filter — CMF in strong trends can stay on one side of zero for months.",
    links: [
      { title: "Investopedia — Chaikin Money Flow (CMF)", url: "https://www.investopedia.com/terms/c/chaikinmoneyflow.asp" },
      { title: "StockCharts — Chaikin Money Flow (CMF)", url: "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/chaikin-money-flow-cmf" },
    ],
  },
  volOsc: {
    when: "Use the Volume Oscillator to spot volume regime shifts — is recent volume accelerating or decelerating versus the longer-term average? Useful for confirming breakouts and filtering low-conviction chop.",
    how: "Computes ((SMA(volume, fast) − SMA(volume, slow)) / SMA(volume, slow)) × 100. Defaults 5/20. Plotted as a line oscillator around zero in its own pane, expressed as a percentage.",
    analyse: "Positive and rising = recent volume is exceeding the baseline (interest growing — breakouts here are higher-quality). Negative = volume drying up (consolidation, breakouts fail more often). Cross above zero alongside a price breakout is a classic confirmation. Divergence matters: price making new highs while the Volume Oscillator is falling flags an unsupported advance likely to reverse.",
    links: [
      { title: "Investopedia — Volume Oscillator (Percentage Volume Oscillator)", url: "https://www.investopedia.com/terms/p/pvo.asp" },
      { title: "Wikipedia — Volume Oscillator", url: "https://en.wikipedia.org/wiki/Volume_analysis" },
    ],
  },
  aroon: {
    when: "Use the Aroon Indicator when you want a clean read on whether a trend is young and healthy or fading. It's especially good at flagging the start of a new trend — the moment one line crosses 50 while the other dives below is often earlier than moving-average crossovers.",
    how: "Two lines bounded 0–100. Aroon Up = ((N − bars since N-period high) / N) × 100; Aroon Down mirrors for N-period low. Default period 25 (Tushar Chande's original). Plotted in its own pane.",
    analyse: "Aroon Up > 70 with Aroon Down < 30 = strong uptrend; the reverse = strong downtrend. When both are below 50 = no trend (consolidation). The crossover of Up over Down (or vice versa) is the primary trade signal; a sustained reading above 70 confirms trend strength. Unlike ADX, Aroon tells you direction as well as strength in a single indicator.",
    links: [
      { title: "Investopedia — Aroon Indicator", url: "https://www.investopedia.com/terms/a/aroon.asp" },
      { title: "StockCharts — Aroon", url: "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/aroon" },
    ],
  },
  vortex: {
    when: "Use the Vortex Indicator when you want a crossover-based trend system inspired by natural vortex patterns. It reacts faster than moving-average crosses and gives explicit bull/bear transitions via VI+ and VI− lines.",
    how: "VM+ = |high − previous low|, VM− = |low − previous high|. Over N periods: VI+ = sum(VM+) / sum(TR), VI− = sum(VM−) / sum(TR). Default period 14 (a 21 or 25 period is used for slower signals). Both lines typically oscillate between roughly 0.7 and 1.3.",
    analyse: "Bullish when VI+ crosses above VI−; bearish on the reverse cross. A widening spread between the two lines = strong trend; a narrowing or entangled pair = weak/ranging market. Combine with ADX to avoid signals in flat conditions, or with volume for breakout confirmation. Works well on daily and weekly charts.",
    links: [
      { title: "Investopedia — Vortex Indicator (VI)", url: "https://www.investopedia.com/terms/v/vortex-indicator-vi.asp" },
      { title: "StockCharts — Vortex Indicator", url: "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/vortex-indicator" },
    ],
  },
  tii: {
    when: "Use the Trend Intensity Index when you want a single bounded oscillator that answers 'is the asset trending or chopping?' — M.H. Pee designed it to quantify how lopsided recent price deviations from a long-term mean have been.",
    how: "Compute SMA(close, majorPeriod), then for each bar measure deviation = close − SMA. Over the last minorPeriod bars (typically majorPeriod / 2) sum the positive deviations (sumPos) and the absolute negative deviations (sumNeg). TII = 100 × sumPos / (sumPos + sumNeg). Defaults 60/30. Plotted 0–100 in its own pane.",
    analyse: "Above 80 = strong uptrend; below 20 = strong downtrend; near 50 = no clear trend (consolidation). Best paired with a directional trend system: only take long entries when TII > 80, shorts when TII < 20. Unlike ADX, TII has clear direction via its position around 50, making it easier to read at a glance.",
    links: [
      { title: "Investopedia — Trend Intensity Index", url: "https://www.investopedia.com/terms/t/trend_intensity_index.asp" },
      { title: "Stocks & Commodities — M.H. Pee's original article", url: "https://store.traders.com/v20c6tii.html" },
    ],
  },
  zscore: {
    when: "Use the price Z-Score when you want a statistically grounded mean-reversion oscillator — it tells you how many standard deviations the current close is from its rolling average, so extremes are directly comparable across assets and timeframes.",
    how: "For each bar, compute SMA(close, N) and the population standard deviation σ of the last N closes, then Z = (close − SMA) / σ. Default period 20. Plotted in its own pane around a zero line; typical bounds ±3.",
    analyse: "|Z| > 2 = statistically stretched (about a 5% tail), |Z| > 3 = extreme. Classic mean-reversion: fade |Z| > 2 back toward zero, exit near the mean. Zero-line crossings can also act as trend confirmations. The method assumes the return distribution is roughly stationary — in a trending market, Z can stay stretched for long periods, so pair with a trend filter (ADX, SMA slope) before fading aggressively.",
    links: [
      { title: "Investopedia — Z-Score", url: "https://www.investopedia.com/terms/z/zscore.asp" },
      { title: "QuantStrat — Mean reversion with Z-scores", url: "https://www.quantstart.com/articles/Basics-of-Statistical-Mean-Reversion-Testing/" },
    ],
  },
  bbPctB: {
    when: "Use Bollinger %B when you want a normalised version of Bollinger Bands — it answers 'where is price inside the bands?' on a clean 0–1 scale, making divergences and reversion setups easier to read than the bands themselves.",
    how: "Compute Bollinger Bands (SMA(period) ± stdDev × σ). Then %B = (close − lower) / (upper − lower). Defaults period 20, stdDev 2. Plotted in its own pane with reference lines at 0 (lower band), 0.5 (middle SMA), and 1 (upper band).",
    analyse: "%B > 1 = price above the upper band (overextension, potential fade or trend-continuation); %B < 0 = below the lower band. Divergence signals work well: price makes a new high but %B makes a lower high = upside exhaustion. In strong trends, %B can hug the 0.8–1+ zone for weeks (don't short into that blindly). Combine with volume or momentum for confirmation.",
    links: [
      { title: "Investopedia — Bollinger %B", url: "https://www.investopedia.com/terms/b/bollinger-bands.asp" },
      { title: "StockCharts — %B Indicator", url: "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/bollinger-band-percent-b-b" },
    ],
  },
  hurst: {
    when: "Use the Hurst Exponent (advanced) to answer a meta-question: what kind of market is this? Trending, mean-reverting, or random? It shapes which strategies are likely to work before you commit capital. Long windows only — Hurst is noisy on short data.",
    how: "For each bar, take the last N log-returns and run a rescaled-range (R/S) analysis across multiple dyadic scales (8, 16, 32, ... up to N/2). For each scale, compute average R/S across non-overlapping chunks. Plot log(R/S) vs log(scale); the slope of the linear regression is the Hurst exponent H. Default lookback 100 (longer = more reliable).",
    analyse: "H > 0.5 = persistent / trending series (momentum strategies have an edge). H < 0.5 = anti-persistent / mean-reverting (fade extremes, pairs trading, Z-score fades work better). H ≈ 0.5 = random walk (neither edge; avoid trading noise). Most equity indices sit around 0.55–0.65 in trending phases, closer to 0.45–0.5 in chop. Use as a regime filter, not a trade signal — values below ~20 bars of data are unreliable.",
    links: [
      { title: "Wikipedia — Hurst exponent", url: "https://en.wikipedia.org/wiki/Hurst_exponent" },
      { title: "QuantStart — Hurst Exponent in Python", url: "https://www.quantstart.com/articles/Basics-of-Statistical-Mean-Reversion-Testing/" },
    ],
  },
};

const TA_GUIDE_FR: Record<IndicatorKind, TaGuideEntry> = {
  sma: {
    when: "Utilisez la SMA pour lisser le bruit et visualiser la tendance sous-jacente sur une fenêtre fixe. C'est le filtre de tendance de référence auquel la plupart des autres indicateurs sont comparés.",
    how: "Choisissez une période adaptée à votre horizon : 20 pour le swing trading, 50 pour la tendance moyen terme, 200 pour la tendance institutionnelle long terme. Tracée en surimpression sur le prix, la ligne pondère également chaque clôture de la fenêtre.",
    analyse: "Prix au-dessus d'une SMA ascendante = tendance haussière, sous une SMA descendante = tendance baissière. Les croisements entre deux SMA (p. ex. 50/200, « Golden Cross » / « Death Cross ») sont des signaux classiques de changement de régime. Comme chaque barre a le même poids, la SMA réagit lentement — en retard sur les retournements, mais résistante aux pics d'une seule barre.",
    links: [
      { title: "Investopedia — Simple Moving Average (SMA)", url: "https://www.investopedia.com/terms/s/sma.asp" },
      { title: "Wikipédia — Simple Moving Average", url: "https://fr.wikipedia.org/wiki/Moyenne_mobile" },
    ],
  },
  ema: {
    when: "Utilisez l'EMA quand vous voulez une moving average qui réagit plus vite que la SMA aux données récentes — utile pour le suivi de tendance court terme ou comme brique d'oscillateurs (le MACD utilise des EMA).",
    how: "Choisissez la période comme pour une SMA. L'EMA applique des poids exponentiellement décroissants, la clôture la plus récente pesant le plus. Paires courantes : 12/26 (intraday/swing), 50/200 (tendance longue).",
    analyse: "Le croisement prix/EMA, ou le croisement entre deux EMA, signale un changement de tendance plus tôt que la SMA équivalente — au prix de plus de faux signaux en marché agité. La pente de l'EMA est en elle-même une lecture de momentum : une EMA plate signale l'essoufflement de la tendance.",
    links: [
      { title: "Investopedia — Exponential Moving Average (EMA)", url: "https://www.investopedia.com/terms/e/ema.asp" },
      { title: "Wikipédia — Exponential Moving Average", url: "https://fr.wikipedia.org/wiki/Moyenne_mobile#Moyenne_mobile_exponentielle" },
    ],
  },
  rma: {
    when: "Utilisez la RMA (Wilder) quand vous voulez un lissage de type EMA qui réagit encore plus lentement — c'est le lissage intégré au RSI, à l'ATR et à l'ADX. Indiquée pour filtrer le bruit sans subir le retard d'une longue SMA.",
    how: "La RMA utilise un alpha de 1/N (contre 2/(N+1) pour l'EMA), donc une RMA(14) lisse beaucoup plus qu'une EMA(14). Pour comparer, considérez la période comme équivalente à environ une EMA de 2N périodes.",
    analyse: "Lisez-la comme une EMA — pente et croisements prix/ligne — mais attendez-vous à moins de signaux et un retard plus long. Surtout utile comme lisseur dans un autre calcul, rarement comme signal autonome.",
    links: [
      { title: "Investopedia — Wilder's DMI/ADX (introduit le lissage de Wilder)", url: "https://www.investopedia.com/terms/w/wilders-dmi-adx.asp" },
      { title: "Wikipédia — Running Moving Average", url: "https://fr.wikipedia.org/wiki/Moyenne_mobile" },
    ],
  },
  wma: {
    when: "Utilisez la WMA comme compromis entre SMA et EMA : plus rapide que la SMA, plus lisse que l'EMA, avec des poids décroissant linéairement au lieu d'une décroissance exponentielle.",
    how: "Chaque barre de la fenêtre reçoit un poids égal à sa position (la plus récente = N, la plus ancienne = 1), divisé par la somme des poids. Le choix de la période suit les mêmes règles que les autres moyennes mobiles.",
    analyse: "Utilisez les croisements prix/ligne et la pente comme pour la SMA ou l'EMA. La WMA suit le prix plus fidèlement que la SMA tout en restant moins hachée que l'EMA, ce qui la rend populaire pour les filtres de tendance courte où le retard est le principal reproche fait à la SMA.",
    links: [
      { title: "Investopedia — Weighted Average", url: "https://www.investopedia.com/terms/w/weightedaverage.asp" },
      { title: "Wikipédia — Weighted Moving Average", url: "https://fr.wikipedia.org/wiki/Moyenne_mobile" },
    ],
  },
  dema: {
    when: "Utilisez la DEMA quand le retard de l'EMA devient pénalisant — la DEMA colle mieux au prix et tourne plus tôt sur les retournements. Idéale sur les instruments liquides et tendanciels où l'on tolère quelques faux signaux.",
    how: "DEMA = 2·EMA(N) − EMA(EMA(N)). Le double lissage est mathématiquement conçu pour annuler le retard de l'EMA. Configurez-la avec le même type de période qu'une EMA ; elle réagit sensiblement plus vite.",
    analyse: "Lisez-la comme une EMA (croisements prix/ligne, croisements de deux DEMA, pente), mais attendez-vous à des entrées et sorties plus précoces. Le prix du retard réduit est une sensibilité accrue au bruit — associez-la à un filtre de tendance en marché agité.",
    links: [
      { title: "Investopedia — Double Exponential Moving Average (DEMA)", url: "https://www.investopedia.com/terms/d/double-exponential-moving-average.asp" },
      { title: "Wikipedia — Double Exponential Moving Average (anglais)", url: "https://en.wikipedia.org/wiki/Double_exponential_moving_average" },
    ],
  },
  rsi: {
    when: "Utilisez le RSI pour jauger la force d'un mouvement et repérer les excès. C'est l'outil standard pour identifier les conditions de surachat/survente et les divergences haussières/baissières.",
    how: "Tracé sur une échelle propre 0–100, période par défaut 14. Compare la moyenne des hausses de clôture à la moyenne des baisses sur la fenêtre via le lissage de Wilder.",
    analyse: "Niveaux classiques : au-dessus de 70 = surachat, sous 30 = survente (utilisez 80/20 en tendance forte). Le signal le plus fiable est la divergence — le prix fait un nouveau sommet sans le RSI (baissière) ou un nouveau creux sans le RSI (haussière). Ne shortez pas un RSI élevé en tendance forte ; il peut rester en surachat plusieurs semaines.",
    links: [
      { title: "Investopedia — Relative Strength Index (RSI)", url: "https://www.investopedia.com/terms/r/rsi.asp" },
      { title: "Wikipédia — Relative Strength Index", url: "https://fr.wikipedia.org/wiki/Indice_de_force_relative" },
    ],
  },
  mom: {
    when: "Utilisez le Momentum pour la lecture la plus simple possible de la force directionnelle : de combien le prix d'aujourd'hui est-il plus haut (ou plus bas) qu'il y a N barres. Pratique comme confirmation dans un système de suivi de tendance.",
    how: "Calculé comme « clôture − clôture[N] ». Tracé en oscillateur autour d'une ligne zéro ; périodes courantes : 10 et 14. L'échelle absolue dépend du niveau de prix de l'instrument.",
    analyse: "Les passages par zéro signalent les changements de signe du momentum. La pente et l'amplitude indiquent si la tendance accélère ou s'essouffle. La divergence avec le prix (prix qui monte, momentum qui s'aplatit) précède souvent les retournements.",
    links: [
      { title: "Investopedia — Momentum Indicator", url: "https://www.investopedia.com/terms/m/momentum.asp" },
      { title: "Wikipedia — Momentum (technical analysis) (anglais)", url: "https://en.wikipedia.org/wiki/Momentum_(technical_analysis)" },
    ],
  },
  roc: {
    when: "Utilisez le Rate of Change (taux de variation) quand vous voulez un Momentum normalisé en pourcentage — directement comparable entre titres à prix différents et entre horizons.",
    how: "Calculé comme « (clôture / clôture[N] − 1) × 100 ». Tracé en oscillateur centré sur zéro ; périodes courantes 12 et 25. Positif = prix en hausse vs N barres, négatif = en baisse.",
    analyse: "Passages par zéro, divergence avec le prix et extrêmes de surachat/survente (propres à l'instrument — lisez votre propre historique) sont les signaux standards. Particulièrement utile pour classer et comparer le momentum sur une liste de titres.",
    links: [
      { title: "Investopedia — Price Rate of Change (ROC)", url: "https://www.investopedia.com/terms/p/pricerateofchange.asp" },
      { title: "StockCharts — Rate of Change (ROC) (anglais)", url: "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/rate-of-change-roc" },
    ],
  },
  macd: {
    when: "Utilisez le MACD quand vous voulez un seul indicateur combinant direction de tendance, momentum et timing d'entrée. C'est l'oscillateur le plus suivi après le RSI.",
    how: "Ligne MACD = EMA(rapide) − EMA(lente). Signal = EMA du MACD. Histogramme = MACD − Signal. Valeurs par défaut 12/26/9. Tracé dans son propre panneau sous le prix.",
    analyse: "Trois signaux classiques : (1) croisements avec la ligne signal — MACD au-dessus du signal = achat, en dessous = vente ; (2) passages par zéro — MACD au-dessus de zéro = tendance haussière, en dessous = baissière ; (3) divergence — le prix fait un nouvel extrême sans le MACD, avertissement de retournement. L'histogramme visualise l'accélération : barres qui grossissent = tendance qui se renforce.",
    links: [
      { title: "Investopedia — Moving Average Convergence Divergence (MACD)", url: "https://www.investopedia.com/terms/m/macd.asp" },
      { title: "Wikipédia — MACD", url: "https://fr.wikipedia.org/wiki/MACD" },
    ],
  },
  bbands: {
    when: "Utilisez les Bollinger Bands pour lire la volatilité et repérer quand le prix est statistiquement tendu. Particulièrement utile sur les instruments qui oscillent dans une fourchette.",
    how: "Bande médiane = SMA(N), bandes haute/basse = médiane ± K·écart-type(N). Valeurs par défaut : période 20, écart-type 2. La largeur des bandes s'adapte automatiquement à la volatilité récente.",
    analyse: "Un « squeeze » (bandes resserrées, faible volatilité) précède souvent une cassure — direction inconnue, mais un grand mouvement est statistiquement dû. Les touches sur les bandes signalent un excès mais ne sont pas des signaux de retournement isolés ; combinez avec le RSI ou un motif de chandelier. « Marcher la bande » (prix qui longe la bande haute) est une signature de tendance forte, pas un signal de sortie.",
    links: [
      { title: "Investopedia — Bollinger Bands", url: "https://www.investopedia.com/terms/b/bollingerbands.asp" },
      { title: "Wikipédia — Bollinger Bands", url: "https://fr.wikipedia.org/wiki/Bandes_de_Bollinger" },
      { title: "BollingerBands.com — site officiel de John Bollinger", url: "https://www.bollingerbands.com/" },
    ],
  },
  atr: {
    when: "Utilisez l'Average True Range quand vous devez dimensionner des positions ou placer des stops en respectant la volatilité réelle de l'instrument. L'ATR mesure la volatilité, pas la direction.",
    how: "ATR = moyenne lissée par Wilder du « true range » (max de : haut−bas, |haut−clôture préc.|, |bas−clôture préc.|) sur N périodes. Défaut 14. Tracé dans un panneau dédié, dans la même unité que le prix.",
    analyse: "ATR qui monte = volatilité qui s'étend (mouvements plus grands, stops plus larges) ; ATR qui baisse = volatilité qui se contracte (marché plus calme, précédant souvent une cassure). Usage typique : stop = entrée − k·ATR (k souvent entre 1,5 et 3). Ne cherchez pas de signaux d'achat/vente dans l'ATR — c'est un paramètre de dimensionnement du risque.",
    links: [
      { title: "Investopedia — Average True Range (ATR)", url: "https://www.investopedia.com/terms/a/atr.asp" },
      { title: "Wikipédia — Average True Range", url: "https://fr.wikipedia.org/wiki/Average_True_Range" },
    ],
  },
  adx: {
    when: "Utilisez l'ADX pour mesurer la force d'une tendance, indépendamment de sa direction. C'est le meilleur filtre pour décider si un système de suivi de tendance (croisements, cassures) vaut la peine d'être joué maintenant.",
    how: "ADX = moyenne lissée du DX, où le DX combine +DI et −DI (mouvements directionnels). Tracé sur 0–100 dans un panneau dédié, avec +DI et −DI. Défaut 14.",
    analyse: "ADX > 25 = marché tendanciel (jouer les systèmes de tendance) ; ADX < 20 = marché en range (jouer les extrêmes, éviter les cassures). +DI au-dessus de −DI = tendance haussière ; −DI au-dessus de +DI = baissière. L'ADX seul ne dit rien de la direction — uniquement de la force. Un ADX qui monte depuis un niveau bas est souvent le premier signe d'une nouvelle tendance.",
    links: [
      { title: "Investopedia — Average Directional Index (ADX)", url: "https://www.investopedia.com/terms/a/adx.asp" },
      { title: "Wikipédia — Directional Movement Index", url: "https://fr.wikipedia.org/wiki/Directional_Movement_Index" },
    ],
  },
  stoch: {
    when: "Utilisez le Stochastic Oscillator dans les marchés en range ou cycliques pour chronométrer les entrées sur les extrêmes de surachat/survente. Il complète le RSI — il capte des retournements que le RSI rate sur les courts horizons.",
    how: "%K = 100·(clôture − plus bas N) / (plus haut N − plus bas N), lissé sur M périodes. %D = SMA(%K, P). Valeurs par défaut 14/3/3. Tracé sur 0–100 dans son panneau.",
    analyse: "Au-dessus de 80 = surachat, sous 20 = survente. Le signal classique est un croisement %K/%D dans ces zones : %K qui coupe %D en dessous de 20 = achat, %K qui coupe %D au-dessus de 80 = vente. La divergence (prix nouveau sommet, Stochastic non) est un avertissement fort de retournement. En tendance forte, le Stochastic peut rester collé aux extrêmes — combinez avec l'ADX comme filtre de tendance.",
    links: [
      { title: "Investopedia — Stochastic Oscillator", url: "https://www.investopedia.com/terms/s/stochasticoscillator.asp" },
      { title: "Wikipédia — Stochastic Oscillator", url: "https://fr.wikipedia.org/wiki/Oscillateur_stochastique" },
    ],
  },
  stochRsi: {
    when: "Utilisez le Stochastic RSI quand le RSI classique est trop lent pour capter les retournements à cycle court. C'est l'amplificateur de sensibilité du RSI — plus rapide, plus bruité.",
    how: "Applique la formule du Stochastic aux valeurs du RSI au lieu du prix : (RSI − plus bas RSI N) / (plus haut RSI N − plus bas RSI N). Période par défaut 14. Sortie sur 0–1 (ou 0–100 selon la bibliothèque).",
    analyse: "Traitez les extrêmes comme le Stochastic — au-dessus de 0,8 surachat, sous 0,2 survente — mais attendez-vous à plus de faux signaux. Surtout utile en range ; en tendance, le StochRSI se colle aux extrêmes et devient peu fiable. Associez-le au RSI pour les divergences ou à l'ADX pour filtrer les tendances.",
    links: [
      { title: "Investopedia — Stochastic RSI (StochRSI)", url: "https://www.investopedia.com/terms/s/stochrsi.asp" },
      { title: "StockCharts — StochRSI (anglais)", url: "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/stochrsi" },
    ],
  },
  williamsR: {
    when: "Utilisez le Williams %R comme oscillateur de momentum quand vous voulez une lecture surachat/survente de type Stochastic, sans lissage %D. Populaire pour les retournements courts.",
    how: "%R = −100·(plus haut N − clôture) / (plus haut N − plus bas N). Défaut 14. Tracé sur une échelle inversée −100 à 0 dans un panneau dédié.",
    analyse: "Au-dessus de −20 = surachat, sous −80 = survente. Les mouvements sont mécaniquement le miroir du Stochastic %K. En tendance forte il reste collé aux extrêmes, donc utilisez-le avec un filtre de tendance (ADX ou pente d'une moving average). La divergence avec le prix précède souvent les retournements, comme le RSI ou le Stochastic.",
    links: [
      { title: "Investopedia — Williams %R", url: "https://www.investopedia.com/terms/w/williamsr.asp" },
      { title: "StockCharts — Williams %R (anglais)", url: "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/williams-r" },
    ],
  },
  obv: {
    when: "Utilisez le On-Balance Volume pour confirmer les mouvements de prix par le volume. C'est le premier arrêt pour vérifier qu'une cassure ou une tendance est portée par une vraie pression acheteuse/vendeuse.",
    how: "Cumul glissant : ajoute le volume du jour si la clôture monte, le soustrait si elle baisse, ignore les journées plates. Pas de paramètre de période. Tracé en ligne dans un panneau — le niveau absolu est arbitraire, seule la direction et la pente comptent.",
    analyse: "OBV qui monte avec le prix = tendance haussière confirmée ; OBV plat ou en baisse alors que le prix monte = divergence baissière (distribution). Les cassures accompagnées d'une accélération franche de l'OBV sont de meilleure qualité que celles sur OBV plat. Traitez l'OBV comme une confirmation pondérée par le volume, pas un signal d'entrée autonome.",
    links: [
      { title: "Investopedia — On-Balance Volume (OBV)", url: "https://www.investopedia.com/terms/o/onbalancevolume.asp" },
      { title: "Wikipédia — On Balance Volume", url: "https://fr.wikipedia.org/wiki/On_Balance_Volume" },
    ],
  },
  vwap: {
    when: "Utilisez le VWAP (cours moyen pondéré par le volume) comme référence de « juste prix » — c'est la ligne que visent les pupitres institutionnels et les algos d'exécution quand ils font passer de gros ordres. Surtout utile en intraday, mais sur un graphique journalier le VWAP cumulé reste un bon prix de revient moyen de la plage affichée.",
    how: "Pour chaque bougie, on accumule (prix typique × volume) et le volume, puis on trace le rapport (prix typique = (haut + bas + clôture) / 3). Pas de paramètre de période : la moyenne démarre à la première bougie de la plage chargée. Tracé en superposition sur le panneau des prix.",
    analyse: "Prix au-dessus du VWAP = acheteurs aux commandes / biais haussier ; prix en dessous = vendeurs aux commandes / biais baissier. Les replis vers le VWAP en tendance haussière sont des points d'entrée « value » classiques pour les intraday traders ; un rejet au VWAP par le dessous confirme la distribution. Un VWAP plat que le prix traverse dans les deux sens = séance en range, évitez les trades directionnels. Combinez avec les pics de volume pour lire la conviction.",
    links: [
      { title: "Investopedia — Volume-Weighted Average Price (VWAP)", url: "https://www.investopedia.com/terms/v/vwap.asp" },
      { title: "StockCharts — VWAP (anglais)", url: "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/vwap-intraday" },
    ],
  },
  psar: {
    when: "Utilisez le Parabolic SAR sur des instruments clairement tendanciels pour un stop suiveur visuel et une lecture de direction. À éviter en marché en range — il fait trop d'allers-retours.",
    how: "Points tracés sous le prix en tendance haussière et au-dessus en tendance baissière. L'écart accélère (pas initial 0,02, augmente de 0,02 jusqu'à un max de 0,2) à chaque nouvel extrême, resserrant le stop à mesure que la tendance mûrit.",
    analyse: "Un basculement du dessous vers le dessus du prix = signal de retournement (et sortie suggérée des positions longues) ; du dessus vers le dessous = inverse. Utilisez le niveau du point comme stop suiveur ferme. En marché haché, attendez-vous à des bascules fréquentes avec petites pertes — combinez avec ADX > 25 pour n'agir sur le PSAR qu'en vraies tendances.",
    links: [
      { title: "Investopedia — Parabolic SAR", url: "https://www.investopedia.com/terms/p/parabolicindicator.asp" },
      { title: "StockCharts — Parabolic SAR (anglais)", url: "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/parabolic-sar" },
    ],
  },
  maCross: {
    when: "Utilisez le MA Cross pour visualiser les changements de régime entre une moving average rapide et une lente sur le graphique. La paire classique SMA 50/200 produit le fameux Golden Cross (haussier) et le Death Cross (baissier) — utile comme filtre de tendance long terme. Des paires courtes (p. ex. EMA 9/21) fournissent des déclencheurs de swing trading.",
    how: "Choisissez une période rapide et une lente (par défaut 50/200) et le type (SMA pour des signaux plus lisses, EMA pour réagir plus vite). Deux lignes sont tracées sur le panneau de prix. À chaque croisement, un marqueur haussier (↑) ou baissier (↓) est posé sur la bougie correspondante.",
    analyse: "Des marqueurs haussiers au-dessus d'un prix ascendant suggèrent un changement de régime à la hausse ; des marqueurs baissiers dans une structure descendante confirment la distribution. Les croisements près de moving averages plates ou enchevêtrées sont de faible qualité — plus l'écart s'élargit après le croisement, plus le signal est fort. Confirmez par un ADX qui monte ou un volume qui augmente avant d'agir sur un croisement isolé.",
    links: [
      { title: "Investopedia — Golden Cross", url: "https://www.investopedia.com/terms/g/goldencross.asp" },
      { title: "Investopedia — Death Cross", url: "https://www.investopedia.com/terms/d/deathcross.asp" },
      { title: "StockCharts — Moving Average Crossovers (anglais)", url: "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/moving-averages" },
    ],
  },
  macdCross: {
    when: "Utilisez le MACD Signal Cross quand vous voulez visualiser explicitement chaque croisement ligne/signal du MACD — chaque croisement reçoit un marqueur daté, ce qui facilite l'évaluation de la réactivité et du taux de faux signaux. À privilégier en marché tendanciel.",
    how: "Exécute un MACD standard (par défaut 12/26/9) et marque chaque barre où la ligne MACD coupe sa ligne signal : marqueurs haussiers (↑) quand la ligne MACD passe au-dessus, baissiers (↓) quand elle passe en dessous. Les marqueurs sont posés sur les bougies pour visualiser immédiatement le contexte.",
    analyse: "Les croisements haussiers près ou sous la ligne zéro donnent de meilleures entrées longues que ceux déjà très au-dessus ; l'inverse vaut pour les croisements baissiers. De nombreux croisements rapprochés = bruit, restez à l'écart. Associez à un filtre de tendance (SMA 200, ADX) pour rejeter les signaux à contre-tendance.",
    links: [
      { title: "Investopedia — MACD", url: "https://www.investopedia.com/terms/m/macd.asp" },
      { title: "Wikipédia — MACD", url: "https://fr.wikipedia.org/wiki/MACD" },
    ],
  },
  fib: {
    when: "Utilisez le retracement de Fibonacci quand un swing clair — un rallye ou une chute visibles — apparaît sur le graphique et que vous voulez projeter les zones de repli les plus surveillées avant la prochaine jambe. C'est l'outil de référence des swing traders discrétionnaires pour placer des entrées sur retracement.",
    how: "L'outil prend le plus haut et le plus bas de la plage chargée (ou des N dernières barres si un lookback est défini) et trace des lignes horizontales à 23,6 %, 38,2 %, 50 %, 61,8 % et 78,6 % entre les deux. La direction est détectée automatiquement : si le plus haut arrive après le plus bas, les lignes projettent un retracement d'une tendance haussière ; si le plus bas est postérieur, elles projettent un retracement d'une tendance baissière. Le niveau 50 % n'est pas strictement un ratio de Fibonacci mais est inclus par convention.",
    analyse: "Un prix qui touche 38,2 % après une impulsion forte tient souvent — c'est le repli « peu profond » typique des titres en tendance. La zone 50 %–61,8 % est la « golden pocket » surveillée par la majorité des pupitres : les réactions y sont fréquentes mais jamais garanties, attendez une bougie de confirmation avant d'exécuter. Une cassure nette sous 78,6 % en retracement haussier invalide généralement le swing. Rappel : les niveaux fonctionnent en partie parce que beaucoup de traders les surveillent — c'est davantage une prophétie auto-réalisatrice qu'une loi du marché. Combinez toujours avec la structure, le volume et une autre famille de signaux.",
    links: [
      { title: "Investopedia — Fibonacci Retracement Levels (anglais)", url: "https://www.investopedia.com/terms/f/fibonacciretracement.asp" },
      { title: "Wikipédia — Retracements de Fibonacci", url: "https://fr.wikipedia.org/wiki/Retracement_de_Fibonacci" },
    ],
  },
  keltner: {
    when: "Utilisez les canaux de Keltner quand vous voulez une enveloppe de volatilité plus lisse que les bandes de Bollinger — les bandes basées sur l'ATR restent stables malgré le bruit et sont privilégiées pour les systèmes de cassure en suivi de tendance et les stops suiveurs.",
    how: "Trace une EMA(période) au centre et des bandes à multiplicateur × ATR(atrPériode) au-dessus et en dessous. Défauts : EMA 20, ATR 20, multiplicateur 2. Un prix longeant la bande supérieure = forte tendance haussière ; longeant la bande inférieure = forte tendance baissière. Les clôtures hors du canal signalent souvent un démarrage de tendance plutôt qu'un retour à la moyenne.",
    analyse: "Contrairement aux bandes de Bollinger qui s'élargissent brusquement sur les valeurs aberrantes, les canaux de Keltner réagissent proportionnellement au true range — utile quand on veut ressentir la volatilité « moyenne ». À combiner avec ADX > 20 pour confirmer une cassure. Setup typique : entrée à l'achat sur clôture au-dessus de la bande supérieure avec ADX en hausse, stop suiveur à l'EMA centrale ou à la bande inférieure. À éviter en marché latéral où le prix fait du yoyo entre les bandes.",
    links: [
      { title: "Investopedia — Keltner Channel (anglais)", url: "https://www.investopedia.com/terms/k/keltnerchannel.asp" },
      { title: "Wikipédia — Keltner Channel (anglais)", url: "https://en.wikipedia.org/wiki/Keltner_channel" },
    ],
  },
  donchian: {
    when: "Utilisez les canaux de Donchian quand vous voulez le signal de cassure par excellence — celui des Turtle Traders originels. Idéal pour les systèmes en suivi de tendance et pour repérer d'un coup d'œil le plus haut/plus bas glissant sur N barres.",
    how: "Bande supérieure = plus haut des N dernières barres, bande inférieure = plus bas des N dernières, centre = leur moyenne. Défaut : période 20 (entrée Turtle) ou 55 (tendance plus longue). Une clôture au-dessus de la bande supérieure = signal d'achat en cassure ; sous la bande inférieure = vente/sortie.",
    analyse: "Donchian est aussi mécanique que possible — aucun lissage, aucun paramètre au-delà de la période. C'est le but : il reflète la structure pure. Le revers : beaucoup de faux signaux en marché en range, d'où l'association avec un filtre de tendance (ADX, direction de la SMA 200) en conditions réelles. La bande inférieure sert aussi de stop suiveur intégré pour les positions longues.",
    links: [
      { title: "Investopedia — Donchian Channels (anglais)", url: "https://www.investopedia.com/terms/d/donchianchannels.asp" },
      { title: "Wikipédia — Donchian channel (anglais)", url: "https://en.wikipedia.org/wiki/Donchian_channel" },
    ],
  },
  chaikinVol: {
    when: "Utilisez la volatilité de Chaikin quand vous voulez suivre à quelle vitesse la plage de trading s'étend ou se contracte — utile pour repérer les changements de régime de volatilité, les setups de cassure et les mouvements d'épuisement en climax.",
    how: "Prend une EMA(emaPériode) de (haut − bas), puis exprime le taux de variation par rapport à rocPériode barres en arrière en pourcentage. Défauts 10/10 : les valeurs originales de Marc Chaikin. Valeurs positives = plage en expansion (volatilité en hausse) ; négatives = en contraction (retour au calme).",
    analyse: "Une volatilité de Chaikin en hausse accompagne souvent la phase initiale d'une tendance ou une vente panique — attendez-vous à un ATR plus élevé, des bougies plus larges et des amplitudes intraday plus grandes. Des valeurs en baisse marquent des périodes de consolidation où les stratégies de cassure sous-performent et le retour à la moyenne fonctionne mieux. À utiliser comme filtre de régime : exigez Chaikin Vol au-dessus de zéro (ou d'un seuil) avant de prendre des signaux de cassure. Contrairement à l'ATR qui est absolu, Chaikin Vol est relatif et donc comparable entre actifs et niveaux de prix.",
    links: [
      { title: "StockCharts — Chaikin Volatility (anglais)", url: "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/chaikin-volatility" },
      { title: "Investopedia — Chaikin Indicator Overview (anglais)", url: "https://www.investopedia.com/terms/c/chaikinoscillator.asp" },
    ],
  },
  ad: {
    when: "Utilisez la ligne d'Accumulation/Distribution quand vous voulez une lecture pondérée par le volume indiquant si la position de la clôture dans la plage plaide pour une accumulation ou une distribution. Comme l'OBV mais avec la nuance intra-barre : une clôture près du plus haut compte pleinement haussière, une clôture au milieu de la plage est neutre même sur gros volume.",
    how: "Pour chaque barre, CLV = ((clôture − bas) − (haut − clôture)) / (haut − bas), puis MFV = CLV × volume, et AD est le cumul glissant. Sans paramètres. Tracée en ligne dans un panneau dédié ; le niveau absolu est arbitraire, seule la direction et la pente comptent.",
    analyse: "AD en hausse avec le prix = tendance confirmée par un vrai achat ; AD plat ou en baisse alors que le prix monte = divergence baissière (distribution — argent malin vendant dans la force). AD est plus fine que l'OBV car les clôtures dans la plage sont pondérées proportionnellement plutôt qu'en binaire. Le signal le plus fort est la divergence sur plusieurs semaines ; les mouvements court terme sont bruités. Utilisez-la comme confirmation de cassure, pas comme entrée autonome.",
    links: [
      { title: "Investopedia — Accumulation/Distribution Indicator (A/D) (anglais)", url: "https://www.investopedia.com/terms/a/accumulationdistribution.asp" },
      { title: "StockCharts — Accumulation/Distribution Line (anglais)", url: "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/accumulation-distribution-line" },
    ],
  },
  cmf: {
    when: "Utilisez le Chaikin Money Flow quand vous voulez une version oscillante de l'A/D qui lit la pression monétaire sur une fenêtre glissante — plus facile à interpréter que la ligne cumulée car il oscille autour de zéro avec des zones achat/vente claires.",
    how: "Pour chaque barre, le money-flow volume (MFV) = CLV × volume (comme l'A/D). CMF = somme(MFV, N) / somme(volume, N). Période par défaut 20 (recommandation de Marc Chaikin). Tracé dans son panneau autour d'une ligne zéro ; borné approximativement entre −1 et +1.",
    analyse: "CMF au-dessus de zéro sur des périodes prolongées = pression acheteuse dominante (biais haussier) ; en dessous = pression vendeuse (baissier). Les pics au-dessus de +0,25 ou sous −0,25 sont notables mais reviennent généralement à la moyenne. La divergence avec le prix est le signal classique : prix plus haut, CMF plus bas = avertissement de distribution. Combinez avec un filtre de tendance — en tendance forte, le CMF peut rester du même côté de zéro pendant des mois.",
    links: [
      { title: "Investopedia — Chaikin Money Flow (CMF) (anglais)", url: "https://www.investopedia.com/terms/c/chaikinmoneyflow.asp" },
      { title: "StockCharts — Chaikin Money Flow (CMF) (anglais)", url: "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/chaikin-money-flow-cmf" },
    ],
  },
  volOsc: {
    when: "Utilisez l'oscillateur de volume pour repérer les changements de régime de volume — le volume récent accélère-t-il ou ralentit-il par rapport à la moyenne long terme ? Utile pour confirmer les cassures et filtrer les marchés hachés peu convaincants.",
    how: "Calcule ((SMA(volume, rapide) − SMA(volume, lente)) / SMA(volume, lente)) × 100. Défauts 5/20. Tracé comme un oscillateur en ligne autour de zéro dans un panneau dédié, exprimé en pourcentage.",
    analyse: "Positif et en hausse = le volume récent dépasse la moyenne (intérêt croissant — les cassures sont de meilleure qualité ici). Négatif = le volume s'assèche (consolidation, les cassures échouent plus souvent). Un passage au-dessus de zéro en même temps qu'une cassure de prix est une confirmation classique. La divergence compte : un prix qui fait de nouveaux sommets alors que l'oscillateur de volume baisse signale une avancée sans soutien susceptible de se retourner.",
    links: [
      { title: "Investopedia — Volume Oscillator (Percentage Volume Oscillator) (anglais)", url: "https://www.investopedia.com/terms/p/pvo.asp" },
      { title: "Wikipedia — Volume Oscillator (anglais)", url: "https://en.wikipedia.org/wiki/Volume_analysis" },
    ],
  },
  aroon: {
    when: "Utilisez l'indicateur Aroon quand vous voulez une lecture nette pour savoir si une tendance est jeune et saine ou en train de s'essouffler. Il est particulièrement bon pour repérer le début d'une nouvelle tendance — le moment où une ligne croise 50 pendant que l'autre plonge sous ce niveau est souvent plus précoce qu'un croisement de moyennes mobiles.",
    how: "Deux lignes bornées de 0 à 100. Aroon Up = ((N − nombre de barres depuis le plus haut sur N) / N) × 100 ; Aroon Down fait le miroir sur le plus bas sur N. Période par défaut 25 (la valeur originale de Tushar Chande). Tracé dans son panneau dédié.",
    analyse: "Aroon Up > 70 avec Aroon Down < 30 = tendance haussière forte ; l'inverse = tendance baissière forte. Quand les deux sont sous 50 = pas de tendance (consolidation). Le croisement de Up au-dessus de Down (ou vice versa) est le signal de trading principal ; une lecture soutenue au-dessus de 70 confirme la force de la tendance. Contrairement à l'ADX, Aroon donne à la fois la direction et la force dans un seul indicateur.",
    links: [
      { title: "Investopedia — Aroon Indicator (anglais)", url: "https://www.investopedia.com/terms/a/aroon.asp" },
      { title: "StockCharts — Aroon (anglais)", url: "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/aroon" },
    ],
  },
  vortex: {
    when: "Utilisez l'indicateur Vortex quand vous voulez un système de tendance basé sur des croisements inspiré des motifs de vortex naturels. Il réagit plus vite que les croisements de moyennes mobiles et donne des transitions haussières/baissières explicites via les lignes VI+ et VI−.",
    how: "VM+ = |haut − bas précédent|, VM− = |bas − haut précédent|. Sur N périodes : VI+ = somme(VM+) / somme(TR), VI− = somme(VM−) / somme(TR). Période par défaut 14 (une période de 21 ou 25 est utilisée pour des signaux plus lents). Les deux lignes oscillent généralement entre environ 0,7 et 1,3.",
    analyse: "Haussier quand VI+ croise au-dessus de VI− ; baissier au croisement inverse. Un écart qui s'élargit entre les deux lignes = tendance forte ; des lignes rapprochées ou entrelacées = marché faible ou en range. Combinez avec l'ADX pour éviter les signaux en conditions plates, ou avec le volume pour confirmer les cassures. Fonctionne bien sur les graphiques journaliers et hebdomadaires.",
    links: [
      { title: "Investopedia — Vortex Indicator (VI) (anglais)", url: "https://www.investopedia.com/terms/v/vortex-indicator-vi.asp" },
      { title: "StockCharts — Vortex Indicator (anglais)", url: "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/vortex-indicator" },
    ],
  },
  tii: {
    when: "Utilisez le Trend Intensity Index quand vous voulez un oscillateur borné unique qui répond à la question « l'actif est-il en tendance ou en range ? » — M.H. Pee l'a conçu pour quantifier à quel point les écarts récents du prix par rapport à une moyenne de long terme sont déséquilibrés.",
    how: "Calcule SMA(clôture, majorPeriod), puis pour chaque barre mesure écart = clôture − SMA. Sur les dernières minorPeriod barres (typiquement majorPeriod / 2), somme les écarts positifs (sumPos) et les écarts négatifs en valeur absolue (sumNeg). TII = 100 × sumPos / (sumPos + sumNeg). Défauts 60/30. Tracé de 0 à 100 dans son panneau dédié.",
    analyse: "Au-dessus de 80 = tendance haussière forte ; sous 20 = tendance baissière forte ; près de 50 = pas de tendance claire (consolidation). Mieux utilisé avec un système de tendance directionnel : ne prendre des entrées longues que lorsque TII > 80, shorts quand TII < 20. Contrairement à l'ADX, le TII a une direction claire via sa position autour de 50, ce qui le rend plus facile à lire d'un coup d'œil.",
    links: [
      { title: "Investopedia — Trend Intensity Index (anglais)", url: "https://www.investopedia.com/terms/t/trend_intensity_index.asp" },
      { title: "Stocks & Commodities — article original de M.H. Pee (anglais)", url: "https://store.traders.com/v20c6tii.html" },
    ],
  },
  zscore: {
    when: "Utilisez le score Z du prix quand vous voulez un oscillateur de retour à la moyenne statistiquement fondé — il indique de combien d'écarts-types la clôture s'écarte de sa moyenne glissante, rendant les extrêmes directement comparables entre actifs et horizons.",
    how: "Pour chaque barre, calculez SMA(clôture, N) et l'écart-type population σ des N dernières clôtures, puis Z = (clôture − SMA) / σ. Période par défaut 20. Tracé dans son panneau autour d'une ligne zéro ; bornes typiques ±3.",
    analyse: "|Z| > 2 = étirement statistique (queue d'environ 5 %), |Z| > 3 = extrême. Retour à la moyenne classique : fader |Z| > 2 vers zéro, sortir près de la moyenne. Les franchissements de zéro peuvent aussi servir de confirmation de tendance. La méthode suppose que la distribution des rendements est à peu près stationnaire — en tendance, Z peut rester étiré longtemps, combinez donc avec un filtre de tendance (ADX, pente de SMA) avant de fader agressivement.",
    links: [
      { title: "Investopedia — Z-Score (anglais)", url: "https://www.investopedia.com/terms/z/zscore.asp" },
      { title: "QuantStart — Mean reversion with Z-scores (anglais)", url: "https://www.quantstart.com/articles/Basics-of-Statistical-Mean-Reversion-Testing/" },
    ],
  },
  bbPctB: {
    when: "Utilisez Bollinger %B quand vous voulez une version normalisée des Bandes de Bollinger — il répond à « où se situe le prix à l'intérieur des bandes ? » sur une échelle propre 0–1, ce qui rend les divergences et les setups de retour à la moyenne plus lisibles que les bandes elles-mêmes.",
    how: "Calcule les Bandes de Bollinger (SMA(période) ± écart-type × σ). Puis %B = (clôture − inférieure) / (supérieure − inférieure). Défauts : période 20, écart-type 2. Tracé dans son panneau avec lignes de référence à 0 (bande inférieure), 0,5 (SMA centrale) et 1 (bande supérieure).",
    analyse: "%B > 1 = prix au-dessus de la bande supérieure (excès, fade potentiel ou continuation de tendance) ; %B < 0 = sous la bande inférieure. Les divergences fonctionnent bien : prix qui fait un nouveau sommet mais %B fait un sommet plus bas = essoufflement haussier. En tendance forte, %B peut rester dans la zone 0,8–1+ pendant des semaines (ne pas shorter aveuglément). Combinez avec volume ou momentum pour confirmer.",
    links: [
      { title: "Investopedia — Bollinger %B (anglais)", url: "https://www.investopedia.com/terms/b/bollinger-bands.asp" },
      { title: "StockCharts — %B Indicator (anglais)", url: "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/bollinger-band-percent-b-b" },
    ],
  },
  hurst: {
    when: "Utilisez l'exposant de Hurst (avancé) pour répondre à une méta-question : quel type de marché est-ce ? En tendance, en retour à la moyenne ou aléatoire ? Il guide quelles stratégies ont des chances de fonctionner avant d'engager du capital. Fenêtres longues uniquement — Hurst est bruité sur données courtes.",
    how: "Pour chaque barre, prenez les N derniers log-rendements et exécutez une analyse d'étendue réajustée (R/S) à plusieurs échelles dyadiques (8, 16, 32, ... jusqu'à N/2). Pour chaque échelle, calculez la moyenne R/S sur des blocs non chevauchants. Tracez log(R/S) vs log(échelle) ; la pente de la régression linéaire est l'exposant de Hurst H. Lookback par défaut 100 (plus long = plus fiable).",
    analyse: "H > 0,5 = série persistante / en tendance (les stratégies de momentum ont un avantage). H < 0,5 = anti-persistante / en retour à la moyenne (fader les extrêmes, pairs trading, fades de Z-score fonctionnent mieux). H ≈ 0,5 = marche aléatoire (aucun avantage ; éviter de trader le bruit). La plupart des indices actions se situent autour de 0,55–0,65 en phases de tendance, plus près de 0,45–0,5 en range. À utiliser comme filtre de régime, pas comme signal d'entrée — les valeurs sous ~20 barres de données sont peu fiables.",
    links: [
      { title: "Wikipedia — Exposant de Hurst", url: "https://fr.wikipedia.org/wiki/Exposant_de_Hurst" },
      { title: "QuantStart — Hurst Exponent in Python (anglais)", url: "https://www.quantstart.com/articles/Basics-of-Statistical-Mean-Reversion-Testing/" },
    ],
  },
};

export const TA_GUIDE: Record<Lang, Record<IndicatorKind, TaGuideEntry>> = {
  en: TA_GUIDE_EN,
  fr: TA_GUIDE_FR,
};
