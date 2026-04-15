import type { IndicatorKind } from "@/lib/indicator-defaults";

export type TaLink = { title: string; url: string };

export type TaGuideEntry = {
  when: string;
  how: string;
  analyse: string;
  links: TaLink[];
};

export const TA_GENERAL_LINKS: TaLink[] = [
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
];

export const TA_GUIDE: Record<IndicatorKind, TaGuideEntry> = {
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
};
