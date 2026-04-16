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
};

const TA_GUIDE_FR: Record<IndicatorKind, TaGuideEntry> = {
  sma: {
    when: "Utilisez la moyenne mobile simple pour lisser le bruit et visualiser la tendance sous-jacente sur une fenêtre fixe. C'est le filtre de tendance de référence auquel la plupart des autres indicateurs sont comparés.",
    how: "Choisissez une période adaptée à votre horizon : 20 pour le swing trading, 50 pour la tendance moyen terme, 200 pour la tendance institutionnelle long terme. Tracée en surimpression sur le prix, la ligne pondère également chaque clôture de la fenêtre.",
    analyse: "Prix au-dessus d'une SMA ascendante = tendance haussière, sous une SMA descendante = tendance baissière. Les croisements entre deux SMA (p. ex. 50/200, « golden cross » / « death cross ») sont des signaux classiques de changement de régime. Comme chaque barre a le même poids, la SMA réagit lentement — en retard sur les retournements, mais résistante aux pics d'une seule barre.",
    links: [
      { title: "Investopedia — Simple Moving Average (SMA)", url: "https://www.investopedia.com/terms/s/sma.asp" },
      { title: "Wikipédia — Moyenne mobile", url: "https://fr.wikipedia.org/wiki/Moyenne_mobile" },
    ],
  },
  ema: {
    when: "Utilisez l'EMA quand vous voulez une moyenne mobile qui réagit plus vite que la SMA aux données récentes — utile pour le suivi de tendance court terme ou comme brique d'oscillateurs (le MACD utilise des EMA).",
    how: "Choisissez la période comme pour une SMA. L'EMA applique des poids exponentiellement décroissants, la clôture la plus récente pesant le plus. Paires courantes : 12/26 (intraday/swing), 50/200 (tendance longue).",
    analyse: "Le croisement prix/EMA, ou le croisement entre deux EMA, signale un changement de tendance plus tôt que la SMA équivalente — au prix de plus de faux signaux en marché agité. La pente de l'EMA est en elle-même une lecture de momentum : une EMA plate signale l'essoufflement de la tendance.",
    links: [
      { title: "Investopedia — Exponential Moving Average (EMA)", url: "https://www.investopedia.com/terms/e/ema.asp" },
      { title: "Wikipédia — Moyenne mobile exponentielle", url: "https://fr.wikipedia.org/wiki/Moyenne_mobile#Moyenne_mobile_exponentielle" },
    ],
  },
  rma: {
    when: "Utilisez la moyenne mobile de Wilder (RMA) quand vous voulez un lissage de type EMA qui réagit encore plus lentement — c'est le lissage intégré au RSI, à l'ATR et à l'ADX. Indiquée pour filtrer le bruit sans subir le retard d'une longue SMA.",
    how: "La RMA utilise un alpha de 1/N (contre 2/(N+1) pour l'EMA), donc une RMA(14) lisse beaucoup plus qu'une EMA(14). Pour comparer, considérez la période comme équivalente à environ une EMA de 2N périodes.",
    analyse: "Lisez-la comme une EMA — pente et croisements prix/ligne — mais attendez-vous à moins de signaux et un retard plus long. Surtout utile comme lisseur dans un autre calcul, rarement comme signal autonome.",
    links: [
      { title: "Investopedia — Wilder's DMI/ADX (introduit le lissage de Wilder)", url: "https://www.investopedia.com/terms/w/wilders-dmi-adx.asp" },
      { title: "Wikipédia — Moyenne mobile modifiée", url: "https://fr.wikipedia.org/wiki/Moyenne_mobile" },
    ],
  },
  wma: {
    when: "Utilisez la moyenne mobile pondérée (WMA) comme compromis entre SMA et EMA : plus rapide que la SMA, plus lisse que l'EMA, avec des poids décroissant linéairement au lieu d'une décroissance exponentielle.",
    how: "Chaque barre de la fenêtre reçoit un poids égal à sa position (la plus récente = N, la plus ancienne = 1), divisé par la somme des poids. Le choix de la période suit les mêmes règles que les autres moyennes mobiles.",
    analyse: "Utilisez les croisements prix/ligne et la pente comme pour la SMA ou l'EMA. La WMA suit le prix plus fidèlement que la SMA tout en restant moins hachée que l'EMA, ce qui la rend populaire pour les filtres de tendance courte où le retard est le principal reproche fait à la SMA.",
    links: [
      { title: "Investopedia — Weighted Average", url: "https://www.investopedia.com/terms/w/weightedaverage.asp" },
      { title: "Wikipédia — Moyenne mobile pondérée", url: "https://fr.wikipedia.org/wiki/Moyenne_mobile" },
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
      { title: "Wikipédia — Indice de force relative", url: "https://fr.wikipedia.org/wiki/Indice_de_force_relative" },
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
    when: "Utilisez les bandes de Bollinger pour lire la volatilité et repérer quand le prix est statistiquement tendu. Particulièrement utile sur les instruments qui oscillent dans une fourchette.",
    how: "Bande médiane = SMA(N), bandes haute/basse = médiane ± K·écart-type(N). Valeurs par défaut : période 20, écart-type 2. La largeur des bandes s'adapte automatiquement à la volatilité récente.",
    analyse: "Un « squeeze » (bandes resserrées, faible volatilité) précède souvent une cassure — direction inconnue, mais un grand mouvement est statistiquement dû. Les touches sur les bandes signalent un excès mais ne sont pas des signaux de retournement isolés ; combinez avec le RSI ou un motif de chandelier. « Marcher la bande » (prix qui longe la bande haute) est une signature de tendance forte, pas un signal de sortie.",
    links: [
      { title: "Investopedia — Bollinger Bands", url: "https://www.investopedia.com/terms/b/bollingerbands.asp" },
      { title: "Wikipédia — Bandes de Bollinger", url: "https://fr.wikipedia.org/wiki/Bandes_de_Bollinger" },
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
    when: "Utilisez l'oscillateur stochastique dans les marchés en range ou cycliques pour chronométrer les entrées sur les extrêmes de surachat/survente. Il complète le RSI — il capte des retournements que le RSI rate sur les courts horizons.",
    how: "%K = 100·(clôture − plus bas N) / (plus haut N − plus bas N), lissé sur M périodes. %D = SMA(%K, P). Valeurs par défaut 14/3/3. Tracé sur 0–100 dans son panneau.",
    analyse: "Au-dessus de 80 = surachat, sous 20 = survente. Le signal classique est un croisement %K/%D dans ces zones : %K qui coupe %D en dessous de 20 = achat, %K qui coupe %D au-dessus de 80 = vente. La divergence (prix nouveau sommet, stochastique non) est un avertissement fort de retournement. En tendance forte, le stochastique peut rester collé aux extrêmes — combinez avec l'ADX comme filtre de tendance.",
    links: [
      { title: "Investopedia — Stochastic Oscillator", url: "https://www.investopedia.com/terms/s/stochasticoscillator.asp" },
      { title: "Wikipédia — Oscillateur stochastique", url: "https://fr.wikipedia.org/wiki/Oscillateur_stochastique" },
    ],
  },
  stochRsi: {
    when: "Utilisez le Stochastic RSI quand le RSI classique est trop lent pour capter les retournements à cycle court. C'est l'amplificateur de sensibilité du RSI — plus rapide, plus bruité.",
    how: "Applique la formule du stochastique aux valeurs du RSI au lieu du prix : (RSI − plus bas RSI N) / (plus haut RSI N − plus bas RSI N). Période par défaut 14. Sortie sur 0–1 (ou 0–100 selon la bibliothèque).",
    analyse: "Traitez les extrêmes comme le stochastique — au-dessus de 0,8 surachat, sous 0,2 survente — mais attendez-vous à plus de faux signaux. Surtout utile en range ; en tendance, le StochRSI se colle aux extrêmes et devient peu fiable. Associez-le au RSI pour les divergences ou à l'ADX pour filtrer les tendances.",
    links: [
      { title: "Investopedia — Stochastic RSI (StochRSI)", url: "https://www.investopedia.com/terms/s/stochrsi.asp" },
      { title: "StockCharts — StochRSI (anglais)", url: "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/stochrsi" },
    ],
  },
  williamsR: {
    when: "Utilisez le Williams %R comme oscillateur de momentum quand vous voulez une lecture surachat/survente de type stochastique, sans lissage %D. Populaire pour les retournements courts.",
    how: "%R = −100·(plus haut N − clôture) / (plus haut N − plus bas N). Défaut 14. Tracé sur une échelle inversée −100 à 0 dans un panneau dédié.",
    analyse: "Au-dessus de −20 = surachat, sous −80 = survente. Les mouvements sont mécaniquement le miroir du %K stochastique. En tendance forte il reste collé aux extrêmes, donc utilisez-le avec un filtre de tendance (ADX ou pente d'une moyenne mobile). La divergence avec le prix précède souvent les retournements, comme le RSI ou le stochastique.",
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
    when: "Utilisez le MA Cross pour visualiser les changements de régime entre une moyenne mobile rapide et une lente sur le graphique. La paire classique SMA 50/200 produit le fameux Golden Cross (haussier) et le Death Cross (baissier) — utile comme filtre de tendance long terme. Des paires courtes (p. ex. EMA 9/21) fournissent des déclencheurs de swing trading.",
    how: "Choisissez une période rapide et une lente (par défaut 50/200) et le type de MM (SMA pour des signaux plus lisses, EMA pour réagir plus vite). Deux lignes sont tracées sur le panneau de prix. À chaque croisement, un marqueur haussier (↑) ou baissier (↓) est posé sur la bougie correspondante.",
    analyse: "Des marqueurs haussiers au-dessus d'un prix ascendant suggèrent un changement de régime à la hausse ; des marqueurs baissiers dans une structure descendante confirment la distribution. Les croisements près de MM plates ou enchevêtrées sont de faible qualité — plus l'écart s'élargit après le croisement, plus le signal est fort. Confirmez par un ADX qui monte ou un volume qui augmente avant d'agir sur un croisement isolé.",
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
};

export const TA_GUIDE: Record<Lang, Record<IndicatorKind, TaGuideEntry>> = {
  en: TA_GUIDE_EN,
  fr: TA_GUIDE_FR,
};
